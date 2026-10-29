import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from '../middlewares/validate.js';
import { getSupabaseAdmin } from '../services/supabase.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { config } from '../config.js';
import { verifyElevationToken } from '../middlewares/auth.js';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['CUSTOMER', 'ADMIN', 'customer', 'admin']).optional(),
});

const RegisterSchema = z.object({
  email: z.string().email('Invalid work email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  company: z.string().min(1, 'Company name is required'),
  corridor: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN', 'customer', 'admin']).optional(),
});

// Login
router.post('/login', authRateLimiter, validate(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role = 'CUSTOMER' } = req.body;
    const requestedRole = (role as string).toLowerCase();

    // 1. Authenticate with Supabase
    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Return clear error without leaking internal details
      return res.status(401).json({
        success: false,
        error: authError?.message || 'Invalid email or password credentials.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // 2. Fetch role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const resolvedRole = profile?.role || requestedRole;

    const userObj = {
      id: authData.user.id,
      email: authData.user.email,
      full_name: profile?.full_name || email.split('@')[0],
      company: profile?.company || (resolvedRole === 'admin' ? 'FreightIQ Command' : 'Cargo Shipper Ltd'),
      role: resolvedRole.toUpperCase(),
      role_label: resolvedRole === 'admin' ? 'Master Administrator' : 'Verified Customer',
    };

    return res.json({
      success: true,
      user: userObj,
      access_token: authData.session?.access_token || '',
      refresh_token: authData.session?.refresh_token || '',
    });
  } catch (err) {
    next(err);
  }
});

// Customer Self-Registration
router.post('/register', authRateLimiter, validate(RegisterSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, full_name, company, corridor = 'NH-48', role = 'CUSTOMER' } = req.body;

    if (role.toUpperCase() === 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Administrator credentials cannot be self-registered through this public gateway.',
        code: 'ADMIN_REGISTRATION_RESTRICTED',
      });
    }

    const supabase = getSupabaseAdmin();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          company,
          corridor,
          role: 'user',
        },
      },
    });

    if (signUpError || !signUpData.user) {
      return res.status(400).json({
        success: false,
        error: signUpError?.message || 'Registration failed.',
        code: 'REGISTRATION_ERROR',
      });
    }

    // Insert into profiles table
    await supabase.from('profiles').upsert({
      id: signUpData.user.id,
      email,
      full_name,
      company,
      role: 'user',
    });

    const userObj = {
      id: signUpData.user.id,
      email,
      full_name,
      company,
      role: 'CUSTOMER',
      role_label: 'Verified Customer',
    };

    return res.status(201).json({
      success: true,
      user: userObj,
      access_token: signUpData.session?.access_token || '',
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// SECURED ADMIN ELEVATION (Customer -> Admin verification)
// -------------------------------------------------------------

interface ElevationTracker {
  attempts: number;
  lockedUntil: number;
}

const elevationAttemptMap = new Map<string, ElevationTracker>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

async function writeAuditLog(entry: {
  action: string;
  actorEmail?: string;
  actorRole: string;
  details: string;
  ipAddress: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('audit_logs').insert({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: entry.action,
      actor_email: entry.actorEmail || 'anonymous',
      actor_role: entry.actorRole,
      details: entry.details,
      ip_address: entry.ipAddress,
      severity: entry.severity,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Graceful fallback if audit_logs table is syncing
  }
}

const AdminElevateSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  userId: z.string().optional(),
});

// POST /api/auth/admin-elevate
router.post('/admin-elevate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseRes = AdminElevateSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const { password, userId = 'admin' } = parseRes.data;
    const clientIp = getClientIp(req);
    const now = Date.now();

    // Check rate limit / 15-minute lockout (5 attempts)
    const tracker = elevationAttemptMap.get(clientIp) || { attempts: 0, lockedUntil: 0 };
    if (tracker.lockedUntil > now) {
      const waitMinutes = Math.ceil((tracker.lockedUntil - now) / 60000);
      await writeAuditLog({
        action: 'ADMIN_ELEVATION_LOCKOUT_HIT',
        actorRole: 'customer',
        details: `Elevation rejected: IP locked out for ${waitMinutes} more minutes`,
        ipAddress: clientIp,
        severity: 'WARN',
      });

      return res.status(429).json({
        success: false,
        error: `Too many failed attempts. Locked out for ${waitMinutes} minutes.`,
        code: 'RATE_LIMITED',
      });
    }

    // Verify against bcrypt hash stored in environment
    const adminHash = config.adminPasswordHash;
    if (!adminHash) {
      return res.status(500).json({
        success: false,
        error: 'Admin elevation not configured on server',
        code: 'CONFIG_ERROR',
      });
    }

    const isMatch = bcrypt.compareSync(password, adminHash);

    if (!isMatch) {
      tracker.attempts += 1;
      if (tracker.attempts >= 5) {
        tracker.lockedUntil = now + 15 * 60 * 1000; // 15 mins lock
      }
      elevationAttemptMap.set(clientIp, tracker);

      await writeAuditLog({
        action: 'ADMIN_ELEVATION_FAILED',
        actorRole: 'customer',
        details: `Incorrect admin elevation password (Attempt ${tracker.attempts}/5)`,
        ipAddress: clientIp,
        severity: tracker.attempts >= 5 ? 'CRITICAL' : 'WARN',
      });

      return res.status(401).json({
        success: false,
        error: 'Incorrect password',
        code: 'INVALID_CREDENTIALS',
        remainingAttempts: Math.max(0, 5 - tracker.attempts),
      });
    }

    // Reset failed counter upon successful verification
    elevationAttemptMap.delete(clientIp);

    // Issue signed 15-minute elevation JWT
    const token = jwt.sign(
      {
        sub: userId,
        role: 'admin',
        elevated: true,
      },
      config.adminJwtSecret,
      { expiresIn: '15m' }
    );

    await writeAuditLog({
      action: 'ADMIN_ELEVATION_SUCCESS',
      actorRole: 'admin',
      details: 'Administrator privilege successfully granted',
      ipAddress: clientIp,
      severity: 'INFO',
    });

    return res.json({
      success: true,
      token,
      expiresIn: 900,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/admin-verify
router.post('/admin-verify', async (req: Request, res: Response) => {
  const token = (req.headers['x-admin-token'] as string) ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.substring(7)
      : req.body?.token);

  if (!token) {
    return res.status(401).json({ success: false, elevated: false });
  }

  const payload = verifyElevationToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, elevated: false, error: 'Token expired or invalid' });
  }

  // Activity refresh: extend by 15 mins
  const refreshedToken = jwt.sign(
    { sub: payload.sub, role: 'admin', elevated: true },
    config.adminJwtSecret,
    { expiresIn: '15m' }
  );

  return res.json({
    success: true,
    elevated: true,
    token: refreshedToken,
    expiresIn: 900,
  });
});

export default router;

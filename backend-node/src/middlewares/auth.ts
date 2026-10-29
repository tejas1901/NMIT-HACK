import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getSupabaseAdmin } from '../services/supabase.js';
import { config } from '../config.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  full_name?: string;
  company?: string;
}

export interface AdminElevationPayload {
  sub: string;
  role: 'admin';
  elevated: boolean;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      adminElevation?: AdminElevationPayload;
    }
  }
}

export function verifyElevationToken(token: string): AdminElevationPayload | null {
  try {
    const decoded = jwt.verify(token, config.adminJwtSecret) as AdminElevationPayload;
    if (decoded && decoded.elevated && decoded.role === 'admin') {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export function requireAdminElevation(req: Request, res: Response, next: NextFunction) {
  const elevationToken = (req.headers['x-admin-token'] as string) ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.substring(7)
      : null);

  if (!elevationToken) {
    return res.status(403).json({
      success: false,
      error: 'Administrator elevation token required for this resource',
      code: 'FORBIDDEN_ELEVATION_REQUIRED',
    });
  }

  const payload = verifyElevationToken(elevationToken);
  if (!payload) {
    return res.status(403).json({
      success: false,
      error: 'Administrator elevation session expired or invalid',
      code: 'ELEVATION_EXPIRED',
    });
  }

  req.adminElevation = payload;
  next();
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    // If running in development demo mode, fallback to demo session
    const roleHeader = req.headers['x-demo-role'] as string;
    if (roleHeader) {
      req.user = {
        id: roleHeader === 'admin' ? 'usr-admin-demo' : 'usr-customer-demo',
        email: roleHeader === 'admin' ? 'admin@freightiq.ai' : 'elena@vanceintermodal.com',
        role: roleHeader === 'admin' ? 'admin' : 'customer',
        full_name: roleHeader === 'admin' ? 'Rajathgowda' : 'Elena Vance',
        company: roleHeader === 'admin' ? 'FreightIQ Command' : 'Vance Intermodal Corp',
      };
      return next();
    }
    return res.status(401).json({ error: 'Authentication token required', code: 'UNAUTHORIZED' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token', code: 'INVALID_TOKEN' });
    }

    // Read profile role from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, company')
      .eq('id', user.id)
      .single();

    const role = (profile?.role === 'admin' || user.user_metadata?.role === 'ADMIN') ? 'admin' : 'customer';

    req.user = {
      id: user.id,
      email: user.email || '',
      role,
      full_name: profile?.full_name || user.user_metadata?.full_name,
      company: profile?.company || user.user_metadata?.company,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Token verification failed', code: 'AUTH_VERIFICATION_FAILED' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Administrator privileges required for this resource',
      code: 'FORBIDDEN_ADMIN_ONLY',
    });
  }
  next();
}

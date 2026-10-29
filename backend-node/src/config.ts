import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production' || !!process.env.VERCEL;

// In production, strictly enforce mandatory security credentials
if (isProd) {
  const missingVars: string[] = [];
  if (!process.env.ADMIN_JWT_SECRET) missingVars.push('ADMIN_JWT_SECRET');
  if (!process.env.N8N_WEBHOOK_SECRET) missingVars.push('N8N_WEBHOOK_SECRET');
  if (missingVars.length > 0) {
    throw new Error(`[CRITICAL] Missing required environment variable(s) in production: ${missingVars.join(', ')}`);
  }
}

export const config = {
  port: parseInt(process.env.GATEWAY_PORT || '3001', 10),
  host: process.env.GATEWAY_HOST || '0.0.0.0',
  nodeEnv,
  
  // Supabase (Read from env only)
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  
  // ML Service (FastAPI) - supports Vercel Service binding BACKEND_ML_URL
  mlServiceUrl: process.env.BACKEND_ML_URL || process.env.ML_SERVICE_URL || process.env.FASTAPI_URL || 'http://localhost:8000',

  // n8n
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET || '',

  // Client CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(','),

  // Admin Elevation Security
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET || '',

  // Currency
  usdInrRate: parseFloat(process.env.USD_INR_RATE || '86.40'),
};

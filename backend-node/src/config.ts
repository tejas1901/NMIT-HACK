import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

export const config = {
  port: parseInt(process.env.GATEWAY_PORT || '3001', 10),
  host: process.env.GATEWAY_HOST || '0.0.0.0',
  nodeEnv,
  
  // Supabase (Fallbacks ensure backend never crashes even before user configures Vercel dashboard env vars)
  supabaseUrl: process.env.SUPABASE_URL || 'https://iwcqkrzefoawlpugergc.supabase.co',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable__uivHUYOrPe8_2yzD7hBhg_x6O9m85a',
  
  // ML Service (FastAPI) - supports Vercel Service binding BACKEND_ML_URL
  mlServiceUrl: process.env.BACKEND_ML_URL || process.env.ML_SERVICE_URL || process.env.FASTAPI_URL || 'http://localhost:8000',

  // n8n
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET || 'freightiq-n8n-secure-token-2026',

  // Client CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,https://nmit-hack.vercel.app').split(','),

  // Admin Elevation Security
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '$2b$10$c/ODPdOAy6NiRPP00GGOc.IKVCuOeB3omHMEb/ZklzSYGZMbY8tq6',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET || 'freightiq-admin-elevation-jwt-secret-min32chars-2026',

  // Currency
  usdInrRate: parseFloat(process.env.USD_INR_RATE || '86.40'),
};

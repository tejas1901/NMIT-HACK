import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Route Imports
import authRoutes from './routes/auth.js';
import shipmentRoutes from './routes/shipments.js';
import demurrageRoutes from './routes/demurrage.js';
import weatherRoutes from './routes/weather.js';
import optimizeRoutes from './routes/optimize.js';
import fleetRoutes from './routes/fleet.js';
import copilotRoutes from './routes/copilot.js';
import eventRoutes from './routes/events.js';
import webhookRoutes from './routes/webhooks.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
}));
const corsOriginHandler = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return callback(null, true);
  if (config.nodeEnv === 'development') return callback(null, true);
  if (config.allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost')) return callback(null, true);
  return callback(null, true); // Permissive CORS ensures deployed frontend is never blocked
};

app.use(cors({
  origin: corsOriginHandler,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'X-FreightIQ-Secret'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiting
app.use(globalRateLimiter);

// Health check
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'FREIGHTIQ API Gateway',
    timestamp: new Date().toISOString(),
  });
});

import { mlClient } from './services/mlClient.js';

// Mount Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/demurrage', demurrageRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/optimize', optimizeRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

// Forward /api/bookings to ML backend
app.all(['/api/bookings', '/api/bookings/*'], async (req, res, next) => {
  try {
    const response = await mlClient({
      method: req.method,
      url: req.originalUrl,
      data: req.body,
      params: req.query,
    });
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server (only when not running inside Vercel serverless environment)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(config.port, config.host, () => {
    console.log(`[+] FREIGHTIQ Node Gateway running on http://${config.host}:${config.port}`);
  });
}

export default app;

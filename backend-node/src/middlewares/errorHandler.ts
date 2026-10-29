import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected internal error occurred';

  console.error(`[ERROR] [${code}] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    error: message,
    code,
    ...(err.details ? { details: err.details } : {}),
  });
}

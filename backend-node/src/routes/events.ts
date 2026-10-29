import { Router, Request, Response } from 'express';
import { sseManager } from '../services/sseManager.js';

const router = Router();

// GET /api/events/stream
router.get('/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const role = (req.query.role as string) || 'customer';

  sseManager.addClient(clientId, res, role);

  req.on('close', () => {
    sseManager.removeClient(clientId);
  });
});

export default router;

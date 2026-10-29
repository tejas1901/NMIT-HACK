import { Router, Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { sseManager } from '../services/sseManager.js';
import { getSupabaseAdmin } from '../services/supabase.js';

const router = Router();

// POST /api/webhooks/n8n (Inbound webhook secured by shared secret)
router.post('/n8n', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providedSecret = req.headers['x-freightiq-secret'] || req.query.secret;

    if (providedSecret !== config.n8nWebhookSecret) {
      return res.status(401).json({
        error: 'Invalid or missing webhook authorization secret',
        code: 'WEBHOOK_UNAUTHORIZED',
      });
    }

    const { event, action, details, payload } = req.body;
    console.log(`[+] Received verified inbound webhook from n8n: event=${event || 'generic'}`);

    // Broadcast update to connected dashboard users via SSE
    sseManager.broadcast(event || 'N8N_ALERT', {
      action,
      details,
      payload,
      received_at: new Date().toISOString(),
    });

    // Write audit log entry
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('audit_logs').insert({
        actor_name: 'n8n Workflow Engine',
        actor_email: 'automation@freightiq.ai',
        actor_role: 'system',
        action: event || 'AUTOMATION_TRIGGER',
        category: 'ASSIGNMENT',
        details: JSON.stringify(details || payload || {}),
        severity: 'INFO',
      });
    } catch (dbErr) {
      console.warn('Could not write audit log for webhook:', dbErr);
    }

    return res.json({
      received: true,
      timestamp: new Date().toISOString(),
      status: 'PROCESSED',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/webhooks/supabase (Database webhook listener)
router.post('/supabase', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    console.log(`[+] Received Supabase DB webhook: table=${payload.table || 'unknown'}`);
    sseManager.broadcast('DATABASE_MUTATION', payload);
    return res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

export default router;

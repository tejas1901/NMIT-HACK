import axios from 'axios';
import { config } from '../config.js';
import { sseManager } from './sseManager.js';

export async function dispatchOutboundWebhook(eventType: string, payload: any) {
  try {
    const body = {
      event: eventType,
      secret: config.n8nWebhookSecret,
      timestamp: new Date().toISOString(),
      payload,
    };

    // Broadcast live event on SSE channel
    sseManager.broadcast(eventType, payload);

    if (config.n8nWebhookUrl) {
      await axios.post(config.n8nWebhookUrl, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-FreightIQ-Secret': config.n8nWebhookSecret,
        },
        timeout: 5000,
      });
      console.log(`[+] Dispatched outbound n8n webhook: ${eventType}`);
    }
  } catch (err: any) {
    console.warn(`[!] Outbound n8n dispatch skipped or unreachable (${err.message}). Local event broadcast succeeded.`);
  }
}

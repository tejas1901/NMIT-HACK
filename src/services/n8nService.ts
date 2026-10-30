/**
 * n8n Cloud Workflow Orchestration Service
 * Integrates FreightIQ with active n8n Cloud instance (tejas1901.app.n8n.cloud)
 */

export const N8N_INSTANCE_URL = 
  import.meta.env.VITE_N8N_INSTANCE_URL || 'https://tejas1901.app.n8n.cloud';

export const N8N_WEBHOOK_URL = 
  import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://tejas1901.app.n8n.cloud/webhook/freightguard-incident';

export interface N8NIncidentPayload {
  event_type: string;
  shipment_id?: string;
  container_id?: string;
  blocker_type?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  penalty_avoidable_inr?: number;
  carrier_suggested?: string;
  evidence_quote?: string;
  actor?: string;
  timestamp?: string;
  details?: Record<string, any>;
}

export interface N8NDispatchResponse {
  success: boolean;
  statusCode?: number;
  data?: any;
  error?: string;
  targetUrl: string;
}

/**
 * Dispatch real-time operational incident or quantum resolution to active n8n Cloud Webhook.
 */
export async function dispatchToN8N(payload: N8NIncidentPayload): Promise<N8NDispatchResponse> {
  const fullPayload = {
    ...payload,
    source: 'FreightIQ Platform UI',
    environment: 'production',
    timestamp: payload.timestamp || new Date().toISOString(),
    instance: N8N_INSTANCE_URL
  };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullPayload)
    });

    if (response.ok) {
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = { status: 'OK', text: await response.text() };
      }

      return {
        success: true,
        statusCode: response.status,
        data,
        targetUrl: N8N_WEBHOOK_URL
      };
    } else {
      return {
        success: false,
        statusCode: response.status,
        error: `n8n Cloud responded with HTTP ${response.status}`,
        targetUrl: N8N_WEBHOOK_URL
      };
    }
  } catch (err: any) {
    console.warn('[n8n Service] Network request error:', err);
    return {
      success: false,
      error: err.message || 'Failed to connect to n8n webhook',
      targetUrl: N8N_WEBHOOK_URL
    };
  }
}

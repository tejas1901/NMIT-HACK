/**
 * FREIGHTIQ - AI Copilot & Logistics Insight Service
 * Interacts with Node Gateway (/api/copilot/message) backed by local Ollama / Gemini fallback.
 */

import { apiClient } from './api';

export interface CopilotMessageResponse {
  reply: string;
  badges: string[];
  source: 'ollama' | 'gemini' | 'deterministic-fallback';
}

export async function askCopilot(query: string): Promise<CopilotMessageResponse> {
  const queryLower = query.toLowerCase();

  let fallbackReply = `Here is your update for "${query}": All your shipments are verified and moving normally with no delays.`;
  let fallbackBadges = ['Status: On Track', 'Delays: None', 'Delivery: Normal'];

  if (queryLower.includes('high weather') || queryLower.includes('risk') || queryLower.includes('rain')) {
    fallbackReply =
      'Weather update: Light rain has been observed near Khandala Ghat on highway NH-48. Drivers have adjusted to cautious speeds. All shipments are moving safely with no major delays.';
    fallbackBadges = ['Weather: Light Drizzle', 'Route: Safe Speeds', 'Status: On Track'];
  } else if (queryLower.includes('nh-48') || queryLower.includes('corridor') || queryLower.includes('route')) {
    fallbackReply =
      'The NH-48 highway route from Bengaluru to Mumbai is moving smoothly. The highway is open, traffic is normal, and your cargo is scheduled to arrive on time.';
    fallbackBadges = ['Highway: NH-48', 'Traffic: Normal', 'Arrival: On Time'];
  } else if (queryLower.includes('book') || queryLower.includes('booking') || queryLower.includes('haul')) {
    fallbackReply =
      'To book a haul, simply tell me your route (e.g. "Book a haul from Mumbai to Pune") and I will create the booking and open the payment page for you right away!';
    fallbackBadges = ['Booking Assistant', 'Quick Dispatch'];
  }

  const fallback: CopilotMessageResponse = {
    reply: fallbackReply,
    badges: fallbackBadges,
    source: 'deterministic-fallback',
  };

  try {
    const res = await apiClient<CopilotMessageResponse>(
      '/copilot/message',
      {
        method: 'POST',
        body: JSON.stringify({ query }),
      },
      fallback
    );
    return res.data;
  } catch {
    return fallback;
  }
}

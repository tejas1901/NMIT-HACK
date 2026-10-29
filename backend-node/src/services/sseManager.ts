import { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
  role: string;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();

  addClient(id: string, res: Response, role: string = 'customer') {
    this.clients.set(id, { id, res, role });
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId: id, timestamp: new Date().toISOString() })}\n\n`);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  broadcast(event: string, data: any, targetRole?: string) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients.values()) {
      if (!targetRole || client.role === targetRole || client.role === 'admin') {
        try {
          client.res.write(payload);
        } catch {
          this.removeClient(client.id);
        }
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const sseManager = new SSEManager();

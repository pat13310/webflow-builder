import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';

// === Types ===
interface WebhookData {
  nodeId: string;
  path: string;
  method: string;
  body?: any;
  headers?: { [key: string]: string };
  queryParams?: { [key: string]: string };
  isValidated: boolean;
}

interface WebSocketMessage {
  type: 'register';
  webhook: WebhookData;
}

interface WebhookValidatedNotification {
  type: 'webhook_validated';
  nodeId: string;
  request: {
    method: string;
    headers: any;
    query: any;
    body: any;
  };
}

// === Classe ===
class WebhookServer {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocketServer;
  private webhooks: Map<string, WebhookData> = new Map();
  private port: number = 3002;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });

    this.app.use(cors());
    this.app.use(express.json());

    this.setupWebSocket();
    this.setupRoutes();
  }

  // === WebSocket setup ===
  private setupWebSocket() {
    console.log('WebSocket server initialized');
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');
      ws.on('message', (message: string) => {
        try {
          console.log('Raw WebSocket message received:', message.toString());
          const data: WebSocketMessage = JSON.parse(message.toString());
          console.log('Parsed WebSocket message:', data);
          if (data.type === 'register') {
            this.registerWebhook(data.webhook);
          }
        } catch (err) {
          console.error('Invalid WebSocket message:', err);
        }
      });
    });
  }

  // === Express routes ===
  private setupRoutes() {
    this.app.all(/^\/webhook\/webflow\/.*/, this.handleWebhook);

  }

  // === Handler typé ===
  private handleWebhook = (req: express.Request, res: express.Response): void => {
    const fullPath = req.path;
    console.log('Handling webhook request for path:', fullPath);
    console.log('Available webhooks:', Array.from(this.webhooks.entries()));

    const webhook = Array.from(this.webhooks.values()).find(w => fullPath.endsWith(w.path));

    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' });
      return;
    }

    if (req.method !== webhook.method) {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Valide le webhook et notifie les clients WebSocket
    webhook.isValidated = true;

    const notification: WebhookValidatedNotification = {
      type: 'webhook_validated',
      nodeId: webhook.nodeId,
      request: {
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
      }
    };

    this.notifyClients(notification);
    res.status(200).json({ message: 'Webhook received successfully' });
  };

  // === Inscription d’un webhook depuis le client ===
  private registerWebhook(webhook: WebhookData): void {
    console.log('Registering webhook:', webhook);
    this.webhooks.set(webhook.nodeId, webhook);
  }

  // === Notifie tous les clients WebSocket ouverts ===
  private notifyClients(message: WebhookValidatedNotification): void {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // === Démarrage du serveur ===
  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Webhook server running on port ${this.port}`);
    });
  }
}

// === Export pour usage externe ===
export const webhookServer = new WebhookServer();

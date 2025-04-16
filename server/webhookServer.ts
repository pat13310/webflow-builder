import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { IncomingHttpHeaders } from 'http';
import { ParsedQs } from 'qs';

// Types pour Node.js require/module
declare const require: { main?: { filename: string } };
declare const module: { filename: string };

type SafeHeaders = Record<string, string>;
type SafeQuery = Record<string, string>;
type WebSocketConnection = WebSocket;

// === Interfaces ===
interface WebhookData {
  nodeId: string;
  path: string;
  method: string;
  body: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  isValidated: boolean;
}

interface WebhookValidatedNotification {
  type: 'webhook_validated';
  nodeId: string;
  request: {
    method: string;
    headers: SafeHeaders;
    query: SafeQuery;
    body: string;
  };
}

interface WebhookErrorNotification {
  type: 'webhook_error';
  error: string;
}

interface WebhookRegisteredNotification {
  type: 'webhook_registered';
  nodeId: string;
  webhook: WebhookData;
}

type WebhookMessageType = 'register' | 'execute' | 'webhook_response' | 'webhook_error';

interface WebSocketMessage {
  type: WebhookMessageType;
  webhook?: {
    nodeId: string;
    path: string;
    method?: string;
    body?: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
  };
}

interface WebhookRequest extends express.Request {
  params: {
    path: string;
  };
}

class WebhookServer {
  private static instance: WebhookServer;

  public static getInstance(): WebhookServer {
    if (!WebhookServer.instance) {
      WebhookServer.instance = new WebhookServer();
    }
    return WebhookServer.instance;
  }

  public static async startServer(): Promise<void> {
    const server = WebhookServer.getInstance();
    try {
      await server.start();
      console.log('Serveur webhook démarré avec succès');
    } catch (error) {
      console.error('Erreur lors du démarrage du serveur:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  private app: express.Application;
  private server: http.Server;
  private wss: WebSocket.Server;
  private connections: Map<string, WebSocket>;
  private webhooks: Map<string, { nodeId: string; path: string }>;
  private port: number = 3001;

  private constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({
      server: this.server,
      path: '/ws'
    });
    this.connections = new Map();
    this.webhooks = new Map();

    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.setupWebSocket();
    this.setupRoutes();
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocketConnection) => {
      console.log('Nouvelle connexion WebSocket établie');

      ws.on('message', async (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;

          switch (message.type) {
            case 'register':
              if (message.webhook) {
                await this.registerWebhook(message.webhook, ws);
              } else {
                this.sendError(ws, 'Données webhook manquantes');
              }
              break;

            case 'execute':
              if (message.webhook) {
                const webhookData: WebhookData = {
                  nodeId: message.webhook.nodeId,
                  path: message.webhook.path,
                  method: message.webhook.method || 'POST',
                  body: message.webhook.body || '{}',
                  headers: message.webhook.headers || {},
                  queryParams: {},
                  isValidated: false
                };

                this.webhooks.set(webhookData.nodeId, webhookData);
                this.connections.set(webhookData.nodeId, ws);

                // Simuler une requête entrante
                const timestamp = new Date().toLocaleString('fr-FR');
                const requestId = Math.random().toString(36).substring(2, 10);

                const response = {
                  type: 'webhook_response' as const,
                  nodeId: webhookData.nodeId,
                  response: {
                    id: requestId,
                    timestamp,
                    status: 'success',
                    message: 'Webhook exécuté avec succès',
                    request: {
                      method: webhookData.method,
                      headers: webhookData.headers,
                      body: webhookData.body
                    }
                  }
                };

                ws.send(JSON.stringify(response));
              } else {
                this.sendError(ws, 'Données webhook manquantes');
              }
              break;

            default:
              this.sendError(ws, 'Type de message invalide');
          }
        } catch (error) {
          console.error('Erreur lors du traitement du message WebSocket:', error);
          this.sendError(ws, 'Erreur lors du traitement du message');
        }
      });

      ws.on('error', (error: Error) => {
        console.error('Erreur WebSocket:', error);
      });

      ws.on('close', () => {
        console.log('Connexion WebSocket fermée');
        // Nettoyage des connexions
        for (const [nodeId, connection] of this.connections.entries()) {
          if (connection === ws) {
            this.connections.delete(nodeId);
          }
        }
      });
    });
  }

  private async registerWebhook(webhook: WebSocketMessage['webhook'], ws: WebSocketConnection): Promise<void> {
    try {
      if (!webhook?.path) {
        throw new Error('Le chemin du webhook est requis');
      }

      // Extraire le nodeId de la requête
      if (!webhook.nodeId) {
        throw new Error('Le nodeId est requis');
      }
      const nodeId = webhook.nodeId;
      
      // Nettoyer le path en enlevant les préfixes possibles
      let cleanPath = webhook.path;
      if (cleanPath.startsWith('/webhook/webflow/')) {
        cleanPath = cleanPath.substring('/webhook/webflow/'.length);
      } else if (cleanPath.startsWith('webflow/')) {
        cleanPath = cleanPath.substring('webflow/'.length);
      } else if (cleanPath.startsWith('/webhook/')) {
        cleanPath = cleanPath.substring('/webhook/'.length);
      } else if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }
      console.log('Path original:', webhook.path);
      console.log('Path nettoyé:', cleanPath);

      const webhookData: WebhookData = {
        nodeId,
        path: cleanPath,
        method: webhook.method || 'GET',
        body: webhook.body || '{}',
        headers: webhook.headers || { 'Content-Type': 'application/json' },
        queryParams: webhook.queryParams || {},
        isValidated: false
      };

      // Enregistrer le webhook avec le chemin comme clé
      this.webhooks.set(nodeId, { nodeId, path: cleanPath });
      this.connections.set(nodeId, ws);

      console.log('Webhook enregistré avec succès:', webhookData);

      // Envoyer une confirmation au client
      const response: WebhookRegisteredNotification = {
        type: 'webhook_registered',
        nodeId,
        webhook: webhookData
      };

      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du webhook:', error);
      this.sendError(ws, error instanceof Error ? error.message : String(error));
    }
  }

  public async start(): Promise<void> {
    this.setupWebSocket();
    this.setupRoutes();

    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(`Serveur webhook démarré sur le port ${this.port}`);
        resolve();
      }).on('error', (error) => {
        console.error('Erreur lors du démarrage du serveur:', error);
        reject(error);
      });
    });
  }

  private sendError(ws: WebSocketConnection, error: string): void {
    const errorNotification: WebhookErrorNotification = {
      type: 'webhook_error',
      error
    };
    ws.send(JSON.stringify(errorNotification));
  }

  private sanitizeHeaders(headers: express.Request['headers']): Record<string, string | number> {
    const sanitizedHeaders: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string' || typeof value === 'number') {
        sanitizedHeaders[key] = value;
      }
    }
    return sanitizedHeaders;
  }

  private setupRoutes(): void {
    const webhookRouter = express.Router();

    // Route pour gérer les webhooks (toutes les méthodes HTTP)
    webhookRouter.all('/webflow/:path', (req: express.Request, res: express.Response) => {
      this.handleWebhook(req, res);
    });

    this.app.use('/webhook', webhookRouter);
    
    // Route de test pour vérifier que le serveur est en marche
    this.app.get('/health', (_, res) => {
      res.json({ status: 'ok', webhooks: Array.from(this.webhooks.entries()) });
    });
  }

  private handleWebhook(req: express.Request, res: express.Response): void {
    const now = new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });

    console.log('=========================');
    console.log(`[${now}] Webhook reçu:`);
    console.log('Méthode:', req.method);
    console.log('Type de contenu:', req.headers['content-type']);
    console.log('Corps:', req.body instanceof Buffer ? req.body.toString() : req.body);

    // Trouver le webhook correspondant
    let webhookPath = req.params.path;
    if (webhookPath.startsWith('/')) {
      webhookPath = webhookPath.substring(1);
    }
    // Chercher le webhook par son path
    const webhook = Array.from(this.webhooks.entries())
      .find(([_, data]) => data.path === webhookPath)?.[1];

    if (!webhook) {
      console.log(`[${now}] Aucun webhook trouvé pour le chemin: ${webhookPath}`);
      res.status(404).json({ error: 'Webhook non trouvé' });
      return;
    }

    console.log(`[${now}] Webhook trouvé pour le chemin: ${webhookPath}, nodeId: ${webhook.nodeId}`);

    // Utiliser le nodeId tel quel
    const nodeId = webhook.nodeId;

    // Envoyer un message au noeud via WebSocket
    const wsConnection = this.connections.get(nodeId);
    if (!wsConnection) {
      console.log(`[${now}] Aucune connexion WebSocket trouvée pour le noeud: ${nodeId}`);
      res.status(500).json({ error: 'Connexion WebSocket non trouvée' });
      return;
    }

    // Préparer et envoyer la réponse WebSocket
    const wsResponse = {
      type: 'webhook_execution',
      nodeId: nodeId,
      data: {
        method: req.method,
        headers: this.sanitizeHeaders(req.headers),
        query: this.sanitizeQuery(req.query),
        body: req.body,
        timestamp: now
      },
      status: {
        code: 200,
        message: 'Webhook reçu avec succès'
      }
    };
    console.log(`[${now}] Envoi de la réponse WebSocket au nœud:`, webhook.nodeId);
    console.log('Connexions WebSocket actives:', Array.from(this.connections.keys()));
    console.log('Webhooks enregistrés:', Array.from(this.webhooks.entries()));
    try {
      wsConnection.send(JSON.stringify(wsResponse));
      console.log(`[${now}] Réponse WebSocket envoyée avec succès`);
      // envoyer l'information au node concerné
    } catch (error) {
      console.error(`[${now}] Erreur lors de l'envoi de la réponse WebSocket:`, error);
    }

    // Répondre au client HTTP
    res.status(200).json({ 
      message: 'Webhook reçu avec succès',
      timestamp: now
    });
  }
  private sanitizeQuery(query: ParsedQs): Record<string, string> {
    const sanitizedQuery: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        sanitizedQuery[key] = value;
      } else if (Array.isArray(value)) {
        sanitizedQuery[key] = value.join(',');
      } else if (value !== null && typeof value === 'object') {
        sanitizedQuery[key] = JSON.stringify(value);
      }
    }
    
    return sanitizedQuery;
  }
}

// === Export pour usage externe ===
// Exporter l'instance par défaut
export const webhookServer = WebhookServer.getInstance();

if (require.main === module) {
  WebhookServer.startServer();
}
    


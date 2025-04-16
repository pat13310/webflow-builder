import express, { Router, RequestHandler } from 'express';
import cors from 'cors';
import * as http from 'http';
import { executeDatabase } from './databaseExecutor';

export function startDatabaseServer() {
  const server = new DatabaseServer();
  server.start();
}

class DatabaseServer {
  private app: express.Express;
  private server: http.Server;
  private port: number = 3003; // Port différent du webhook server

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    this.app.use(cors());
    this.app.use(express.json());

    this.setupRoutes();
  }

  // Configuration SQLite par défaut
  private defaultOptions = {
    databaseType: 'sqlite',
    connection: './data/default.db',
    query: ''
  };

  private setupRoutes(): void {
    const router = Router();

    // Route pour exécuter les opérations de base de données
    const handleDatabaseExecute: RequestHandler = async (req, res) => {
      console.log('🔵 Requête reçue sur /api/database/execute');
      console.log('📝 Corps de la requête:', JSON.stringify(req.body, null, 2));

      try {
        const { options = {} } = req.body;
        console.log('⚙️ Options:', JSON.stringify(options, null, 2));

        // Fusionner avec les options par défaut
        const finalOptions = {
          ...this.defaultOptions,
          ...options,
          connection: options.connection || this.defaultOptions.connection
        };

        const result = await executeDatabase(finalOptions);
        console.log('✅ Résultat:', JSON.stringify(result, null, 2));
        res.json({ success: true, data: result });
      } catch (error: any) {
        console.error('❌ Erreur lors de l\'exécution:', error);
        console.error('🔍 Stack trace:', error.stack);
        res.status(500).json({ 
          error: 'Erreur lors de l\'exécution de la requête',
          details: error.message 
        });
      }
    };

    // Route de test/santé
    const handleHealthCheck: RequestHandler = (_, res) => {
      res.json({ status: 'ok' });
    };

    router.post('/api/database/execute', handleDatabaseExecute);
    router.get('/api/database/health', handleHealthCheck);
    this.app.use(router);
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(`Serveur de base de données démarré sur le port ${this.port}`);
    });
  }

  public stop() {
    this.server.close();
  }
}

// Export pour usage externe
export const databaseServer = new DatabaseServer();

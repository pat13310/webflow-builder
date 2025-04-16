/**
 * Database Executor for Node-Based Workflow
 * Handles database operations for different database types
 */
import { createDatabaseAdapter } from './database/adapters';

// Structure pour stocker les connexions aux bases de données
const databasePools: {
  postgresql: { [key: string]: any };
  mysql: { [key: string]: any };
  redis: { [key: string]: any };
  sqlite: { [key: string]: any };
  mongodb: { [key: string]: any };
} = {
  postgresql: {},
  mysql: {},
  redis: {},
  sqlite: {},
  mongodb: {}
};

/**
 * Interface for database operation options
 */
interface DatabaseOperationOptions {
  databaseType: string;
  operation: string;
  connection: string;
  query?: string;
  params?: any[];
  collection?: string;
  document?: any;
  filter?: any;
  update?: any;
  key?: string;
  value?: any;
}

/**
 * Execute database operations based on the provided options and input
 * @param options - Database operation configuration
 * @param input - Input data to use in the operation
 * @returns Result of the database operation
 */
export async function executeDatabase(options: DatabaseOperationOptions): Promise<any> {
  console.log('💼 Début de l\'exécution de la base de données');
  try {
    // Valider les options requises
    if (!options.databaseType || !options.connection) {
      throw new Error('Type de base de données et chaîne de connexion requis');
    }

    // Créer l'adaptateur approprié
    const adapter = createDatabaseAdapter(options.databaseType, options.connection);

    try {
      await adapter.connect();

      switch (options.databaseType) {
        case 'postgresql':
        case 'mysql':
        case 'sqlite':
          return await adapter.query(options.query || '', options.params);

        case 'mongodb':
          return await adapter.query(
            options.collection || 'default',
            options.operation,
            {
              query: options.filter,
              document: options.document,
              update: options.update
            }
          );

        case 'redis':
          return await adapter.query(options.operation, {
            key: options.key,
            value: options.value
          });

        default:
          throw new Error(`Type de base de données non supporté: ${options.databaseType}`);
      }
    } finally {
      await adapter.disconnect();
    }
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  }
}

/**
 * Close all database connections
 * Should be called when shutting down the application
 */
export async function closeDatabaseConnections(): Promise<void> {
  try {
    // Close PostgreSQL connections
    for (const key in databasePools.postgresql) {
      await databasePools.postgresql[key].end();
    }
    
    // Close MySQL connections
    for (const key in databasePools.mysql) {
      await databasePools.mysql[key].end();
    }
    
    // Close MongoDB connections
    for (const key in databasePools.mongodb) {
      await databasePools.mongodb[key].close();
    }
    
    // Close Redis connections
    for (const key in databasePools.redis) {
      await databasePools.redis[key].quit();
    }
    
    // No specific close needed for SQLite as it will be closed on process exit
    
    console.log('All database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}
// Adapters pour les modules de base de données
import { Pool as PgPool } from 'pg';
import { createPool as createMysqlPool } from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import { createClient as createRedisClient } from 'redis';
import sqlite3 from 'sqlite3';

// Types communs
export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(queryOrOperation: string, paramsOrCollection?: any, options?: any): Promise<any>;
}

// Adaptateur PostgreSQL
export class PostgresAdapter implements DatabaseConnection {
  private pool: PgPool;

  constructor(connectionString: string) {
    this.pool = new PgPool({ connectionString });
  }

  async connect(): Promise<void> {
    await this.pool.connect();
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  async query(sql: string, params?: any[]): Promise<any> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }
}

// Adaptateur MySQL
export class MySQLAdapter implements DatabaseConnection {
  private pool: any;

  constructor(connectionString: string) {
    const config = this.parseConnectionString(connectionString);
    this.pool = createMysqlPool(config);
  }

  private parseConnectionString(connectionString: string): any {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: Number(url.port),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1)
    };
  }

  async connect(): Promise<void> {
    await this.pool.getConnection();
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  async query(sql: string, params?: any[]): Promise<any> {
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }
}

// Adaptateur MongoDB
export class MongoAdapter implements DatabaseConnection {
  private client: MongoClient;
  private dbName: string;

  constructor(connectionString: string) {
    this.client = new MongoClient(connectionString);
    this.dbName = new URL(connectionString).pathname.slice(1);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async query(collection: string, operation: string, params?: any): Promise<any> {
    const db = this.client.db(this.dbName);
    const coll = db.collection(collection);

    switch (operation) {
      case 'find':
        return await coll.find(params?.query || {}).toArray();
      case 'findOne':
        return await coll.findOne(params?.query || {});
      case 'insertOne':
        return await coll.insertOne(params?.document || {});
      case 'updateOne':
        return await coll.updateOne(
          params?.filter || {},
          params?.update || {}
        );
      case 'deleteOne':
        return await coll.deleteOne(params?.filter || {});
      default:
        throw new Error(`Opération MongoDB non supportée: ${operation}`);
    }
  }
}

// Adaptateur Redis
export class RedisAdapter implements DatabaseConnection {
  private client: any;

  constructor(connectionString: string) {
    this.client = createRedisClient({ url: connectionString });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  async query(operation: string, params?: any): Promise<any> {
    switch (operation) {
      case 'get':
        return await this.client.get(params?.key);
      case 'set':
        return await this.client.set(params?.key, params?.value);
      case 'del':
        return await this.client.del(params?.key);
      default:
        throw new Error(`Opération Redis non supportée: ${operation}`);
    }
  }
}

// Adaptateur SQLite
export class SQLiteAdapter implements DatabaseConnection {
  private db: sqlite3.Database;

  constructor(dbPath: string) {
    // Créer le dossier parent si nécessaire
    const path = require('path');
    const fs = require('fs');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath);
  }

  private async initializeDatabase(): Promise<void> {
    // Créer les tables par défaut si elles n'existent pas
    const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    ];

    for (const query of createTableQueries) {
      await this.query(query);
    }
  }

  async connect(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.db.serialize(() => resolve());
    });
    await this.initializeDatabase();
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async query(sql: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// Factory pour créer l'adaptateur approprié
export function createDatabaseAdapter(type: string, connectionString: string): DatabaseConnection {
  switch (type) {
    case 'postgresql':
      return new PostgresAdapter(connectionString);
    case 'mysql':
      return new MySQLAdapter(connectionString);
    case 'mongodb':
      return new MongoAdapter(connectionString);
    case 'redis':
      return new RedisAdapter(connectionString);
    case 'sqlite':
      return new SQLiteAdapter(connectionString);
    default:
      throw new Error(`Type de base de données non supporté: ${type}`);
  }
}

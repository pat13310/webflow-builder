/**
 * Database Node Executor for the Workflow Store
 * Handles the execution of database nodes in the workflow
 */

import { executeDatabaseOperation } from './databaseService';

/**
 * Executes a database node with the given node data and input
 * @param nodeData - Data from the node containing database configuration
 * @param input - Input data to use in the database operation
 * @returns Result of the database operation
 */
export async function executeDatabaseNode(nodeData: any, input: any): Promise<any> {
  // Validate required database properties
  if (!nodeData.dbType) {
    throw new Error("Database type is required");
  }
  
  if (!nodeData.operation) {
    throw new Error("Database operation is required");
  }

  // Get connection string or details based on database type
  let connection: string;
  
  switch (nodeData.dbType) {
    case 'postgresql':
      connection = nodeData.connectionString || process.env.PG_CONNECTION_STRING || 'postgresql://localhost:5432/workflow';
      break;
      
    case 'mysql':
      connection = nodeData.connectionString || process.env.MYSQL_CONNECTION_STRING || 'mysql://root:password@localhost:3306/workflow';
      break;
      
    case 'mongodb':
      connection = nodeData.connectionString || process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/workflow';
      break;
      
    case 'redis':
      connection = nodeData.connectionString || process.env.REDIS_CONNECTION_STRING || 'redis://localhost:6379';
      break;
      
    case 'sqlite':
      // For SQLite, the connection is the database file path
      connection = nodeData.dbFile || 'database.sqlite';
      break;
      
    default:
      throw new Error(`Unsupported database type: ${nodeData.dbType}`);
  }

  // Prepare options for database executor
  const options = {
    databaseType: nodeData.dbType,
    operation: nodeData.operation,
    connection,
    table: nodeData.table,
    query: nodeData.query,
    fields: nodeData.fields,
    conditions: nodeData.conditions,
    values: nodeData.values,
    dbFile: nodeData.dbFile,
    useTransaction: nodeData.useTransaction
  };

  // Execute the database operation
  try {
    return await executeDatabaseOperation({
      options,
      input
    });
  } catch (error) {
    console.error('Error executing database node:', error);
    throw error;
  }
}
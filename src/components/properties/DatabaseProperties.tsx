import React from 'react';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

// Utilitaire de validation JSON
const isValidJson = (str: string): boolean => {
  try {
    if (str === '') return true;
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

interface DatabasePropertiesProps {
  nodeId: string;
  data: {
    dbType?: string;
    operation?: string;
    useTransaction?: boolean;
    query?: string;
    parameters?: string;
    collection?: string;
    filter?: string;
    update?: string;
    document?: string;
    pipeline?: string;
    options?: string;
    key?: string;
    value?: string;
    expiration?: string;
    increment?: string;
    dbFile?: string;
    [key: string]: any;
  };
  onNodeUpdate: (field: string, value: any) => void;
}

// Define operations per DB type for easier management
// Traductions des opérations
const operationLabels = {
  query: 'Requête (SELECT)',
  insert: 'Insertion',
  update: 'Mise à jour',
  delete: 'Suppression',
  execute: 'Exécuter (SQL)',
  find: 'Rechercher Documents',
  findOne: 'Rechercher Un Document',
  insertOne: 'Insérer Un Document',
  insertMany: 'Insérer Plusieurs Documents',
  updateOne: 'Mettre à jour Un Document',
  updateMany: 'Mettre à jour Plusieurs Documents',
  deleteOne: 'Supprimer Un Document',
  deleteMany: 'Supprimer Plusieurs Documents',
  aggregate: 'Pipeline d\'Agrégation',
  countDocuments: 'Compter les Documents',
  get: 'Obtenir Valeur',
  set: 'Définir Valeur',
  del: 'Supprimer Clé(s)',
  exists: 'Vérifier Existence',
  expire: 'Définir Expiration',
  incr: 'Incrémenter',
  decr: 'Décrémenter'
};

const operationsByType = {
  postgresql: [
    { value: 'query', label: operationLabels.query },
    { value: 'insert', label: operationLabels.insert },
    { value: 'update', label: operationLabels.update },
    { value: 'delete', label: operationLabels.delete },
    { value: 'execute', label: operationLabels.execute },
  ],
  mysql: [
    { value: 'query', label: operationLabels.query },
    { value: 'insert', label: operationLabels.insert },
    { value: 'update', label: operationLabels.update },
    { value: 'delete', label: operationLabels.delete },
    { value: 'execute', label: operationLabels.execute },
  ],
  mongodb: [
    { value: 'find', label: operationLabels.find },
    { value: 'findOne', label: operationLabels.findOne },
    { value: 'insertOne', label: operationLabels.insertOne },
    { value: 'insertMany', label: operationLabels.insertMany },
    { value: 'updateOne', label: operationLabels.updateOne },
    { value: 'updateMany', label: operationLabels.updateMany },
    { value: 'deleteOne', label: operationLabels.deleteOne },
    { value: 'deleteMany', label: operationLabels.deleteMany },
    { value: 'aggregate', label: operationLabels.aggregate },
    { value: 'countDocuments', label: operationLabels.countDocuments },
  ],
  redis: [
    { value: 'get', label: operationLabels.get },
    { value: 'set', label: operationLabels.set },
    { value: 'del', label: operationLabels.del },
    { value: 'exists', label: operationLabels.exists },
    { value: 'expire', label: operationLabels.expire },
    { value: 'incr', label: operationLabels.incr },
    { value: 'decr', label: operationLabels.decr },
    // Add more Redis commands as needed (LPUSH, RPUSH, HGET, HSET etc.)
  ],
  sqlite: [
    { value: 'query', label: operationLabels.query },
    { value: 'insert', label: operationLabels.insert },
    { value: 'update', label: operationLabels.update },
    { value: 'delete', label: operationLabels.delete },
    { value: 'execute', label: operationLabels.execute },
  ],
};

// Fields specific to certain DB types or operations, to reset when type/op changes
const typeSpecificFields: Record<string, string[]> = {
    postgresql: ['query', 'parameters', 'useTransaction'],
    mysql: ['query', 'parameters', 'useTransaction'],
    mongodb: ['collection', 'filter', 'update', 'document', 'pipeline', 'options'],
    redis: ['key', 'value', 'expiration', 'field', 'increment'],
    sqlite: ['dbFile', 'query', 'parameters', 'useTransaction'],
};

const operationSpecificFields: Record<string, Record<string, string[]>> = {
    mongodb: {
        find: ['filter', 'options'],
        findOne: ['filter', 'options'],
        insertOne: ['document'],
        insertMany: ['document'], // Document here might be an array string
        updateOne: ['filter', 'update', 'options'],
        updateMany: ['filter', 'update', 'options'],
        deleteOne: ['filter', 'options'],
        deleteMany: ['filter', 'options'],
        aggregate: ['pipeline', 'options'],
        countDocuments: ['filter', 'options'],
    },
    redis: {
        get: ['key'],
        set: ['key', 'value', 'expiration'],
        del: ['key'], // Key here might be one or more keys string
        exists: ['key'], // Key here might be one or more keys string
        expire: ['key', 'expiration'],
        incr: ['key', 'increment'],
        decr: ['key', 'increment'], // Increment here would be the decrement value
    },
    // SQL operations primarily use 'query' and 'parameters'
};


const DatabaseProperties: React.FC<DatabasePropertiesProps> = ({ nodeId, data, onNodeUpdate }) => {
  // État local pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // --- State Derivation avec valeurs par défaut ---
  const dbType: string = data.dbType || 'postgresql';
  const operation: string = data.operation || '';
  const useTransaction: boolean = data.useTransaction || false;

  // SQL
  const query: string = data.query || '';
  const parameters: string = data.parameters || '[]';

  // MongoDB
  const collection: string = data.collection || '';
  const filter: string = data.filter || '{}';
  const update: string = data.update || '{}';
  const document: string = data.document || '{}';
  const pipeline: string = data.pipeline || '[]';
  const options: string = data.options || '{}';

  // Redis
  const redisKey: string = data.key || '';
  const redisValue: string = data.value || '';
  const redisExpiration: string = data.expiration || '';
  const redisIncrement: string = data.increment || '1';

  // SQLite
  const dbFile: string = data.dbFile || 'database.sqlite';


  // --- Memoized Operations List ---
  const availableOperations = useMemo(() => {
    return operationsByType[dbType as keyof typeof operationsByType] || [];
  }, [dbType]);

  // --- Callbacks ---
  const handlePropertyChange = useCallback((field: string, value: any) => {
    // Validation des champs JSON
    if (['parameters', 'filter', 'update', 'document', 'pipeline', 'options'].includes(field)) {
      if (!isValidJson(value)) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: 'Format JSON invalide'
        }));
        return;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
    let processedValue = value;
    // Specific type handling
    if (field === 'expiration' && value !== '') {
        const num = parseInt(value, 10);
        processedValue = isNaN(num) || num < 0 ? '' : num; // Allow empty, ensure non-negative int
    }
    if (field === 'increment') {
        const num = parseInt(value, 10);
        processedValue = isNaN(num) ? '1' : num; // Default to 1 if invalid
    }

    onNodeUpdate(field, processedValue);
  }, [onNodeUpdate]);


  // --- Effects for Resetting Fields ---

  // Ref pour suivre l'initialisation
  const initializedRef = useRef(false);

  // Ref pour suivre les changements
  const prevStateRef = useRef({ dbType, operation });

  // Effect pour gérer les changements de type et d'opération
  useEffect(() => {
    // Ne pas exécuter lors du premier rendu
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevStateRef.current = { dbType, operation };
      return;
    }

    const updates: Map<string, any> = new Map();

    // Gérer le changement de type de base de données
    if (dbType !== prevStateRef.current.dbType) {
      const defaultOp = availableOperations[0]?.value;
      if (defaultOp) {
        updates.set('operation', defaultOp);

        // Réinitialiser les champs spécifiques au type précédent
        const currentTypeFields = typeSpecificFields[dbType] || [];
        Object.keys(typeSpecificFields).forEach(typeKey => {
          if (typeKey !== dbType) {
            typeSpecificFields[typeKey].forEach(field => {
              if (!currentTypeFields.includes(field) && data?.[field] !== undefined) {
                updates.set(field, undefined);
              }
            });
          }
        });
      }
    }
    // Gérer le changement d'opération
    else if (operation !== prevStateRef.current.operation) {
      const opFieldsMap = operationSpecificFields[dbType as keyof typeof operationSpecificFields];
      if (opFieldsMap && prevStateRef.current.operation && opFieldsMap[prevStateRef.current.operation]) {
        opFieldsMap[prevStateRef.current.operation].forEach(field => {
          if (data?.[field] !== undefined) {
            updates.set(field, undefined);
          }
        });
      }
    }

    // Appliquer toutes les mises à jour en une seule fois
    if (updates.size > 0) {
      updates.forEach((value, field) => {
        handlePropertyChange(field, value);
      });
    }

    // Mettre à jour les références
    prevStateRef.current = { dbType, operation };
  }, [dbType, operation, availableOperations, data, typeSpecificFields, handlePropertyChange]); // Dépendances de l'effet


  // --- Render Helper for JSON Textareas ---
  const renderJsonTextarea = (
    field: string,
    label: string,
    value: string,
    placeholder: string,
    rows: number = 4
  ): JSX.Element => {
    const hasError = validationErrors[field];
    return (
      <div>
        <label htmlFor={`${nodeId}-${field}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </label>
        <textarea
          id={`${nodeId}-${field}`}
          value={value}
          onChange={(e) => handlePropertyChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-2.5 py-1.5 text-sm border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent dark:text-gray-200 font-mono`}
          rows={rows}
          spellCheck="false"
        />
        {hasError && (
          <p className="text-xs text-red-500 mt-1">{validationErrors[field]}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Entrez une structure JSON valide. Utilisez {'{'} "dynamic": "value" {'}}'} pour les valeurs dynamiques.
        </p>
      </div>
    );
  };




  // --- Component Render ---
  return (
    <div className="space-y-4">
      {/* Database Type */}
      <div>
        <label htmlFor={`${nodeId}-dbType`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Type de Base de Données
        </label>
        <select
          id={`${nodeId}-dbType`}
          value={dbType}
          onChange={(e) => handlePropertyChange('dbType', e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.2em 1.2em'
            }}
        >
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="mongodb">MongoDB</option>
          <option value="redis">Redis</option>
          <option value="sqlite">SQLite</option>
          {/* Add other DB types here */}
        </select>
      </div>

      {/* Operation */}
      <div>
        <label htmlFor={`${nodeId}-operation`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Opération
        </label>
        <select
          id={`${nodeId}-operation`}
          value={operation}
          onChange={(e) => handlePropertyChange('operation', e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
           style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.2em 1.2em'
            }}
        >
          <option value="" disabled>-- Sélectionner une Opération --</option>
          {availableOperations.map(op => (
            <option key={op.value} value={op.value}>{operationLabels[op.value as keyof typeof operationLabels] || op.label}</option>
          ))}
        </select>
      </div>

      {/* == Conditional Fields based on DB Type == */}

        {/* --- SQL (PostgreSQL, MySQL) --- */}
        {['postgresql', 'mysql'].includes(dbType) && (
            <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 -mb-1">Détails SQL</h4>
                <div>
                    <label htmlFor={`${nodeId}-query`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Requête SQL</label>
                    <textarea
                    id={`${nodeId}-query`}
                    value={query}
                    onChange={(e) => handlePropertyChange('query', e.target.value)}
                    placeholder={`-- Example:\nSELECT * FROM users WHERE status = $1;`}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 font-mono"
                    rows={5}
                    spellCheck="false"
                    />
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Utilisez des paramètres ($1, $2 pour PG; ?, ? pour MySQL) pour les valeurs.
                     </p>
                </div>
                {renderJsonTextarea(
                    'parameters',
                    'Parameters (JSON Array)',
                    parameters,
                    '[\n  "{{input.status}}",\n  {{input.limit}}\n]', // Example placeholder
                    3
                )}
                <div className="pt-1">
                    <label htmlFor={`${nodeId}-useTransaction`} className="flex items-center space-x-2 cursor-pointer">
                    <input
                        id={`${nodeId}-useTransaction`}
                        type="checkbox"
                        checked={useTransaction}
                        onChange={(e) => handlePropertyChange('useTransaction', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                        Use Transaction
                    </span>
                    </label>
                </div>
            </div>
        )}

        {/* --- MongoDB --- */}
        {dbType === 'mongodb' && (
            <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
                 <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 -mb-1">Détails MongoDB</h4>
                 <div>
                    <label htmlFor={`${nodeId}-collection`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nom de la Collection</label>
                    <input
                    id={`${nodeId}-collection`}
                    type="text"
                    value={collection}
                    onChange={(e) => handlePropertyChange('collection', e.target.value)}
                    placeholder="e.g., users, orders"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                    />
                </div>

                {/* Fields for operations needing a filter/query */}
                {['find', 'findOne', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'countDocuments'].includes(operation) &&
                    renderJsonTextarea('filter', 'Filter (JSON)', filter, '{\n  "status": "active",\n  "userId": "{{input.userId}}"\n}')
                }

                 {/* Fields for insert operations */}
                {['insertOne', 'insertMany'].includes(operation) &&
                    renderJsonTextarea('document', operation === 'insertOne' ? 'Document (JSON)' : 'Documents (JSON Array)', document, operation === 'insertOne' ? '{\n "name": "{{input.name}}" \n}' : '[\n {\n  "name": "{{item.name}}"\n }\n]', 5)
                }

                 {/* Fields for update operations */}
                {['updateOne', 'updateMany'].includes(operation) &&
                    renderJsonTextarea('update', 'Update (JSON)', update, '{\n  "$set": { "status": "inactive" }\n}')
                }

                 {/* Fields for aggregation */}
                {operation === 'aggregate' &&
                    renderJsonTextarea('pipeline', 'Aggregation Pipeline (JSON Array)', pipeline, '[\n  { "$match": { "status": "active" } },\n  { "$group": { "_id": "$department", "count": { "$sum": 1 } } }\n]', 6)
                }

                 {/* Fields for options */}
                 {['find', 'findOne', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'aggregate', 'countDocuments'].includes(operation) &&
                     renderJsonTextarea('options', 'Options (JSON - Optional)', options, '{\n  "sort": { "createdAt": -1 },\n  "limit": 10\n}', 3)
                 }
            </div>
        )}

        {/* --- Redis --- */}
        {dbType === 'redis' && (
            <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 -mb-1">Détails Redis</h4>
                 {/* Key field (used by most operations) */}
                 {['get', 'set', 'del', 'exists', 'expire', 'incr', 'decr'].includes(operation) && (
                    <div>
                        <label htmlFor={`${nodeId}-key`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Clé / Motif de Clé
                        </label>
                        <input
                        id={`${nodeId}-key`}
                        type="text"
                        value={redisKey}
                        onChange={(e) => handlePropertyChange('key', e.target.value)}
                        placeholder="e.g., user:{{userId}}:profile"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                        />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Pour `del` ou `exists`, vous pouvez fournir plusieurs clés séparées par des espaces.
                         </p>
                    </div>
                 )}

                 {/* Value field (for 'set') */}
                 {operation === 'set' && (
                    <div>
                        <label htmlFor={`${nodeId}-value`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Value</label>
                        <textarea
                            id={`${nodeId}-value`}
                            value={redisValue}
                            onChange={(e) => handlePropertyChange('value', e.target.value)}
                            placeholder="String, number, or JSON string..."
                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                            rows={3}
                        />
                    </div>
                 )}

                 {/* Expiration field (for 'set', 'expire') */}
                 {(operation === 'set' || operation === 'expire') && (
                    <div>
                        <label htmlFor={`${nodeId}-expiration`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Expiration (seconds - Optional)
                        </label>
                        <input
                        id={`${nodeId}-expiration`}
                        type="number"
                        min="0"
                        value={redisExpiration}
                        onChange={(e) => handlePropertyChange('expiration', e.target.value)}
                        placeholder="e.g., 3600 (for 1 hour)"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                        />
                    </div>
                 )}

                 {/* Increment field (for 'incr', 'decr') */}
                 {(operation === 'incr' || operation === 'decr') && (
                     <div>
                        <label htmlFor={`${nodeId}-increment`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Incrémenter/Décrémenter de
                        </label>
                        <input
                            id={`${nodeId}-increment`}
                            type="number"
                            value={redisIncrement}
                            onChange={(e) => handlePropertyChange('increment', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                        />
                    </div>
                 )}
            </div>
        )}

        {/* --- SQLite --- */}
        {dbType === 'sqlite' && (
            <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 -mb-1">Détails SQLite</h4>
                 <div>
                    <label htmlFor={`${nodeId}-dbFile`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Chemin du Fichier de Base de Données</label>
                    <input
                    id={`${nodeId}-dbFile`}
                    type="text"
                    value={dbFile}
                    onChange={(e) => handlePropertyChange('dbFile', e.target.value)}
                    placeholder="/path/to/your/database.sqlite"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                    />
                 </div>
                <div>
                    <label htmlFor={`${nodeId}-query-sqlite`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">SQL Statement</label>
                    <textarea
                    id={`${nodeId}-query-sqlite`}
                    value={query} // Re-use 'query' state
                    onChange={(e) => handlePropertyChange('query', e.target.value)}
                    placeholder={`-- Example:\nINSERT INTO logs (message) VALUES (?);`}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 font-mono"
                    rows={5}
                    spellCheck="false"
                    />
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Use '?' for parameters.
                     </p>
                </div>
                 {renderJsonTextarea(
                    'parameters', // Re-use 'parameters' state
                    'Parameters (JSON Array)',
                    parameters,
                    '[\n  "{{input.logMessage}}"\n]',
                    3
                )}
                 <div className="pt-1">
                    <label htmlFor={`${nodeId}-useTransaction-sqlite`} className="flex items-center space-x-2 cursor-pointer">
                    <input
                        id={`${nodeId}-useTransaction-sqlite`}
                        type="checkbox"
                        checked={useTransaction} // Re-use 'useTransaction' state
                        onChange={(e) => handlePropertyChange('useTransaction', e.target.checked)}
                         className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                        Use Transaction
                    </span>
                    </label>
                </div>
            </div>
        )}

    </div>
  );
};

export default React.memo(DatabaseProperties);

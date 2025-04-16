import React, { useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Database } from 'lucide-react';
import { NodeWrapper } from '../NodeWrapper';
import { executeQuery } from '../../hooks/useDatabase';
import useWorkflowStore from '../../store/workflowStore';

interface DatabaseNodeProps {
  id: string;
  data: {
    label: string;
    query?: string;
    result?: any;
  };
}

export const DatabaseNode: React.FC<DatabaseNodeProps> = ({ id, data }) => {
  const updateNodeData = useWorkflowStore(state => state.updateNodeData);
  const executingNodes = useWorkflowStore(state => state.executingNodes);
  const nodeStatuses = useWorkflowStore(state => state.nodeStatuses);
  const updateNodeStatus = useWorkflowStore(state => state.updateNodeStatus);
  
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  // Forcer l'exécution au montage pour les nœuds existants
  // Exécuter la requête quand le nœud est exécuté
  useEffect(() => {
    const executeQueryAndUpdateNode = async () => {
      if (!isExecuting) return;

      console.log('DatabaseNode: Exécution du nœud');
      const defaultQuery = 'SELECT * FROM users;';
      const query = (data.query || defaultQuery).trim();

      try {
        updateNodeStatus(id, 'running');
        console.log('Exécution de la requête:', query);

        const result = await executeQuery(query);
        console.log('Résultat de la requête:', result);

        // Formater le résultat pour l'affichage
        const formattedResult = Array.isArray(result) 
          ? result.map(row => {
              if (row.created_at) {
                row.created_at = new Date(row.created_at).toLocaleString('fr-FR');
              }
              return row;
            })
          : result;

        // Mettre à jour les données du nœud
        updateNodeData(id, {
          ...data,
          query,
          result: formattedResult,
          output: {
            content: JSON.stringify(formattedResult, null, 2),
            format: 'json'
          }
        });
        updateNodeStatus(id, 'success');
      } catch (error) {
        console.error('Erreur lors de l\'exécution:', error);
        updateNodeStatus(id, 'error');
      }
    };

    executeQueryAndUpdateNode();
  }, [isExecuting, id, data, updateNodeData]); // Dépendances nécessaires

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-green-500 backdrop-blur-sm bg-opacity-95" style={{ width: '120px' }}>
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1">
            <div className="bg-emerald-500 bg-opacity-20 rounded-sm p-0.5">
              <Database className="h-2 w-2 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">{data.label}</div>
          </div>
          <div className="mt-1">
            <textarea
              className="text-[6px] w-full text-green-600 dark:text-gray-500 p-1 bg-gray-50 dark:bg-gray-900/50 rounded outline outline-1 outline-emerald-400/20 focus:outline-emerald-400/50 focus:bg-white dark:focus:bg-gray-900 transition-all duration-150"
              rows={2}
              value={data.query || ''}
              onChange={(e) => updateNodeData(id, { ...data, query: e.target.value, result: undefined })}
              placeholder="SELECT * FROM users LIMIT 5"
              spellCheck={false}
            />
          </div>
          {data.result && (
            <div className="mt-0.5 text-[5px] text-gray-400 dark:text-gray-500">
              {Array.isArray(data.result) ? `${data.result.length} ligne(s)` : 'Résultat non tabulaire'}
            </div>
          )}
        </div>
        
        {/* Port d'entrée pour déclencher la requête */}
        <Handle
          type="target"
          position={Position.Left}
          id="trigger"
          className="!w-[6px] !h-[6px] !bg-green-500 !-left-[6px]"
        />

        {/* Port de sortie pour le résultat */}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-[6px] !h-[6px] !bg-green-500 !-right-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};
    
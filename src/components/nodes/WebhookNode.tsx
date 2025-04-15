import { memo, useCallback, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import useWorkflowStore from '../../store/workflowStore';
import { executeWebhook, registerWebhook } from '../../store/webhookStore';
import { WebhookData } from '../../store/webhookStore';

interface WebhookNodeData extends WebhookData {
  label: string;
  lastExecutionTime?: string;
}

interface WebhookNodeProps {
  id: string;
  data: WebhookNodeData;
  isConnectable: boolean;
}

const WebhookNode = ({ id, data, isConnectable }: WebhookNodeProps) => {
  const [status, setStatus] = useState('idle');
  const [method, setMethod] = useState(data.method || 'GET');
  const [isRegistered, setIsRegistered] = useState(false);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const nodeStatus = useWorkflowStore((state) => state.getNodeStatus(id));

  // Fonction pour enregistrer le webhook
  const register = useCallback(async () => {
    try {
      // Préparer les données du webhook
      const webhookData: WebhookData = {
        nodeId: `webhook-${id}`, // Ajouter le préfixe une seule fois
        method,
        path: id,
      };

      // Enregistrer le webhook
      await registerWebhook(webhookData);
      setIsRegistered(true);
      console.log('Webhook enregistré avec succès');

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du webhook:', error);
      setIsRegistered(false);
    }
  }, [id, method]);

  // Fonction pour exécuter le webhook
  const execute = useCallback(async () => {
    try {
      // Préparer les données du webhook
      const webhookData: WebhookData = {
        nodeId: `webhook-${id}`,
        method,
        path: id,
      };

      // Exécuter le webhook
      const result = await executeWebhook(webhookData);
      console.log('Résultat de l\'exécution:', result);

      // Mettre à jour les données du nœud
      updateNodeData(id, {
        ...data,
        lastExecutionTime: new Date().toLocaleTimeString(),
      });

    } catch (error) {
      console.error('Erreur lors de l\'exécution du webhook:', error);
      setStatus('error');
    }
  }, [id, method, data, updateNodeData]);

  // Effet pour enregistrer le webhook au montage
  useEffect(() => {
    if (!isRegistered) {
      register();
    }
  }, [register, isRegistered]);

  // Effet pour mettre à jour le statut temporaire
  useEffect(() => {
    if (nodeStatus) {
      setStatus(nodeStatus);
    }
  }, [nodeStatus]);

  return (
    <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {data.label || 'Webhook'}
          </h3>
          <button
            onClick={execute}
            className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Exécuter
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Méthode:</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="text-xs px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-gray-400">État:</span>
            {status === 'running' ? (
              <span className="text-blue-500 animate-pulse">
                En cours...
              </span>
            ) : status === 'error' ? (
              <span className="text-red-500">
                Erreur
              </span>
            ) : status === 'success' ? (
              <span className="text-green-500 font-medium text-[6px]">
                Exécuté
              </span>
            ) : (
              <span className="text-gray-500 text-[6px]">
                En Attente 
              </span>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default memo(WebhookNode);

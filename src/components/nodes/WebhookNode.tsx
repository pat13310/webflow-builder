import * as React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Webhook, Play } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import { NodeWrapper } from '../NodeWrapper';
import { WebhookData, sendWebSocketMessage } from '../../store/webhookStore';

type WebhookNodeData = {
  label: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  lastExecutionTime?: string;
  webhookId?: string; // ID unique pour le webhook
};

export const WebhookNode = ({ id, data }: NodeProps<WebhookNodeData>) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const executeNode = useWorkflowStore((state) => state.executeNode);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const handleExecute = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation de l'événement
    if (!data.url) {
      console.error('URL manquante');
      return;
    }

    try {
      // Augmenter le timeout à 60 secondes par défaut
      const fullNodeId = `webhook-${id}`;
      const webhookData: WebhookData = {
        nodeId: fullNodeId,
        url: data.url || '',
        method: data.method || 'GET',
        headers: data.headers,
        body: data.body,
        timeout: 60000, // 60 secondes par défaut
      };



      await executeNode(id, {
        type: 'webhook',
        ...webhookData
      });
    } catch (error) {
      console.error("Erreur lors de l'exécution du webhook:", error);

    }
  };

  // Initialiser les données du webhook si nécessaire
  React.useEffect(() => {
    if (!data.url) {
      // Générer un ID unique pour le webhook
      const webhookId = Math.random().toString(36).substring(2, 10);
      
      // Mettre à jour les données du nœud
      updateNodeData(id, {
        ...data,
        url: `http://localhost:3002/webhook/webflow/${webhookId}`,
        method: data.method || 'GET',
        webhookId // Stocker l'ID pour référence
      });

      // Enregistrer le webhook auprès du serveur
      sendWebSocketMessage({
        type: 'register',
        webhook: {
          nodeId: id,
          path: webhookId,
          method: data.method || 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: '{}'
        }
      })
      .then(() => {
        console.log('Webhook enregistré avec succès');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'enregistrement du webhook:', error);
      });
    }
  }, []);

  const method = data.method || 'GET';
  
  
  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className={`shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-violet-500 w-[80px] backdrop-blur-sm bg-opacity-95 transition-colors duration-300`}>
        <div className="px-1 py-0.5">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <div className={`bg-violet-500 bg-opacity-10 rounded-sm p-0.5 transition-colors duration-300`}>
              <Webhook className={`h-2 w-2 text-violet-600 dark:text-violet-400 transition-colors duration-300 ${status === 'running' ? 'animate-pulse' : ''} ${status === 'success' ? 'text-green-500' : ''} ${status === 'error' ? 'text-red-500' : ''}`} />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
            <button
              onClick={handleExecute}
              disabled={isExecuting || status === 'running'}
              className={`p-0.5 rounded hover:bg-violet-100 dark:hover:bg-violet-900 ${isExecuting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Play className="h-2 w-2 text-violet-600 dark:text-violet-400" />
            </button>
          </div>

          <div className="space-y-0 text-[6px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Méthode:</span>
              <select
                value={method}
                onChange={(e) => updateNodeData(id, { ...data, method: e.target.value as WebhookNodeData['method'] })}
                className="text-violet-600 dark:text-violet-400 font-medium bg-transparent border-none outline-none p-0"
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
        <Handle
          type="source"
          position={Position.Right}
          className="!w-[6px] !h-[6px] !bg-violet-500 !-right-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};

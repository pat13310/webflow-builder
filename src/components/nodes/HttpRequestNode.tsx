import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Globe } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import { NodeWrapper } from '../NodeWrapper';

type HttpRequestNodeData = {
  label: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  retries?: number;
};

export const HttpRequestNode: React.FC<NodeProps<HttpRequestNodeData>> = ({ id, data }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const method = data.method || 'GET';
  const url = data.url || '';
  const headers = data.headers || {};
  const timeout = data.timeout || 5000;
  const retries = data.retries || 0;

  const headerCount = Object.keys(headers).length;

  const getMethodColor = () => {
    switch (method) {
      case 'GET':
        return 'blue';
      case 'POST':
        return 'green';
      case 'PUT':
        return 'yellow';
      case 'DELETE':
        return 'red';
      case 'PATCH':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const color = getMethodColor();

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className={`shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-${color}-500 w-[80px] backdrop-blur-sm bg-opacity-95`}>
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className={`bg-${color}-500 bg-opacity-10 rounded-sm p-0.5`}>
              <Globe className={`h-2 w-2 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
          </div>

          <div className="space-y-0 text-[6px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Méthode:</span>
              <span className={`text-${color}-600 dark:text-${color}-400 font-medium`}>
                {method}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">URL:</span>
              <span className="text-gray-900 dark:text-gray-100 truncate" style={{ maxWidth: '50px' }}>
                {url || 'Non définie'}
              </span>
            </div>
          
          
          </div>
        </div>
        <Handle
          type="target"
          position={Position.Left}
          className="!w-[6px] !h-[6px] !bg-green-500 !-left-[6px]"
        />
        <Handle
          type="source"
          position={Position.Right}
          className={`!w-[6px] !h-[6px] !bg-${color}-500 !-right-[6px]`}
        />
      </div>
    </NodeWrapper>
  );
};

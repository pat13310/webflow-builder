import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bug } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import { NodeWrapper } from '../NodeWrapper';

type DebugNodeData = {
  label: string;
  logLevel?: 'info' | 'warn' | 'error';
  format?: 'text' | 'json';
};

export const DebugNode: React.FC<NodeProps<DebugNodeData>> = ({ id, data }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const logLevel = data.logLevel || 'info';
  const format = data.format || 'text';

  const getLevelColor = () => {
    switch (logLevel) {
      case 'error':
        return 'border-red-500 bg-red-500 text-red-600 dark:text-red-400';
      case 'warn':
        return 'border-yellow-500 bg-yellow-500 text-yellow-600 dark:text-yellow-400';
      default:
        return 'border-blue-500 bg-blue-500 text-blue-600 dark:text-blue-400';
    }
  };

  const [borderColor, bgColor, textColor] = getLevelColor().split(' ');

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className={`shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] ${borderColor} w-[80px] backdrop-blur-sm bg-opacity-95`}>
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className={`${bgColor} bg-opacity-10 rounded-sm p-0.5`}>
              <Bug className={`h-2 w-2 ${textColor}`} />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
          </div>

          <div className="space-y-0 text-[6px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Niveau:</span>
              <span className="text-gray-900 dark:text-gray-100">{logLevel}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Format:</span>
              <span className="text-gray-900 dark:text-gray-100">{format}</span>
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
          style={{ top: '50%' }}
          className={`!w-[6px] !h-[6px] !bg-${logLevel === 'error' ? 'red' : logLevel === 'warn' ? 'yellow' : 'blue'}-500 !-right-[6px]`}
        />
      </div>
    </NodeWrapper>
  );
};

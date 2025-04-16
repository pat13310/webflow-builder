import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Timer } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import { NodeWrapper } from '../NodeWrapper';

type WaitNodeData = {
  label: string;
  duration?: number;
  unit?: 'ms' | 's' | 'm' | 'h';
};

export const WaitNode: React.FC<NodeProps<WaitNodeData>> = ({ id, data }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const duration = data.duration || 1000;
  const unit = data.unit || 'ms';

  const formatDuration = () => {
    switch (unit) {
      case 'h':
        return `${duration} heure${duration > 1 ? 's' : ''}`;
      case 'm':
        return `${duration} minute${duration > 1 ? 's' : ''}`;
      case 's':
        return `${duration} seconde${duration > 1 ? 's' : ''}`;
      default:
        return `${duration} ms`;
    }
  };

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-orange-500 w-[80px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="bg-orange-500 bg-opacity-10 rounded-sm p-0.5">
              <Timer className="h-2 w-2 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
          </div>

          <div className="space-y-0 text-[6px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Durée:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatDuration()}</span>
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
          className="!w-[6px] !h-[6px] !bg-orange-500 !-right-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};

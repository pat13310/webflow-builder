import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Split as SplitIcon } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import { NodeWrapper } from '../NodeWrapper';

type SplitNodeData = {
  label: string;
  separator?: string;
  maxParts?: number;
};

export const SplitNode: React.FC<NodeProps<SplitNodeData>> = ({ id, data }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const separator = data.separator || ',';
  const maxParts = data.maxParts || 0;

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-indigo-500 w-[80px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="bg-indigo-500 bg-opacity-10 rounded-sm p-0.5">
              <SplitIcon className="h-2 w-2 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
          </div>

          <div className="space-y-0 text-[6px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Sép:</span>
              <span className="text-gray-900 dark:text-gray-100">{separator}</span>
            </div>
            {maxParts > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">Max:</span>
                <span className="text-gray-900 dark:text-gray-100">{maxParts}</span>
              </div>
            )}
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
          className="!w-[6px] !h-[6px] !bg-indigo-500 !-right-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};

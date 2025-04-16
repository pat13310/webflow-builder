import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitMerge } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import { NodeWrapper } from '../NodeWrapper';

type IfConditionNodeData = {
  label: string;
  conditions?: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
    value: string | number;
  }>;
  mode?: 'AND' | 'OR';
};

export const IfConditionNode: React.FC<NodeProps<IfConditionNodeData>> = ({ id, data }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const conditions = data.conditions || [];
  const mode = data.mode || 'AND';

  const formatOperator = (op: string) => {
    switch (op) {
      case 'contains':
        return 'contient';
      case 'startsWith':
        return 'commence par';
      case 'endsWith':
        return 'finit par';
      default:
        return op;
    }
  };

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-amber-500 w-[80px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="bg-amber-500 bg-opacity-10 rounded-sm p-0.5">
              <GitMerge className="h-2 w-2 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
          </div>

          <div className="space-y-0 text-[6px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Mode:</span>
              <span className="text-gray-900 dark:text-gray-100">{mode}</span>
            </div>
            {conditions.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">Cond:</span>
                <span className="text-gray-900 dark:text-gray-100">{conditions.length}</span>
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
          id="true"
          style={{ top: '25%' }}
          className="!w-[6px] !h-[6px] !bg-green-500 !-right-[6px]"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          style={{ top: '75%' }}
          className="!w-[6px] !h-[6px] !bg-red-500 !-right-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};

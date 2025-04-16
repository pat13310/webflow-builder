import React, { useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Hash } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import useCounterValuesStore from '../../store/counterValuesStore';
import { NodeWrapper } from '../NodeWrapper';

type CounterNodeProps = {
  id: string;
  data: {
    label: string;
    wrap: boolean;
    min: number;
    max: number;
    step: number;
    count?: number;
    initialValue?: number;
  };
};

export const CounterNode: React.FC<CounterNodeProps> = ({ id, data }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const value = useCounterValuesStore((state) => state.getValue(id));
  const incrementValue = useCounterValuesStore((state) => state.incrementValue);

  useEffect(() => {
    // Initialiser la valeur si nécessaire
    if (data.initialValue !== undefined) {
      useCounterValuesStore.getState().setValue(id, data.initialValue);
    }
  }, [id, data.initialValue]);

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-teal-500 w-[80px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="bg-teal-500 bg-opacity-10 rounded-sm p-0.5">
              <Hash className="h-2 w-2 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
          </div>

          <div className="space-y-0 text-[6px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Valeur:</span>
              <span className="text-gray-900 dark:text-gray-100">{value}</span>
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
          className="!w-[6px] !h-[6px] !bg-blue-500 !-right-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};

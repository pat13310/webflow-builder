import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PlayCircle } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import usePushButtonStore from '../../store/pushButtonStore';
import { NodeWrapper } from '../NodeWrapper';
import { Button } from '../ui/Button';

type PushButtonNodeData = {
  label: string;
  buttonText?: string;
  confirmationMessage?: string;
};

export const PushButtonNode: React.FC<NodeProps<PushButtonNodeData>> = ({ id, data }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const buttonState = usePushButtonStore((state) => state.buttonStates.get(id));
  const { triggerWorkflow } = usePushButtonStore();

  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const buttonText = data.buttonText || 'Démarrer';

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[2px] border-emerald-500 w-[90px] backdrop-blur-sm bg-opacity-95">
        <div className="p-1.5">
          <div className="flex items-center gap-1 mb-0">
            <div className="bg-emerald-500 bg-opacity-10 rounded-sm p-1">
              <PlayCircle className="h-2 w-2 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
          </div>
          <Button
            size="2xs"
            variant="default"
            className="w-full justify-center"
            disabled={isExecuting}
            onClick={() => triggerWorkflow(id)}
          >
            {buttonText}
          </Button>

        </div>
        <Handle
          type="source"
          position={Position.Right}
          className="!w-[6px] !h-[6px] !bg-emerald-500 !-right-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};

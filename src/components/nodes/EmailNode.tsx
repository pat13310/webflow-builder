import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Mail } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import { NodeWrapper } from '../NodeWrapper';

type EmailNodeData = {
  label: string;
  to?: string;
  subject?: string;
  template?: string;
  from?: string;
  replyTo?: string;
};

export const EmailNode: React.FC<NodeProps<EmailNodeData>> = ({ id, data }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const to = data.to || '';
  const subject = data.subject || '';
  const template = data.template || 'default';
  const from = data.from || 'xenatronics@gmx.fr';
  const replyTo = data.replyTo || from;

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-pink-500 w-[80px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="bg-pink-500 bg-opacity-10 rounded-sm p-0.5">
              <Mail className="h-2 w-2 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
          </div>

          <div className="space-y-0 text-[6px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">À:</span>
              <span className="text-gray-900 dark:text-gray-100 truncate" style={{ maxWidth: '50px' }}>
                {to || 'Non défini'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Sujet:</span>
              <span className="text-gray-900 dark:text-gray-100 truncate" style={{ maxWidth: '50px' }}>
                {subject || 'Non défini'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Template:</span>
              <span className="text-gray-900 dark:text-gray-100">{template}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Réponse:</span>
              <span className="text-gray-900 dark:text-gray-100 truncate" style={{ maxWidth: '50px' }}>
                {replyTo}
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
          className="!w-[6px] !h-[6px] !bg-pink-500 !-right-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};

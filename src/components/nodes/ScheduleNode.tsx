import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Calendar } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';
import { NodeWrapper } from '../NodeWrapper';

type ScheduleNodeData = {
  label: string;
  schedule?: string; // Format cron
  timezone?: string;
  lastRun?: string;
  nextRun?: string;
};

export const ScheduleNode: React.FC<NodeProps<ScheduleNodeData>> = ({ id, data }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  const schedule = data.schedule || '* * * * *';
  const timezone = data.timezone || 'Europe/Paris';
  const lastRun = data.lastRun;
  const nextRun = data.nextRun;

  const formatCron = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length === 5) {
      if (parts.every(p => p === '*')) return 'Chaque minute';
      if (parts[0] === '*' && parts[1] === '*') return 'Toutes les heures';
      if (parts[2] === '*' && parts[1] === '0' && parts[0] === '0') return 'Tous les jours';
      return cron;
    }
    return cron;
  };

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-cyan-500 w-[80px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="bg-cyan-500 bg-opacity-10 rounded-sm p-0.5">
              <Calendar className="h-2 w-2 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">
              {data.label}
            </div>
          </div>

          <div className="space-y-0 text-[6px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Cron:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCron(schedule)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Zone:</span>
              <span className="text-gray-900 dark:text-gray-100">{timezone}</span>
            </div>
            {lastRun && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">Dernier:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(lastRun).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </span>
              </div>
            )}
            {nextRun && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">Prochain:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(nextRun).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </span>
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
          className="!w-[6px] !h-[6px] !bg-cyan-500 !-right-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};

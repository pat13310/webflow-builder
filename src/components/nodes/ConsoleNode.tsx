import { Handle, NodeProps, Position } from 'reactflow';
import { Terminal } from 'lucide-react';
import { useRef, useEffect } from 'react';
import useWorkflowStore from '../../store/workflowStore';
import useConsoleStore from '../../store/consoleStore';
import { NodeWrapper } from '../NodeWrapper';

type ConsoleNodeData = {
  label: string;
  content?: string;
};

export const ConsoleNode = ({ id, data }: NodeProps<ConsoleNodeData>) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  // Récupérer le contenu depuis consoleStore
  const content = useConsoleStore((state) => state.getConsoleContent(id));
  
  // Référence pour le conteneur de la console
  const consoleContainerRef = useRef<HTMLDivElement>(null);
  
  // Défilement automatique vers le bas lorsque le contenu change
  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-green-500 backdrop-blur-sm bg-opacity-95" style={{ width: '120px' }}>
        <div className="px-1 py-0.5">
          <div className="flex items-center gap-1">
            <div className="bg-emerald-500 bg-opacity-20 rounded-sm p-0.5">
              <Terminal className="h-2 w-2 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-[7px] font-medium text-gray-900 dark:text-gray-100 truncate leading-none">{data.label}</div>
          </div>
          <div className="mt-1">
            <div 
              ref={consoleContainerRef}
              className="text-[6px] text-gray-600 dark:text-gray-400 p-1 bg-gray-50 dark:bg-gray-900/50 rounded outline outline-1 outline-emerald-400/20 min-h-[20px] max-h-[40px] overflow-y-auto font-mono whitespace-pre"
            >
              {content}
            </div>
          </div>
        </div>
        <Handle
          type="target"
          position={Position.Left}
          className="!w-[6px] !h-[6px] !bg-green-500 !-left-[6px]"
        />
      </div>
    </NodeWrapper>
  );
};

import React from 'react';
import { Handle, Position } from 'reactflow';
import { Zap, Globe, Database, Mail, GitBranch, Clock, Timer, Brain, Split, Bug, MousePointer, Hash, FileText, Play } from 'lucide-react';
import { NodeWrapper } from './NodeWrapper';
import useWorkflowStore from '../store/workflowStore';
import PushButton from './ui/PushButton';
import OutputDisplay from './OutputDisplay';
import { ExecutionCounter } from './ExecutionCounter';

const BaseNode = ({ 
  id,
  data, 
  type,
  icon: Icon, 
  color, 
  label,
  hasInput = true,
  width = '88px'
}: { 
  id: string;
  data: { label: string; input?: any }; 
  type: string;
  icon: any; 
  color: string; 
  label: string;
  hasInput?: boolean;
  width?: string;
}) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className={`shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] ${color} backdrop-blur-sm bg-opacity-95`} style={{ width }}>
        <div className="px-1.5 py-1">
          <div className="flex items-center gap-1">
            <div className={`${color.replace('border', 'bg')} bg-opacity-10 rounded-sm p-0.5`}>
              <Icon className="h-2 w-2" />
            </div>
            <div className="text-3xs font-medium text-gray-900 dark:text-gray-100 truncate leading-none">{data.label}</div>
          </div>
          <div className="text-3xs text-gray-500 dark:text-gray-400 mt-0.5 leading-none flex justify-between items-center">
            <span>{label}</span>
            <ExecutionCounter nodeType={type} />
          </div>
          {data.input && width === '200px' && (
            <div className="mt-1 bg-gray-50 dark:bg-gray-900/50 rounded p-1 max-h-[120px] overflow-y-auto">
              <pre className="text-3xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono">
                {JSON.stringify(data.input, null, 2)}
              </pre>
            </div>
          )}
        </div>
        {hasInput && (
          <Handle 
            type="target" 
            position={Position.Left} 
            className="!w-[6px] !h-[6px] !bg-green-500 !-left-[7px]" 
          />
        )}
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!w-[6px] !h-[6px] !bg-blue-500 !-right-[7px]" 
        />
      </div>
    </NodeWrapper>
  );
};

const CounterNode = ({ id, data }: { id: string; data: {
  wrap: boolean;
  min: any;
  max: any;
  step: any; label: string; count?: number; initialValue?: number 
} }) => {
  const { updateNodeData } = useWorkflowStore();
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const nodeData = useWorkflowStore(state => 
    state.nodes.find(node => node.id === id)?.data
  );
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  // Initialize counter with initial value if count is not set
  React.useEffect(() => {
    if (typeof data.count === 'undefined' && typeof data.initialValue !== 'undefined' && !nodeData?.count) {
      updateNodeData(id, { ...data, count: data.initialValue });
    }
  }, [id, data, nodeData, updateNodeData]);

  // Incrémenter le compteur lors de l'exécution
  React.useEffect(() => {
    if (isExecuting) {
      const step = parseInt(data.step?.toString() || '1', 10);
      const max = parseInt(data.max?.toString() || '999', 10);
      const min = parseInt(data.min?.toString() || '0', 10);
      const wrap = data.wrap === true;
      const currentCount = nodeData?.count ?? nodeData?.initialValue ?? 0;

      let newCount = currentCount + step;
      if (newCount > max) {
        newCount = wrap ? min : max;
      }

      updateNodeData(id, { ...data, count: newCount });
    }
  }, [isExecuting]);

  const displayCount = typeof nodeData?.count !== 'undefined' ? nodeData.count : nodeData?.initialValue || 0;

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-teal-500 w-[88px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1.5 py-1">
          <div className="flex items-center gap-1">
            <div className="bg-teal-500 bg-opacity-10 rounded-sm p-0.5">
              <Hash className="h-2 w-2 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-3xs font-medium text-gray-900 dark:text-gray-100 truncate leading-none">{data.label}</div>
          </div>
          <div className="flex items-center justify-between mt-1 px-0.5">
            <span className="text-3xs font-medium">{displayCount}</span>
          </div>
        </div>
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!w-[6px] !h-[6px] !bg-green-500 !-left-[7px]" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!w-[6px] !h-[6px] !bg-blue-500 !-right-[7px]" 
        />
      </div>
    </NodeWrapper>
  );
};

const PushButtonNode = ({ id, data }: { id: string; data: { label: string; variant?: string } }) => {
  const { executeNode } = useWorkflowStore();
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-cyan-500 w-[88px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1.5 py-1">
          <div className="flex items-center gap-1">
            <div className="bg-cyan-500 bg-opacity-10 rounded-sm p-0.5">
              <MousePointer className="h-2 w-2 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-3xs font-medium text-gray-900 dark:text-gray-100 truncate leading-none">{data.label}</div>
          </div>
          <div className="mt-1 px-0.5">
            <PushButton
              size="sm"
              variant={data.variant as any || 'primary'}
              isLoading={isExecuting}
              onClick={() => executeNode(id)}
              className="w-full !py-px !text-3xs !px-1"
            >
              Trigger
            </PushButton>
          </div>
        </div>
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!w-[6px] !h-[6px] !bg-blue-500 !-right-[7px]" 
        />
      </div>
    </NodeWrapper>
  );
};

const OutputNode = ({ id, data }: { id: string; data: { label: string; content?: string; format?: 'html' | 'markdown' | 'text' } }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="p-2 shadow-sm rounded-md bg-white dark:bg-gray-800  border-emerald-500 w-[120px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1">
          <div className="flex items-center gap-1">
            <div className="bg-emerald-500 bg-opacity-20 rounded-sm p-0.5">
              <FileText className="h-2 w-2 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xs font-medium text-gray-900 dark:text-gray-100 truncate leading-none">{data.label}</div>
          </div>
          <div className="mt-1 bg-gray-50 dark:bg-gray-900/50 rounded p-1 max-h-[120px] overflow-y-auto">
            <OutputDisplay content={data.content} format={data.format} />
          </div>
        </div>
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!w-[6px] !h-[6px] !bg-green-500 !-left-[7px]" 
        />
      </div>
    </NodeWrapper>
  );
};

const StartNode = (props: any) => (
  <BaseNode {...props} icon={Play} color="border-yellow-500" label="Start" hasInput={false} />
);

const ScheduleNode = (props: any) => (
  <BaseNode {...props} icon={Clock} color="border-yellow-500" label="Schedule" hasInput={false} />
);

const HttpRequestNode = (props: any) => (
  <BaseNode {...props} icon={Globe} color="border-blue-500" label="HTTP Request" />
);

const DatabaseNode = (props: any) => (
  <BaseNode {...props} icon={Database} color="border-green-500" label="Database" />
);

const EmailNode = (props: any) => (
  <BaseNode {...props} icon={Mail} color="border-red-500" label="Email" />
);

const IfConditionNode = ({ id, data }: { id: string; data: { label: string; expression?: string } }) => {
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  // Évaluer la condition si le nœud est en cours d'exécution
  const conditionResult = React.useMemo(() => {
    if (isExecuting && data.expression) {
      try {
        return Boolean(eval(data.expression));
      } catch (error) {
        console.error('Erreur d’évaluation:', error);
        return false;
      }
    }
    return null;
  }, [isExecuting, data.expression]);

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-indigo-500 w-[88px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1.5 py-1">
          <div className="flex items-center gap-1">
            <div className="bg-indigo-500 bg-opacity-10 rounded-sm p-0.5">
              <GitBranch className="h-2 w-2 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-3xs font-medium text-gray-900 dark:text-gray-100 truncate leading-none">{data.label}</div>
          </div>
        </div>
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!w-[6px] !h-[6px] !bg-green-500 !-left-[7px]" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className={`!w-[6px] !h-[6px] ${isExecuting ? (conditionResult === true ? '!bg-green-500 !ring-2 !ring-green-300' : '!bg-gray-400') : '!bg-green-500'} !-right-[7px] !top-[25%]`} 
          id="true"
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className={`!w-[6px] !h-[6px] ${isExecuting ? (conditionResult === false ? '!bg-red-500 !ring-2 !ring-red-300' : '!bg-gray-400') : '!bg-red-500'} !-right-[7px] !top-[75%]`} 
          id="false"
        />
      </div>
    </NodeWrapper>
  );
};

const WaitNode = (props: any) => (
  <BaseNode {...props} icon={Timer} color="border-pink-500" label="Wait" />
);

const AiAgentNode = (props: any) => (
  <BaseNode {...props} icon={Brain} color="border-violet-500" label="AI Agent" />
);

const SplitNode = (props: any) => (
  <BaseNode {...props} icon={Split} color="border-orange-500" label="Split" />
);

const DebugNode = (props: any) => (
  <BaseNode {...props} icon={Bug} color="border-gray-500" label="Debug" width="200px" />
);

export const nodeTypes = {
  start: StartNode,
  schedule: ScheduleNode,
  httpRequest: HttpRequestNode,
  database: DatabaseNode,
  email: EmailNode,
  ifCondition: IfConditionNode,
  wait: WaitNode,
  aiAgent: AiAgentNode,
  split: SplitNode,
  debug: DebugNode,
  counter: CounterNode,
  pushButton: PushButtonNode,
  output: OutputNode,
};
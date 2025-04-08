import React from 'react';
import { Handle, Position } from 'reactflow';
import { Zap, Globe, Database, Mail, GitBranch, Clock, Timer, Bot, Brain, MessageSquare, Split, Bug, MousePointer, Hash, FileText } from 'lucide-react';
import { NodeWrapper } from './NodeWrapper';
import useWorkflowStore from '../store/workflowStore';
import PushButton from './ui/PushButton';
import OutputDisplay from './OutputDisplay';

const BaseNode = ({ 
  id,
  data, 
  icon: Icon, 
  color, 
  label,
  hasInput = true,
  width = '88px'
}: { 
  id: string;
  data: { label: string; input?: any }; 
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
          <div className="text-3xs text-gray-500 dark:text-gray-400 mt-0.5 leading-none">{label}</div>
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

const CounterNode = ({ id, data }: { id: string; data: { label: string; count?: number; initialValue?: number } }) => {
  const { updateNodeData, executeNode } = useWorkflowStore();
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  // Initialize counter with initial value if count is not set
  React.useEffect(() => {
    if (typeof data.count === 'undefined' && typeof data.initialValue !== 'undefined') {
      updateNodeData(id, { ...data, count: data.initialValue });
    }
  }, [id, data.initialValue]);

  const handleIncrement = () => {
    const currentCount = parseInt(data.count?.toString() || '0', 10);
    const step = parseInt(data.step?.toString() || '1', 10);
    const max = parseInt(data.max?.toString() || '999', 10);
    const min = parseInt(data.min?.toString() || '0', 10);
    const wrap = data.wrap === true;

    let newCount = currentCount + step;
    if (newCount > max) {
      newCount = wrap ? min : max;
    }

    updateNodeData(id, { ...data, count: newCount });
    executeNode(id);
  };

  const handleDecrement = () => {
    const currentCount = parseInt(data.count?.toString() || '0', 10);
    const step = parseInt(data.step?.toString() || '1', 10);
    const max = parseInt(data.max?.toString() || '999', 10);
    const min = parseInt(data.min?.toString() || '0', 10);
    const wrap = data.wrap === true;

    let newCount = currentCount - step;
    if (newCount < min) {
      newCount = wrap ? max : min;
    }

    updateNodeData(id, { ...data, count: newCount });
    executeNode(id);
  };

  const displayCount = typeof data.count !== 'undefined' ? data.count : data.initialValue || 0;

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
            <button
              onClick={handleDecrement}
              className="text-3xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-1"
            >
              -
            </button>
            <span className="text-3xs font-medium">{displayCount}</span>
            <button
              onClick={handleIncrement}
              className="text-3xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-1"
            >
              +
            </button>
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
      <div className="shadow-sm rounded-md bg-white dark:bg-gray-800 border-l-[3px] border-emerald-500 w-[200px] backdrop-blur-sm bg-opacity-95">
        <div className="px-1.5 py-1">
          <div className="flex items-center gap-1">
            <div className="bg-emerald-500 bg-opacity-10 rounded-sm p-0.5">
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

const nodeTypes = {
  webhook: (props: any) => (
    <BaseNode {...props} icon={Zap} color="border-purple-500" label="Webhook" />
  ),
  schedule: (props: any) => (
    <BaseNode {...props} icon={Clock} color="border-yellow-500" label="Schedule" hasInput={false} />
  ),
  httpRequest: (props: any) => (
    <BaseNode {...props} icon={Globe} color="border-blue-500" label="HTTP Request" />
  ),
  database: (props: any) => (
    <BaseNode {...props} icon={Database} color="border-green-500" label="Database" />
  ),
  email: (props: any) => (
    <BaseNode {...props} icon={Mail} color="border-red-500" label="Email" />
  ),
  ifCondition: (props: any) => (
    <BaseNode {...props} icon={GitBranch} color="border-indigo-500" label="If Condition" />
  ),
  wait: (props: any) => (
    <BaseNode {...props} icon={Timer} color="border-pink-500" label="Wait" />
  ),
  aiAgent: (props: any) => (
    <BaseNode {...props} icon={Brain} color="border-violet-500" label="AI Agent" />
  ),
  split: (props: any) => (
    <BaseNode {...props} icon={Split} color="border-orange-500" label="Split" />
  ),
  debug: (props: any) => (
    <BaseNode {...props} icon={Bug} color="border-gray-500" label="Debug" width="200px" />
  ),
  counter: CounterNode,
  pushButton: PushButtonNode,
  output: OutputNode,
};

export default nodeTypes;
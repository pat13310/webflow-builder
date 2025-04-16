import { Handle, Position, NodeProps } from 'reactflow';
import useWorkflowStore from '../store/workflowStore';
import { NodeWrapper } from './NodeWrapper';
import { ConsoleNode } from './nodes/ConsoleNode';
import { DatabaseNode } from './nodes/DatabaseNode';
import { CounterNode } from './nodes/CounterNode';
import { WaitNode } from './nodes/WaitNode';
import { AiAgentNode } from './nodes/AiAgentNode';
import { SplitNode } from './nodes/SplitNode';
import { IfConditionNode } from './nodes/IfConditionNode';
import { DebugNode } from './nodes/DebugNode';
import { ScheduleNode } from './nodes/ScheduleNode';
import { EmailNode } from './nodes/EmailNode';
import { WebhookNode } from './nodes/WebhookNode';
import { HttpRequestNode } from './nodes/HttpRequestNode';
import { PushButtonNode } from './nodes/PushButtonNode';

export type BaseNodeData = {
  label: string;
  input?: any;
  icon?: any;
  color?: string;
  hasInput?: boolean;
  width?: string;
};

const BaseNode = ({ id, data }: NodeProps<BaseNodeData>) => {
  const {
    icon: Icon,
    color = 'border-gray-500',
    hasInput = true,
    width = '88px'
  } = data;
  const executingNodes = useWorkflowStore((state) => state.executingNodes);
  const nodeStatuses = useWorkflowStore((state) => state.nodeStatuses);
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses.get(id)?.status || 'idle';

  return (
    <NodeWrapper nodeId={id} isExecuting={isExecuting} status={status}>
      <div className="shadow-sm rounded-lg bg-white dark:bg-gray-800 backdrop-blur-sm bg-opacity-95" style={{ width }}>
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            <div className={`${color.replace('border', 'bg')}/20 rounded p-1`}>
              <Icon className={`h-3 w-3 ${color.replace('border', 'text')} dark:${color.replace('border', 'text')}`} />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate leading-none">{data.label}</div>
          </div>
          {data.input && (
            <div className="mt-2">
              <div className="text-xs w-full text-gray-600 dark:text-gray-400 p-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-md min-h-[40px] outline outline-1 outline-gray-200/50 dark:outline-gray-700/50">
                {data.input}
              </div>
            </div>
          )}
        </div>
        {hasInput && (
          <Handle
            type="target"
            position={Position.Left}
            className={`!w-2 !h-2 !${color} !-left-1`}
          />
        )}
        <Handle
          type="source"
          position={Position.Right}
          className={`!w-2 !h-2 !${color} !-right-1`}
        />
      </div>
    </NodeWrapper>
  );
};

export const nodeTypes: Record<string, React.ComponentType<NodeProps>> = {
  base: BaseNode,
  database: DatabaseNode,
  console: ConsoleNode,
  counter: CounterNode,
  wait: WaitNode,
  aiAgent: AiAgentNode,
  split: SplitNode,
  
  ifCondition: IfConditionNode,
  debug: DebugNode,
  schedule: ScheduleNode,
  email: EmailNode,
  webhook: WebhookNode,
  httpRequest: HttpRequestNode,
  pushButton: PushButtonNode,
};
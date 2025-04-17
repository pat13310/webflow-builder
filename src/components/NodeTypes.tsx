import React, { lazy, Suspense } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import useWorkflowStore from '../store/workflowStore';
import { NodeWrapper } from './NodeWrapper';
import FancyLoader from './FancyLoader';

// Import direct pour BaseNode car il est défini localement

// Lazy loading pour les composants de nœuds
const ConsoleNode = lazy(() => import('./nodes/ConsoleNode').then(module => ({ default: module.ConsoleNode })));
const DatabaseNode = lazy(() => import('./nodes/DatabaseNode').then(module => ({ default: module.DatabaseNode })));
const CounterNode = lazy(() => import('./nodes/CounterNode').then(module => ({ default: module.CounterNode })));
const WaitNode = lazy(() => import('./nodes/WaitNode').then(module => ({ default: module.WaitNode })));
const AiAgentNode = lazy(() => import('./nodes/AiAgentNode').then(module => ({ default: module.AiAgentNode })));
const SplitNode = lazy(() => import('./nodes/SplitNode').then(module => ({ default: module.SplitNode })));
const IfConditionNode = lazy(() => import('./nodes/IfConditionNode').then(module => ({ default: module.IfConditionNode })));
const DebugNode = lazy(() => import('./nodes/DebugNode').then(module => ({ default: module.DebugNode })));
const ScheduleNode = lazy(() => import('./nodes/ScheduleNode').then(module => ({ default: module.ScheduleNode })));
const EmailNode = lazy(() => import('./nodes/EmailNode').then(module => ({ default: module.EmailNode })));
const WebhookNode = lazy(() => import('./nodes/WebhookNode').then(module => ({ default: module.WebhookNode })));
const HttpRequestNode = lazy(() => import('./nodes/HttpRequestNode').then(module => ({ default: module.HttpRequestNode })));
const PushButtonNode = lazy(() => import('./nodes/PushButtonNode').then(module => ({ default: module.PushButtonNode })));

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

// Composant de fallback pour les nœuds en cours de chargement
const NodeFallback = ({ id }: { id: string }) => (
  <NodeWrapper nodeId={id} isExecuting={false} status="idle">
    <div className="shadow-sm rounded-lg bg-white dark:bg-gray-800 backdrop-blur-sm bg-opacity-95" style={{ width: '88px' }}>
      <FancyLoader message="Chargement..." />
    </div>
  </NodeWrapper>
);

// Fonction d'enveloppement pour les nœuds avec Suspense
const withSuspense = (Component: React.ComponentType<NodeProps>) => (props: NodeProps) => (
  <Suspense fallback={<NodeFallback id={props.id} />}>
    <Component {...props} />
  </Suspense>
);

export const nodeTypes: Record<string, React.ComponentType<NodeProps>> = {
  base: BaseNode,
  database: withSuspense(DatabaseNode),
  console: withSuspense(ConsoleNode),
  counter: withSuspense(CounterNode),
  wait: withSuspense(WaitNode),
  aiAgent: withSuspense(AiAgentNode),
  split: withSuspense(SplitNode),
  ifCondition: withSuspense(IfConditionNode),
  debug: withSuspense(DebugNode),
  schedule: withSuspense(ScheduleNode),
  email: withSuspense(EmailNode),
  webhook: withSuspense(WebhookNode),
  httpRequest: withSuspense(HttpRequestNode),
  pushButton: withSuspense(PushButtonNode),
};
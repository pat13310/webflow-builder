import { WebhookNode } from './WebhookNode';
import { ConsoleNode } from './ConsoleNode';
import { AiAgentNode } from './AiAgentNode';
import { CounterNode } from './CounterNode';
import { DatabaseNode } from './DatabaseNode';
import { DebugNode } from './DebugNode';
import { EmailNode } from './EmailNode';
import { HttpRequestNode } from './HttpRequestNode';
import { IfConditionNode } from './IfConditionNode';
import { PushButtonNode } from './PushButtonNode';
import { ScheduleNode } from './ScheduleNode';
import { SplitNode } from './SplitNode';
import { WaitNode } from './WaitNode';

export const nodeTypes = {
  webhook: WebhookNode,
  console: ConsoleNode,
  aiAgent: AiAgentNode,
  counter: CounterNode,
  database: DatabaseNode,
  debug: DebugNode,
  email: EmailNode,
  httpRequest: HttpRequestNode,
  ifCondition: IfConditionNode,
  pushButton: PushButtonNode,
  schedule: ScheduleNode,
  split: SplitNode,
  wait: WaitNode
} as const;

export type NodeTypes = keyof typeof nodeTypes;

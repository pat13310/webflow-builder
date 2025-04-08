import useWorkflowStore from '../store/workflowStore';

export const useNodeExecutionCounter = (nodeType: string) => {
  const nodeExecutionCounters = useWorkflowStore((state) => state.nodeExecutionCounters);
  return nodeExecutionCounters.get(nodeType) || 0;
};

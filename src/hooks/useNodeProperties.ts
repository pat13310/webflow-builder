import type { Node as FlowNode } from 'reactflow';
import useWorkflowStore from '../store/workflowStore';

type NodeUpdateFunction = (nodeId: string, data: any) => void;

export const useNodeProperties = (
  selectedNode: FlowNode,
  onNodeUpdate: NodeUpdateFunction
) => {
  const handlePropertyChange = (field: string, value: any) => {
    const updatedData = {
      ...selectedNode.data,
      [field]: value,
    };
    
    // Mettre à jour le store directement
    useWorkflowStore.getState().updateNodeData(selectedNode.id, updatedData);
    
    // Maintenir la compatibilité avec onNodeUpdate
    onNodeUpdate(selectedNode.id, updatedData);
  };

  return {
    handlePropertyChange,
  };
};

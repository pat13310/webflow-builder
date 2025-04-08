import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  executingNodes: Set<string>;
  nodeStatuses: Map<string, { status: NodeStatus, timestamp: number }>;
  scheduleIntervals: Map<string, NodeJS.Timeout>;
  isExecuting: boolean;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  executeNode: (nodeId: string, isScheduled?: boolean) => Promise<void>;
  executeWorkflow: (startNodeIds: string[]) => Promise<void>;
  stopExecution: () => void;
  updateNodeName: (nodeId: string, newName: string) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: () => void;
  exportWorkflow: () => Promise<{ nodes: Node[]; edges: Edge[]; metadata: any }>;
  importWorkflow: (workflow: { nodes: Node[]; edges: Edge[]; metadata?: any }) => Promise<void>;
}

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // État initial
  nodes: [],
  edges: [],
  executingNodes: new Set<string>(),
  nodeStatuses: new Map(),
  scheduleIntervals: new Map(),
  isExecuting: false,

  // Méthodes de mise à jour des nœuds et des arêtes
  setNodes: (nodes) => {
    const newNodes = typeof nodes === 'function' ? nodes(get().nodes) : nodes;
    set({ nodes: newNodes });
  },

  setEdges: (edges) => {
    const newEdges = typeof edges === 'function' ? edges(get().edges) : edges;
    set({ edges: newEdges });
  },

  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node] 
  })),

  addEdge: (edge) => set((state) => ({ 
    edges: [...state.edges, edge] 
  })),

  duplicateNode: (nodeId) => {
    const { nodes } = get();
    const nodeToClone = nodes.find(n => n.id === nodeId);
    if (!nodeToClone) return;

    const newNode = {
      ...nodeToClone,
      id: `${nodeToClone.id}_copy_${Date.now()}`,
      position: {
        x: nodeToClone.position.x + 50,
        y: nodeToClone.position.y + 50
      },
      data: { ...nodeToClone.data, label: `${nodeToClone.data.label} (copy)` }
    };

    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  deleteNode: (nodeId) => {
    const { scheduleIntervals } = get();
    if (scheduleIntervals.has(nodeId)) {
      clearInterval(scheduleIntervals.get(nodeId));
      scheduleIntervals.delete(nodeId);
    }

    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    }));
  },

  stopExecution: () => {
    const { scheduleIntervals } = get();
    scheduleIntervals.forEach((interval) => clearInterval(interval));
    scheduleIntervals.clear();

    set((state) => {
      const newStatuses = new Map(state.nodeStatuses);
      state.nodes.forEach(node => {
        newStatuses.set(node.id, { status: 'idle', timestamp: Date.now() });
      });

      return {
        executingNodes: new Set(),
        nodeStatuses: newStatuses,
        isExecuting: false
      };
    });
  },
  
  updateNodeStatus: (nodeId, status) => {
    set((state) => {
      const newStatuses = new Map(state.nodeStatuses);
      newStatuses.set(nodeId, { status, timestamp: Date.now() });
      return { nodeStatuses: newStatuses };
    });
  },

  executeWorkflow: async (startNodeIds: string[]) => {
    const { stopExecution } = get();
    stopExecution(); // Stop any running execution first
    
    set({ isExecuting: true });
    
    for (const nodeId of startNodeIds) {
      if (!get().isExecuting) break;
      await get().executeNode(nodeId);
    }
  },

  executeNode: async (nodeId: string, isScheduled = false) => {
    const { nodes, edges, executingNodes, scheduleIntervals } = get();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (executingNodes.has(nodeId)) return;
    executingNodes.add(nodeId);
    set({ isExecuting: true });

    const updateNodeStatus = (id: string, status: NodeStatus) => {
      const nodeStatuses = get().nodeStatuses;
      nodeStatuses.set(id, { status, timestamp: Date.now() });
      set({ nodeStatuses: new Map(nodeStatuses) });
    };

    const executeNodeWithDelay = async (targetNodeId: string, scheduled = false) => {
      const targetNode = nodes.find(n => n.id === targetNodeId);
      if (!targetNode) return;

      try {
        updateNodeStatus(targetNodeId, 'running');

        if (targetNode.type === 'schedule') {
          const existingInterval = scheduleIntervals.get(targetNodeId);
          if (existingInterval) {
            clearInterval(existingInterval);
            scheduleIntervals.delete(targetNodeId);
          }

          if (targetNode.data.active !== 'true') {
            updateNodeStatus(targetNodeId, 'warning');
            return;
          }

          const intervalValue = parseInt(targetNode.data.intervalValue || '1', 10);
          const intervalUnit = targetNode.data.intervalUnit || 'seconds';
          
          let intervalMs = intervalValue;
          switch (intervalUnit) {
            case 'seconds':
              intervalMs *= 1000;
              break;
            case 'minutes':
              intervalMs *= 60 * 1000;
              break;
            case 'hours':
              intervalMs *= 60 * 60 * 1000;
              break;
            case 'days':
              intervalMs *= 24 * 60 * 60 * 1000;
              break;
          }

          if (!scheduled && targetNode.data.initialBehavior === 'execute') {
            const connectedNodes = edges
              .filter(e => e.source === targetNodeId)
              .map(e => nodes.find(n => n.id === e.target));

            for (const nextNode of connectedNodes) {
              if (!nextNode) continue;
              await executeNodeWithDelay(nextNode.id, true);
            }
          }

          const newInterval = setInterval(async () => {
            if (!get().isExecuting) {
              clearInterval(newInterval);
              scheduleIntervals.delete(targetNodeId);
              return;
            }

            updateNodeStatus(targetNodeId, 'running');
            
            const connectedNodes = edges
              .filter(e => e.source === targetNodeId)
              .map(e => nodes.find(n => n.id === e.target));

            for (const nextNode of connectedNodes) {
              if (!nextNode) continue;
              await executeNodeWithDelay(nextNode.id, true);
            }

            updateNodeStatus(targetNodeId, 'success');
          }, intervalMs);

          scheduleIntervals.set(targetNodeId, newInterval);
          updateNodeStatus(targetNodeId, 'success');
        } else {
          // Traitement des autres types de nœuds ici
          updateNodeStatus(targetNodeId, 'success');
        }
      } catch (error) {
        console.error(`Error executing node ${targetNodeId}:`, error);
        updateNodeStatus(targetNodeId, 'error');
      } finally {
        executingNodes.delete(targetNodeId);
      }
    };

    await executeNodeWithDelay(nodeId, isScheduled);

    // Only stop execution if there are no active schedules
    if (get().scheduleIntervals.size === 0) {
      set({ isExecuting: false });
    }
  },

  updateNodeName: (nodeId: string, newName: string) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    }));
  },

  updateNodeData: (nodeId: string, data: any) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    }));
  },

  saveWorkflow: async () => {
    const { nodes, edges } = get();
    localStorage.setItem('workflow', JSON.stringify({ nodes, edges }));
  },

  loadWorkflow: () => {
    const savedWorkflow = localStorage.getItem('workflow');
    if (savedWorkflow) {
      const { nodes, edges } = JSON.parse(savedWorkflow);
      set({ nodes, edges });
    }
  },

  exportWorkflow: async () => {
    const { nodes, edges } = get();
    return { nodes, edges, metadata: {} };
  },

  importWorkflow: async (workflow: { nodes: Node[]; edges: Edge[]; metadata?: any }) => {
    try {
      const { nodes, edges } = workflow;
      
      const validNodes = nodes.every(node => 
        node.id && 
        node.type && 
        typeof node.position === 'object' &&
        typeof node.data === 'object'
      );
      
      const validEdges = edges.every(edge => 
        edge.id && 
        edge.source && 
        edge.target
      );

      if (!validNodes || !validEdges) {
        throw new Error('Invalid workflow structure');
      }

      set({ nodes, edges });
    } catch (error) {
      console.error('Error importing workflow:', error);
      throw error;
    }
  }
}));

export default useWorkflowStore;
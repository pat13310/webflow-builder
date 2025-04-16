import { create } from 'zustand';
import { NodeTypes } from '../components/nodes/nodeTypes';

interface CounterState {
  nodeExecutionCounts: Map<NodeTypes, number>;
  incrementNodeCounter: (nodeType: NodeTypes) => void;
  getNodeExecutionCount: (nodeType: NodeTypes) => number;
  resetNodeCounter: (nodeType: NodeTypes) => void;
  resetAllCounters: () => void;
}

const useCounterStore = create<CounterState>((set, get) => ({
  nodeExecutionCounts: new Map<NodeTypes, number>(),

  incrementNodeCounter: (nodeType: NodeTypes) => {
    set((state) => {
      const newCounts = new Map(state.nodeExecutionCounts);
      const currentCount = newCounts.get(nodeType) || 0;
      newCounts.set(nodeType, currentCount + 1);
      console.log(`Compteur pour ${nodeType} incrémenté à ${currentCount + 1}`);
      return { nodeExecutionCounts: newCounts };
    });
  },

  getNodeExecutionCount: (nodeType: NodeTypes) => {
    return get().nodeExecutionCounts.get(nodeType) || 0;
  },

  resetNodeCounter: (nodeType: NodeTypes) => {
    set((state) => {
      const newCounts = new Map(state.nodeExecutionCounts);
      newCounts.delete(nodeType);
      console.log(`Compteur pour ${nodeType} réinitialisé`);
      return { nodeExecutionCounts: newCounts };
    });
  },

  resetAllCounters: () => {
    set(() => {
      console.log('Tous les compteurs ont été réinitialisés');
      return { nodeExecutionCounts: new Map() };
    });
  },
}));

export default useCounterStore;

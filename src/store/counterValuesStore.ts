import { create } from 'zustand';

interface CounterValuesState {
  values: Map<string, number>;
  incrementValue: (nodeId: string, step?: number) => void;
  decrementValue: (nodeId: string, step?: number) => void;
  setValue: (nodeId: string, value: number) => void;
  getValue: (nodeId: string) => number;
  resetValue: (nodeId: string) => void;
}

const useCounterValuesStore = create<CounterValuesState>((set, get) => ({
  values: new Map<string, number>(),

  incrementValue: (nodeId: string, step = 1) => {
    set((state) => {
      const newValues = new Map(state.values);
      const currentValue = newValues.get(nodeId) || 0;
      newValues.set(nodeId, currentValue + step);
      return { values: newValues };
    });
  },

  decrementValue: (nodeId: string, step = 1) => {
    set((state) => {
      const newValues = new Map(state.values);
      const currentValue = newValues.get(nodeId) || 0;
      newValues.set(nodeId, currentValue - step);
      return { values: newValues };
    });
  },

  setValue: (nodeId: string, value: number) => {
    set((state) => {
      const newValues = new Map(state.values);
      newValues.set(nodeId, value);
      return { values: newValues };
    });
  },

  getValue: (nodeId: string) => {
    return get().values.get(nodeId) || 0;
  },

  resetValue: (nodeId: string) => {
    set((state) => {
      const newValues = new Map(state.values);
      newValues.delete(nodeId);
      return { values: newValues };
    });
  },
}));

export default useCounterValuesStore;

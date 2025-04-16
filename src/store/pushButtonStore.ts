import { create } from 'zustand';
import useWorkflowStore from './workflowStore';

interface PushButtonState {
  // État des boutons
  buttonStates: Map<string, {
    isPressed: boolean;
    lastPressTime: number;
    isConfirmationOpen: boolean;
  }>;

  // Actions
  pressButton: (nodeId: string) => void;
  releaseButton: (nodeId: string) => void;
  showConfirmation: (nodeId: string) => void;
  hideConfirmation: (nodeId: string) => void;
  triggerWorkflow: (nodeId: string) => Promise<void>;
}

const usePushButtonStore = create<PushButtonState>((set, get) => ({
  buttonStates: new Map(),

  pressButton: (nodeId: string) => {
    set((state) => {
      const newStates = new Map(state.buttonStates);
      newStates.set(nodeId, {
        isPressed: true,
        lastPressTime: Date.now(),
        isConfirmationOpen: false,
      });
      return { buttonStates: newStates };
    });
  },

  releaseButton: (nodeId: string) => {
    set((state) => {
      const newStates = new Map(state.buttonStates);
      const currentState = newStates.get(nodeId);
      if (currentState) {
        newStates.set(nodeId, {
          ...currentState,
          isPressed: false,
        });
      }
      return { buttonStates: newStates };
    });
  },

  showConfirmation: (nodeId: string) => {
    set((state) => {
      const newStates = new Map(state.buttonStates);
      const currentState = newStates.get(nodeId) || {
        isPressed: false,
        lastPressTime: Date.now(),
        isConfirmationOpen: false,
      };
      newStates.set(nodeId, {
        ...currentState,
        isConfirmationOpen: true,
      });
      return { buttonStates: newStates };
    });
  },

  hideConfirmation: (nodeId: string) => {
    set((state) => {
      const newStates = new Map(state.buttonStates);
      const currentState = newStates.get(nodeId);
      if (currentState) {
        newStates.set(nodeId, {
          ...currentState,
          isConfirmationOpen: false,
        });
      }
      return { buttonStates: newStates };
    });
  },

  triggerWorkflow: async (nodeId: string) => {
    const workflowStore = useWorkflowStore.getState();
    try {
      // Déclencher l'exécution du workflow à partir de ce nœud
      await workflowStore.executeWorkflow([nodeId]);
      
      // Mettre à jour l'état du bouton
      set((state) => {
        const newStates = new Map(state.buttonStates);
        newStates.set(nodeId, {
          isPressed: false,
          lastPressTime: Date.now(),
          isConfirmationOpen: false,
        });
        return { buttonStates: newStates };
      });
    } catch (error) {
      console.error('Erreur lors du déclenchement du workflow:', error);
      // Réinitialiser l'état du bouton en cas d'erreur
      get().releaseButton(nodeId);
    }
  },
}));

export default usePushButtonStore;

import { create } from 'zustand';
import DOMPurify from 'dompurify';

interface ConsoleData {
  content: string;
  timestamp: number;
}

interface ConsoleStore {
  consoles: Map<string, ConsoleData>;
  appendToConsole: (nodeId: string, content: any) => void;
  clearConsole: (nodeId: string) => void;
  getConsoleContent: (nodeId: string) => string;
}

const useConsoleStore = create<ConsoleStore>((set, get) => ({
  consoles: new Map(),

  appendToConsole: (nodeId: string, content: any) => {
    try {
      const timestamp = Date.now();
      let formattedContent = '';

      // Formatter le contenu selon son type
      if (typeof content === 'object') {
        formattedContent = JSON.stringify(content, null, 2);
      } else {
        formattedContent = String(content);
      }

      // Nettoyer le contenu HTML
      const cleanContent = DOMPurify.sanitize(formattedContent);

      // Récupérer l'ancien contenu s'il existe
      const existingData = get().consoles.get(nodeId);
      const newContent = existingData 
        ? `${existingData.content}\n${cleanContent}`
        : cleanContent;

      // Mettre à jour le store
      set((state) => ({
        consoles: new Map(state.consoles).set(nodeId, {
          content: newContent,
          timestamp
        })
      }));
    } catch (error) {
      console.error(`Erreur lors de l'ajout au console:`, error);
      // En cas d'erreur, ajouter un message d'erreur
      set((state) => ({
        consoles: new Map(state.consoles).set(nodeId, {
          content: 'Erreur de formatage des données',
          timestamp: Date.now()
        })
      }));
    }
  },

  clearConsole: (nodeId: string) => {
    set((state) => {
      const newConsoles = new Map(state.consoles);
      newConsoles.delete(nodeId);
      return { consoles: newConsoles };
    });
  },

  getConsoleContent: (nodeId: string) => {
    return get().consoles.get(nodeId)?.content || '';
  }
}));

export default useConsoleStore;

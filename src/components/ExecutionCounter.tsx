// Dans ExecutionCounter.tsx (Exemple)
import React from 'react';
import useWorkflowStore from '../store/workflowStore'; // Adapter le chemin

interface ExecutionCounterProps {
  nodeType: string;
}

export const ExecutionCounter: React.FC<ExecutionCounterProps> = ({ nodeType }) => {
  // Sélectionne UNIQUEMENT le compteur spécifique pour ce type
  // S'abonne aux changements de CETTE valeur spécifique
  const count = useWorkflowStore(state => state.nodeExecutionCounters.get(nodeType) || 0);

  // Optionnel: Ne rien afficher si le type est invalide (déjà géré dans BaseNode mais double sécurité)
  if (!nodeType) return null;

  // Afficher le compteur entre parenthèses par exemple
  return (
    <span className="text-gray-500 dark:text-gray-400 text-3xs ml-1">
      ({count})
    </span>
  );
};
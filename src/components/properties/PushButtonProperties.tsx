import React from 'react';
import type { Node as FlowNode } from 'reactflow';

// Interface for props including formData
interface PushButtonPropertiesProps {
  selectedNode: FlowNode;
  onNodeUpdate: (field: string, value: any) => void;
  formData: Record<string, any>;
}

const PushButtonProperties = ({ selectedNode, onNodeUpdate, formData }: PushButtonPropertiesProps) => {
  const nodeId = selectedNode.id;

  // Valeurs par défaut
  const variant = formData?.variant ?? 'primary';
  const buttonText = formData?.buttonText ?? 'Démarrer';
  const confirmBeforeTrigger = formData?.confirmBeforeTrigger ?? true;
  const confirmationMessage = formData?.confirmationMessage ?? 'Êtes-vous sûr de vouloir démarrer ce workflow ?';

  // Gestionnaire de changement
  const handlePropertyChange = (field: string, value: any) => {
    onNodeUpdate(field, value);
  };

  return (
    <div className="space-y-4">
      {/* Texte du bouton */}
      <div>
        <label htmlFor={`${nodeId}-buttonText`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Texte du bouton
        </label>
        <input
          id={`${nodeId}-buttonText`}
          type="text"
          value={buttonText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePropertyChange('buttonText', e.target.value)}
          placeholder="ex: Démarrer, Exécuter"
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
        />
      </div>

      {/* Style du bouton */}
      <div>
        <label htmlFor={`${nodeId}-variant`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Style du bouton
        </label>
        <select
          id={`${nodeId}-variant`}
          value={variant}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePropertyChange('variant', e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
        >
          <option value="primary">Principal (Bleu)</option>
          <option value="secondary">Secondaire (Gris)</option>
          <option value="outline">Contour</option>
          <option value="ghost">Minimal</option>
          <option value="success">Succès (Vert)</option>
          <option value="warning">Attention (Jaune)</option>
          <option value="danger">Danger (Rouge)</option>
        </select>
      </div>

      {/* Paramètres de confirmation */}
      <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirmation</h4>
        <div>
          <label htmlFor={`${nodeId}-confirm`} className="flex items-center space-x-2 cursor-pointer">
            <input
              id={`${nodeId}-confirm`}
              type="checkbox"
              checked={confirmBeforeTrigger}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePropertyChange('confirmBeforeTrigger', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
              Demander confirmation avant l'exécution
            </span>
          </label>
        </div>

        {/* Message de confirmation */}
        {confirmBeforeTrigger && (
          <div>
            <label htmlFor={`${nodeId}-confirmMsg`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Message de confirmation
            </label>
            <textarea
              id={`${nodeId}-confirmMsg`}
              value={confirmationMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handlePropertyChange('confirmationMessage', e.target.value)}
              placeholder="Message à afficher dans la boîte de dialogue de confirmation"
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PushButtonProperties;
import React, { useCallback } from 'react';
import type { Node as FlowNode } from 'reactflow';
import { FileText, Code, FileJson, FileCode } from 'lucide-react';

// Interface for props including formData
interface OutputPropertiesProps {
  selectedNode: FlowNode;
  onNodeUpdate: (field: string, value: any) => void; // Simplified signature
  formData: Record<string, any>;
}

const OutputProperties = ({ selectedNode, onNodeUpdate, formData }: OutputPropertiesProps) => {
  const nodeId = selectedNode.id; // For unique IDs

  // Derive values from formData, providing defaults using ??
  const format = formData?.format ?? 'text';
  const content = formData?.content ?? '';
  const autoUpdate = formData?.autoUpdate ?? false; // Default to false

  // Memoized change handler
  const handlePropertyChange = useCallback((field: string, value: any) => {
    onNodeUpdate(field, value);
  }, [onNodeUpdate]);

  return (
    <div className="space-y-4">
      {/* Format Selection */}
      <div>
        <label htmlFor={`${nodeId}-format`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Format de Sortie
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={() => handlePropertyChange('format', 'text')}
            className={`flex items-center justify-center p-2 rounded-md transition-all ${format === 'text' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Texte
          </button>
          <button
            onClick={() => handlePropertyChange('format', 'json')}
            className={`flex items-center justify-center p-2 rounded-md transition-all ${format === 'json' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <FileJson className="w-4 h-4 mr-2" />
            JSON
          </button>
          <button
            onClick={() => handlePropertyChange('format', 'html')}
            className={`flex items-center justify-center p-2 rounded-md transition-all ${format === 'html' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <Code className="w-4 h-4 mr-2" />
            HTML
          </button>
          <button
            onClick={() => handlePropertyChange('format', 'markdown')}
            className={`flex items-center justify-center p-2 rounded-md transition-all ${format === 'markdown' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <FileCode className="w-4 h-4 mr-2" />
            Markdown
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Détermine comment le contenu sera interprété et affiché.
        </p>
      </div>

      {/* Content Area */}
      <div>
        <label htmlFor={`${nodeId}-content`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Modèle de Contenu
        </label>
        <div className="relative">
          <textarea
            id={`${nodeId}-content`}
            value={content}
            onChange={(e) => handlePropertyChange('content', e.target.value)}
            placeholder={`Entrez votre contenu ${format}...\nUtilisez {{input.field}} ou {{nodes.node_id.output}} pour les valeurs dynamiques.`}
            className={`w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 transition-all duration-200 ${['json', 'markdown', 'html'].includes(format) ? 'font-mono' : ''}`}
            rows={10}
            style={{ resize: 'vertical', minHeight: '150px' }}
          />
          <div className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
            {format.toUpperCase()}
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
          Définissez la sortie. Utilisez les accolades doubles <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">{'{{'} {'}}'}</code> pour insérer des données dynamiques des nœuds précédents ou des entrées.
        </p>
      </div>

      {/* Auto-update Toggle */}
      {/* This might be less relevant if content is always template-based.
          Consider its exact purpose: Does it mean the 'content' field itself
          gets overwritten by the *entire* input if checked? Or does it just
          enable/disable the template processing? Assuming the latter for now.
          If it means overwriting, the UI/UX needs rethinking.
          Let's rename it slightly for clarity. */}
      <div>
        <label htmlFor={`${nodeId}-autoUpdate`} className="flex items-center space-x-2 cursor-pointer">
          <input
            id={`${nodeId}-autoUpdate`}
            type="checkbox"
            checked={autoUpdate} // Use boolean value
            onChange={(e) => handlePropertyChange('autoUpdate', e.target.checked)} // Pass boolean value
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
            Traiter le modèle dynamiquement
          </span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-6 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
          Si activé, le modèle sera traité avec les données entrantes à chaque exécution du workflow. Sinon, le contenu sera traité comme du texte statique.
        </p>
      </div>
    </div>
  );
};

export default OutputProperties;
import React, { useCallback, useEffect, useState } from 'react';
import type { Node as FlowNode } from 'reactflow';
import useCounterValuesStore from '../../store/counterValuesStore';

// Receive formData from parent (PropertiesPanel)
interface CounterPropertiesProps {
  selectedNode: FlowNode;
  onNodeUpdate: (field: string, value: any) => void;
  formData: Record<string, any>; // Contains the current state of edits
}

const CounterProperties = ({ selectedNode, onNodeUpdate, formData }: CounterPropertiesProps) => {
  const nodeId = selectedNode.id; // For unique IDs

  // Utiliser useState pour suivre les valeurs locales
  const [localFormData, setLocalFormData] = useState({
    initialValue: formData?.initialValue ?? 0,
    step: formData?.step ?? 1,
    min: formData?.min ?? 0,
    max: formData?.max ?? 999,
    wrap: formData?.wrap ?? false
  });

  // Obtenir la valeur actuelle du compteur depuis le store
  const currentCount = useCounterValuesStore(state => state.getValue(selectedNode.id));
  const setValue = useCounterValuesStore(state => state.setValue);

  // Synchroniser les valeurs locales avec formData lorsque formData change
  useEffect(() => {
    setLocalFormData({
      initialValue: formData?.initialValue ?? 0,
      step: formData?.step ?? 1,
      min: formData?.min ?? 0,
      max: formData?.max ?? 999,
      wrap: formData?.wrap ?? false
    });
  }, [formData]);

  // Gestionnaire de changement de propriété mémorisé
  const handlePropertyChange = useCallback((field: string, value: any) => {
    // S'assurer que les valeurs numériques sont correctement analysées
    const numericFields = ['initialValue', 'count', 'step', 'min', 'max'];
    let processedValue = value;

    if (numericFields.includes(field)) {
      // Utiliser parseFloat pour les valeurs potentiellement non entières, revenir à 0 si NaN
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        processedValue = 0;
      }
    }

    // Mettre à jour le store pour le champ initialValue
    if (field === 'initialValue') {
      setValue(selectedNode.id, processedValue);
    }

    // Mettre à jour le state local
    setLocalFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Mettre à jour le nœud via le callback
    onNodeUpdate(field, processedValue);
  }, [onNodeUpdate, selectedNode.id, setValue]);

  // Gestionnaire spécifique pour le champ count, s'assurant qu'il reste dans les limites min/max si wrap est désactivé
  const handleCountChange = (valueStr: string) => {
    let newCount = parseFloat(valueStr);
    if (isNaN(newCount)) newCount = localFormData.min; // Par défaut à min si l'entrée est invalide

    // Limiter la valeur si pas d'enroulement
    if (!localFormData.wrap) {
      newCount = Math.max(localFormData.min, Math.min(localFormData.max, newCount));
    } else {
      // Gérer la logique d'enroulement
      if (newCount > localFormData.max) newCount = localFormData.min;
      if (newCount < localFormData.min) newCount = localFormData.max;
    }

    // Mettre à jour la valeur dans le store et le nœud
    setValue(selectedNode.id, newCount);
    onNodeUpdate('count', newCount);
  };

  return (
    <div className="space-y-4">
      {/* Initial Value */}
      <div>
        <label htmlFor={`${nodeId}-initialValue`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Initial Value
        </label>
        <input
          id={`${nodeId}-initialValue`}
          type="number"
          value={localFormData.initialValue}
          onChange={(e) => handlePropertyChange('initialValue', e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          The value the counter starts at or resets to.
        </p>
      </div>

      {/* Current Value (Editable, but reflects the live state) */}
      <div>
        <label htmlFor={`${nodeId}-currentCount`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Current Value
        </label>
        <input
          id={`${nodeId}-currentCount`}
          type="number"
          value={currentCount}
          onChange={(e) => handleCountChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          The counter's current state. Can be manually adjusted.
        </p>
      </div>

      {/* Configuration Group */}
      <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 -mb-1">Configuration</h4>
        {/* Step Size */}
        <div>
          <label htmlFor={`${nodeId}-step`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Step Size
          </label>
          <input
            id={`${nodeId}-step`}
            type="number"
            step="any"
            value={localFormData.step}
            onChange={(e) => handlePropertyChange('step', e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Amount to increment/decrement on each trigger.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Minimum Value */}
          <div>
            <label htmlFor={`${nodeId}-min`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Minimum Value
            </label>
            <input
              id={`${nodeId}-min`}
              type="number"
              step="any"
              value={localFormData.min}
              onChange={(e) => handlePropertyChange('min', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
            />
          </div>

          {/* Maximum Value */}
          <div>
            <label htmlFor={`${nodeId}-max`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Maximum Value
            </label>
            <input
              id={`${nodeId}-max`}
              type="number"
              step="any"
              value={localFormData.max}
              onChange={(e) => handlePropertyChange('max', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Defines the bounds for the counter value (inclusive).
        </p>

            {/* Wrap Around */}
            <div className="pt-1">
                <label htmlFor={`${nodeId}-wrap`} className="flex items-center space-x-2 cursor-pointer">
                <input
                    id={`${nodeId}-wrap`}
                    type="checkbox"
                    checked={localFormData.wrap} // Use boolean value
                    onChange={(e) => handlePropertyChange('wrap', e.target.checked)} // Pass boolean value
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                    Wrap around
                </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                    If checked, exceeding max resets to min (and vice versa).
                </p>
            </div>
       </div>

    </div>
  );
};

export default CounterProperties;
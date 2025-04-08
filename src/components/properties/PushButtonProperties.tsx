import React, { useCallback } from 'react';
import type { Node as FlowNode } from 'reactflow';

// Interface for props including formData
interface PushButtonPropertiesProps {
  selectedNode: FlowNode;
  onNodeUpdate: (field: string, value: any) => void; // Simplified signature
  formData: Record<string, any>;
}

const PushButtonProperties = ({ selectedNode, onNodeUpdate, formData }: PushButtonPropertiesProps) => {
  const nodeId = selectedNode.id; // For unique IDs

  // Derive values from formData, providing defaults using ??
  const variant = formData?.variant ?? 'primary';
  const buttonText = formData?.buttonText ?? 'Trigger Workflow'; // Default text
  const confirmBeforeTrigger = formData?.confirmBeforeTrigger ?? false; // Default to false
  const confirmationMessage = formData?.confirmationMessage ?? 'Are you sure you want to trigger this workflow?'; // Default confirmation

  // Memoized change handler
  const handlePropertyChange = useCallback((field: string, value: any) => {
    onNodeUpdate(field, value);
  }, [onNodeUpdate]);

  return (
    <div className="space-y-4">
      {/* Button Text */}
      <div>
        <label htmlFor={`${nodeId}-buttonText`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Button Label
        </label>
        <input
          id={`${nodeId}-buttonText`}
          type="text"
          value={buttonText}
          onChange={(e) => handlePropertyChange('buttonText', e.target.value)}
          placeholder="e.g., Run Now, Start Process"
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
        />
      </div>

      {/* Button Style/Variant */}
      <div>
        <label htmlFor={`${nodeId}-variant`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Button Style
        </label>
        <select
          id={`${nodeId}-variant`}
          value={variant}
          onChange={(e) => handlePropertyChange('variant', e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.2em 1.2em'
          }}
        >
          <option value="primary">Primary (Blue)</option>
          <option value="secondary">Secondary (Gray)</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost (Minimal)</option>
          <option value="success">Success (Green)</option>
          <option value="warning">Warning (Yellow)</option>
          <option value="danger">Danger (Red)</option>
        </select>
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
             Visual appearance of the button in the UI.
         </p>
      </div>

      {/* Confirmation Settings */}
      <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 -mb-1">Confirmation</h4>
        <div>
            <label htmlFor={`${nodeId}-confirm`} className="flex items-center space-x-2 cursor-pointer">
            <input
                id={`${nodeId}-confirm`}
                type="checkbox"
                checked={confirmBeforeTrigger} // Use boolean value
                onChange={(e) => handlePropertyChange('confirmBeforeTrigger', e.target.checked)} // Pass boolean value
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                Require confirmation before triggering
            </span>
            </label>
        </div>

        {/* Show message input only if confirmation is enabled */}
        {confirmBeforeTrigger && (
            <div>
            <label htmlFor={`${nodeId}-confirmMsg`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Confirmation Prompt
            </label>
            <input
                id={`${nodeId}-confirmMsg`}
                type="text"
                value={confirmationMessage}
                onChange={(e) => handlePropertyChange('confirmationMessage', e.target.value)}
                placeholder="Enter confirmation message"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
            />
            </div>
        )}
      </div>

    </div>
  );
};

export default PushButtonProperties;
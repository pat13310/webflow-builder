import React, { useCallback } from 'react';
import type { Node as FlowNode } from 'reactflow';

// Receive formData from parent (PropertiesPanel)
interface CounterPropertiesProps {
  selectedNode: FlowNode;
  onNodeUpdate: (field: string, value: any) => void;
  formData: Record<string, any>; // Contains the current state of edits
}

const CounterProperties = ({ selectedNode, onNodeUpdate, formData }: CounterPropertiesProps) => {
  const nodeId = selectedNode.id; // For unique IDs

  // Use formData for displaying values, providing defaults using ??
  // Note: initialValue and count might need careful initialization logic
  // depending on whether 'count' should reset to 'initialValue'
  const initialValue = formData?.initialValue ?? 0;
  // Display current 'count' if it exists, otherwise fall back to 'initialValue'
  const currentCount = formData?.count ?? initialValue;
  const step = formData?.step ?? 1;
  const min = formData?.min ?? 0;
  const max = formData?.max ?? 999;
  const wrap = formData?.wrap ?? false; // Default wrap to false

  // Memoize the change handler
  const handlePropertyChange = useCallback((field: string, value: any) => {
    // Ensure numeric values are parsed correctly
    const numericFields = ['initialValue', 'count', 'step', 'min', 'max'];
    let processedValue = value;
    if (numericFields.includes(field)) {
        // Use parseFloat for potentially non-integer steps/values, fallback to 0 if NaN
        processedValue = parseFloat(value);
        if (isNaN(processedValue)) {
            processedValue = 0; // Or handle error, or use the previous value
        }
        // You might want specific integer parsing for some fields:
        // if (['initialValue', 'count', 'min', 'max'].includes(field)) {
        //    processedValue = parseInt(value, 10);
        //    if (isNaN(processedValue)) processedValue = 0;
        // }
    }
    onNodeUpdate(field, processedValue);
  }, [onNodeUpdate]);

  // Handler specifically for the count field, ensuring it stays within min/max if wrap is off
  const handleCountChange = (valueStr: string) => {
      let newCount = parseFloat(valueStr);
      if (isNaN(newCount)) newCount = min; // Default to min if input is invalid

      // Clamp value if not wrapping
      if (!wrap) {
        if (typeof min === 'number' && newCount < min) newCount = min;
        if (typeof max === 'number' && newCount > max) newCount = max;
      }
      // Note: Wrapping logic usually applies during increment/decrement operations,
      // allowing direct setting might bypass it. Decide if direct edit should clamp or allow any value.
      // For simplicity here, we clamp if wrap is false.

      handlePropertyChange('count', newCount);
  }

  // Handler specifically for initialValue, also potentially updating count if count wasn't explicitly set
  const handleInitialValueChange = (valueStr: string) => {
    let newInitialValue = parseFloat(valueStr);
    if (isNaN(newInitialValue)) newInitialValue = 0;

    handlePropertyChange('initialValue', newInitialValue);

    // If the 'count' property hasn't been explicitly set (is undefined in formData),
    // update it to match the new initial value.
    if (formData?.count === undefined) {
      handlePropertyChange('count', newInitialValue);
    }
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
          value={initialValue}
          // Use specific handler to potentially update count as well
          onChange={(e) => handleInitialValueChange(e.target.value)}
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
          // Use specific handler to apply min/max clamping if needed
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
                // min="0" // Allow negative steps? Usually step is positive. Let's assume >= 0 for now.
                step="any" // Allow decimal steps if needed
                value={step}
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
                    value={min}
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
                    value={max}
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
                    checked={wrap} // Use boolean value
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
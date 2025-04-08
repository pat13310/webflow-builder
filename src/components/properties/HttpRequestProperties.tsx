import React, { useCallback } from 'react';
import type { Node as FlowNode } from 'reactflow';

// Interface for props including formData
interface HttpRequestPropertiesProps {
  selectedNode: FlowNode;
  onNodeUpdate: (field: string, value: any) => void; // Simplified signature
  formData: Record<string, any>;
}

const HttpRequestProperties = ({ selectedNode, onNodeUpdate, formData }: HttpRequestPropertiesProps) => {
  const nodeId = selectedNode.id; // For unique IDs

  // Derive values from formData, providing defaults using ??
  const url = formData?.url ?? '';
  const method = formData?.method ?? 'GET';
  const body = formData?.body ?? ''; // Relevant for POST, PUT, PATCH
  const headers = formData?.headers ?? ''; // Key: value pairs, newline separated
  const queryParams = formData?.queryParams ?? ''; // key=value pairs, newline separated
  const retryOnFailure = formData?.retryOnFailure ?? false; // Default to false
  const maxRetries = formData?.maxRetries ?? 3;
  const retryDelay = formData?.retryDelay ?? 5; // In seconds

  // Memoized change handler
  const handlePropertyChange = useCallback((field: string, value: any) => {
    let processedValue = value;
    // Ensure numeric types for retry fields
    if (field === 'maxRetries' || field === 'retryDelay') {
        processedValue = parseInt(value, 10);
        if (isNaN(processedValue)) {
            // Set to minimum or default if parsing fails
            processedValue = field === 'maxRetries' ? 1 : 1;
        } else {
            // Enforce min/max constraints if needed (optional, could also be done via input attributes)
            if (field === 'maxRetries') processedValue = Math.max(1, Math.min(10, processedValue));
            if (field === 'retryDelay') processedValue = Math.max(1, Math.min(300, processedValue));
        }
    }
    onNodeUpdate(field, processedValue);
  }, [onNodeUpdate]);

  const showBodyInput = ['POST', 'PUT', 'PATCH'].includes(method);

  return (
    <div className="space-y-4">
      {/* URL */}
      <div>
        <label htmlFor={`${nodeId}-url`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Request URL
        </label>
        <input
          id={`${nodeId}-url`}
          type="text" // Consider using type="url" for basic browser validation
          value={url}
          onChange={(e) => handlePropertyChange('url', e.target.value)}
          placeholder="https://api.example.com/users/{{userId}}"
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
        />
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter the full URL. Use {'{'}{'{'}{'}'} for dynamic values from previous nodes.
         </p>
      </div>

      {/* Method */}
      <div>
        <label htmlFor={`${nodeId}-method`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          HTTP Method
        </label>
        <select
          id={`${nodeId}-method`}
          value={method}
          onChange={(e) => handlePropertyChange('method', e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
           style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.2em 1.2em'
            }}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>
      </div>

      {/* Request Body (Conditional) */}
      {showBodyInput && (
        <div>
          <label htmlFor={`${nodeId}-body`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Request Body (e.g., JSON)
          </label>
          <textarea
            id={`${nodeId}-body`}
            value={body}
            onChange={(e) => handlePropertyChange('body', e.target.value)}
            placeholder={'{\n  "name": "{{input.userName}}",\n  "email": "{{input.userEmail}}"\n}'}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 font-mono"
            rows={5} // Increased rows
            spellCheck="false"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the request payload. Ensure `Content-Type` header is set correctly below.
          </p>
        </div>
      )}

        {/* Headers */}
        <div>
            <label htmlFor={`${nodeId}-headers`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Headers
            </label>
            <textarea
                id={`${nodeId}-headers`}
                value={headers}
                onChange={(e) => handlePropertyChange('headers', e.target.value)}
                placeholder="Content-Type: application/json\nAuthorization: Bearer {{secrets.apiKey}}\nX-Custom-Header: {{nodes.prevNode.outputValue}}"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 font-mono"
                rows={4} // Increased rows
                spellCheck="false"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                One header per line in `Key: Value` format.
            </p>
        </div>

        {/* Query Parameters */}
        <div>
            <label htmlFor={`${nodeId}-queryParams`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Query Parameters
            </label>
            <textarea
                id={`${nodeId}-queryParams`}
                value={queryParams}
                onChange={(e) => handlePropertyChange('queryParams', e.target.value)}
                placeholder="search={{input.query}}\nlimit=10\noffset={{input.page * 10}}"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 font-mono"
                rows={3} // Increased rows
                spellCheck="false"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                One parameter per line in `key=value` format. Will be URL-encoded automatically.
            </p>
        </div>

      {/* Retry Settings */}
      <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 -mb-1">Retry Configuration</h4>
        <div>
          <label htmlFor={`${nodeId}-retry`} className="flex items-center space-x-2 cursor-pointer">
            <input
              id={`${nodeId}-retry`}
              type="checkbox"
              checked={retryOnFailure} // Use boolean value
              onChange={(e) => handlePropertyChange('retryOnFailure', e.target.checked)} // Pass boolean value
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
              Retry on failure (e.g., 5xx errors, network issues)
            </span>
          </label>
        </div>

        {/* Show retry options only if enabled */}
        {retryOnFailure && (
          <div className="grid grid-cols-2 gap-3 pl-6">
            <div>
              <label htmlFor={`${nodeId}-maxRetries`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Max Retries
              </label>
              <input
                id={`${nodeId}-maxRetries`}
                type="number"
                min="1"
                max="10" // Define practical limits
                step="1"
                value={maxRetries}
                onChange={(e) => handlePropertyChange('maxRetries', e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
              />
            </div>
            <div>
              <label htmlFor={`${nodeId}-retryDelay`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Delay (sec)
              </label>
              <input
                id={`${nodeId}-retryDelay`}
                type="number"
                min="1"
                max="300" // Define practical limits
                step="1"
                value={retryDelay}
                onChange={(e) => handlePropertyChange('retryDelay', e.target.value)}
                 placeholder="Seconds"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
              />
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 col-span-2">
                Initial delay before the first retry. Subsequent retries might use exponential backoff (implementation dependent).
             </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default HttpRequestProperties;
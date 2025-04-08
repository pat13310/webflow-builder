import React, { useState, useCallback } from 'react';
import type { Node as FlowNode } from 'reactflow';
import { Eye, EyeOff, Copy, Check } from 'lucide-react'; // Icons for visibility toggle and copy

// Interface for props including formData
interface WebhookPropertiesProps {
  selectedNode: FlowNode;
  onNodeUpdate: (field: string, value: any) => void; // Changed signature
  formData: Record<string, any>;
}

// Helper to generate a unique-ish ID for the webhook path if needed
const generateWebhookId = () => Math.random().toString(36).substring(2, 10);

const WebhookProperties = ({ selectedNode, onNodeUpdate, formData }: WebhookPropertiesProps) => {
  const nodeId = selectedNode.id;
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showApiKeyValue, setShowApiKeyValue] = useState(false);
  const [copied, setCopied] = useState(false);

  // Derive values from formData, providing defaults
  const path = formData?.path || `/webhook/${nodeId.substring(0, 6)}-${generateWebhookId()}`; // Default to a generated path if empty
  const method = formData?.method || 'POST';
  const auth = formData?.auth || 'none';
  const username = formData?.username || '';
  const password = formData?.password || '';
  const token = formData?.token || '';
  const apiKeyName = formData?.apiKeyName || 'X-API-Key'; // Common default
  const apiKeyValue = formData?.apiKeyValue || '';
  const apiKeyLocation = formData?.apiKeyLocation || 'header';
  const bodyTemplate = formData?.bodyTemplate || ''; // Often JSON, consider placeholder
  const headers = formData?.headers || ''; // Key-value pairs, newline separated
  const retryOnFailure = formData?.retryOnFailure ?? false; // Default to false, handle boolean
  const maxRetries = formData?.maxRetries ?? 3; // Default numeric
  const retryDelay = formData?.retryDelay ?? 5; // Default numeric

  // Memoized change handler
  const handlePropertyChange = useCallback((field: string, value: any) => {
    let processedValue = value;
    // Ensure numeric types for retry fields
    if (field === 'maxRetries' || field === 'retryDelay') {
        processedValue = parseInt(value, 10);
        if (isNaN(processedValue)) {
            // Set to minimum or default if parsing fails
            processedValue = field === 'maxRetries' ? 1 : 1;
        }
    }
    onNodeUpdate(field, processedValue);
  }, [onNodeUpdate]);

  // Function to construct and copy the full webhook URL
  const handleCopyUrl = () => {
    // Assume a base URL - replace with your actual application's base URL
    const baseUrl = window.location.origin; // Or process.env.REACT_APP_BASE_URL
    const fullUrl = `${baseUrl}${path}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
      // TODO: Add user feedback for copy failure
    });
  };

  // Simple path validation (starts with /)
  const isPathValid = path.startsWith('/');

  return (
    <div className="space-y-4">

      {/* Webhook URL Display and Copy */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Webhook URL
        </label>
        <div className="flex items-center space-x-1.5 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all flex-1">
                {`${window.location.origin.replace(/^https?:\/\//, '')}${path}`}
            </span>
            <button
                onClick={handleCopyUrl}
                className={`p-1 rounded ${copied ? 'text-green-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                title={copied ? "Copied!" : "Copy URL"}
            >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This is the unique URL to trigger this workflow.
        </p>
      </div>

      {/* Endpoint Path */}
      <div>
        <label htmlFor={`${nodeId}-path`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Endpoint Path Segment
        </label>
        <input
          id={`${nodeId}-path`}
          type="text"
          value={path}
          onChange={(e) => handlePropertyChange('path', e.target.value.startsWith('/') ? e.target.value : `/${e.target.value}`)} // Ensure leading slash
          placeholder="/webhook/my-unique-endpoint"
          className={`w-full px-2.5 py-1.5 text-sm border ${isPathValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'} bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 ${isPathValid ? 'focus:ring-blue-500' : 'focus:ring-red-500'} focus:border-transparent dark:text-gray-200 font-mono`}
        />
        {!isPathValid && <p className="text-xs text-red-500 mt-1">Path must start with a '/'.</p>}
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
             Must be unique across all your webhooks.
         </p>
      </div>

      {/* HTTP Method */}
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
          <option value="POST">POST</option>
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          {/* <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option> */}
        </select>
      </div>

       {/* Authentication Section */}
       <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 -mb-1">Authentication</h4>
            <div>
                <label htmlFor={`${nodeId}-auth`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sr-only">
                Authentication Type
                </label>
                <select
                    id={`${nodeId}-auth`}
                    value={auth}
                    onChange={(e) => handlePropertyChange('auth', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.2em 1.2em'
                    }}
                >
                    <option value="none">None (Public)</option>
                    {/* <option value="basic">Basic Auth</option> */}
                    <option value="bearer">Bearer Token</option>
                    <option value="apiKey">API Key</option>
                </select>
            </div>

            {/* Basic Auth Fields (Example, currently commented out in select) */}
            {/* {auth === 'basic' && ( ... )} */}

            {/* Bearer Token Field */}
            {auth === 'bearer' && (
                <div>
                    <label htmlFor={`${nodeId}-token`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Bearer Token
                    </label>
                    <div className="relative">
                        <input
                            id={`${nodeId}-token`}
                            type={showToken ? 'text' : 'password'}
                            value={token}
                            onChange={(e) => handlePropertyChange('token', e.target.value)}
                            className="w-full pl-2.5 pr-10 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title={showToken ? 'Hide token' : 'Show token'}
                        >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                         Checks `Authorization: Bearer [token]` header.
                    </p>
                </div>
            )}

            {/* API Key Fields */}
            {auth === 'apiKey' && (
                <div className="space-y-3">
                    <div>
                        <label htmlFor={`${nodeId}-apiKeyName`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Key Name / Parameter
                        </label>
                        <input
                            id={`${nodeId}-apiKeyName`}
                            type="text"
                            value={apiKeyName}
                            onChange={(e) => handlePropertyChange('apiKeyName', e.target.value)}
                            placeholder={apiKeyLocation === 'header' ? 'X-API-Key' : 'api_key'}
                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label htmlFor={`${nodeId}-apiKeyValue`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Key Value
                        </label>
                         <div className="relative">
                            <input
                                id={`${nodeId}-apiKeyValue`}
                                type={showApiKeyValue ? 'text' : 'password'}
                                value={apiKeyValue}
                                onChange={(e) => handlePropertyChange('apiKeyValue', e.target.value)}
                                className="w-full pl-2.5 pr-10 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKeyValue(!showApiKeyValue)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                title={showApiKeyValue ? 'Hide key value' : 'Show key value'}
                            >
                                {showApiKeyValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor={`${nodeId}-apiKeyLocation`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Send Key In
                        </label>
                        <select
                            id={`${nodeId}-apiKeyLocation`}
                            value={apiKeyLocation}
                            onChange={(e) => handlePropertyChange('apiKeyLocation', e.target.value)}
                             className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundSize: '1.2em 1.2em'
                            }}
                            >
                            <option value="header">Header</option>
                            <option value="query">Query Parameter</option>
                        </select>
                    </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                         Checks for the key/value pair in the specified location.
                    </p>
                </div>
            )}
       </div>


      {/* Request Body Template (Optional?) - This seems more relevant for *sending* webhooks (HTTP Request node)
          than receiving them. For receiving, you usually just process whatever body comes in.
          Keeping it commented out for now unless there's a specific use case for defining an *expected* template. */}
      {/*
      <div>
        <label htmlFor={`${nodeId}-bodyTemplate`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Expected Body Structure (Optional)
        </label>
        <textarea
          id={`${nodeId}-bodyTemplate`}
          value={bodyTemplate}
          onChange={(e) => handlePropertyChange('bodyTemplate', e.target.value)}
          placeholder='{\n  "userId": "{{string}}",\n  "orderId": "{{number}}"\n}'
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 font-mono"
          rows={4}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Define expected keys and types for documentation or validation (e.g. {`{{string}}`, `{{number}}`}).</p>
      </div>
      */}

      {/* Headers to Extract (Optional) - Define which headers are important and should be passed on */}
       <div>
        <label htmlFor={`${nodeId}-headers`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Relevant Headers (Optional)
        </label>
        <textarea
          id={`${nodeId}-headers`}
          value={headers}
          onChange={(e) => handlePropertyChange('headers', e.target.value)}
          placeholder="X-Request-ID
Content-Type"
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 font-mono"
          rows={3}
        />
         <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">List header names (one per line) to extract and pass downstream in the workflow data.</p>
      </div>


       {/* Retry Logic (Less common for inbound webhooks, more for outbound) */}
       {/* Removing retry logic as it's atypical for an *incoming* webhook trigger */}
       {/*
       <div className="pt-2">
            <label htmlFor={`${nodeId}-retryOnFailure`} className="flex items-center space-x-2 cursor-pointer">
                <input
                    id={`${nodeId}-retryOnFailure`}
                    type="checkbox"
                    checked={retryOnFailure} // Use boolean
                    onChange={(e) => handlePropertyChange('retryOnFailure', e.target.checked)} // Pass boolean
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                    Retry on Failure (Webhook Sender Side?)
                </span>
            </label>
       </div>
       */}
       {/* {retryOnFailure && (... retry fields ...)} */}

    </div>
  );
};

export default WebhookProperties;
import React, { useCallback } from 'react';
import type { Node as FlowNode } from 'reactflow';
// Assuming Tool icons are specific, import them directly or map names to icons
import { Search, Calculator, Code, MemoryStick, Database } from 'lucide-react'; // Example icons

// Define tool configuration (including icons)
const availableTools = [
  { name: 'Web Search', icon: Search, description: "Searches the web for current information." },
  { name: 'Calculator', icon: Calculator, description: "Performs mathematical calculations." },
  { name: 'Code Interpreter', icon: Code, description: "Executes Python code snippets." },
  // Add more tools here as needed
];

// Interface for props including formData
interface AIAgentPropertiesProps {
  selectedNode: FlowNode;
  onNodeUpdate: (field: string, value: any) => void; // Simplified signature
  formData: Record<string, any>;
}

const AIAgentProperties = ({ selectedNode, onNodeUpdate, formData }: AIAgentPropertiesProps) => {
  const nodeId = selectedNode.id; // For unique IDs

  // Derive values from formData, providing defaults using ??
  const model = formData?.model ?? 'gemini-pro';
  const systemPrompt = formData?.systemPrompt ?? '';
  const tools = formData?.tools ?? []; // Default to empty array
  const memory = formData?.memory ?? 'none';
  const vectorStoreType = formData?.vectorStoreType ?? 'pinecone'; // Default if memory is vectorstore

  // Memoized change handler
  const handlePropertyChange = useCallback((field: string, value: any) => {
    onNodeUpdate(field, value);
  }, [onNodeUpdate]);

  // Memoized tool toggle handler
  const handleToolToggle = useCallback((toolName: string) => {
    const currentTools: string[] = formData?.tools ?? [];
    const updatedTools = currentTools.includes(toolName)
      ? currentTools.filter((tool: string) => tool !== toolName)
      : [...currentTools, toolName];

    handlePropertyChange('tools', updatedTools);
  }, [formData?.tools, handlePropertyChange]);

  return (
    <div className="space-y-4">
      {/* Model Selection */}
      <div>
        <label htmlFor={`${nodeId}-model`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          AI Model
        </label>
        <select
          id={`${nodeId}-model`}
          value={model}
          onChange={(e) => handlePropertyChange('model', e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
           style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.2em 1.2em'
            }}
        >
          {/* Add more models as needed */}
          <option value="gemini-pro">Google Gemini Pro</option>
          <option value="gpt-4-turbo">OpenAI GPT-4 Turbo</option>
          <option value="gpt-4">OpenAI GPT-4</option>
          <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
          <option value="claude-3-opus">Anthropic Claude 3 Opus</option>
          <option value="claude-3-sonnet">Anthropic Claude 3 Sonnet</option>
          <option value="claude-3-haiku">Anthropic Claude 3 Haiku</option>
          {/* Consider grouping by provider */}
        </select>
      </div>

      {/* System Prompt */}
      <div>
        <label htmlFor={`${nodeId}-systemPrompt`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          System Prompt / Instructions
        </label>
        <textarea
          id={`${nodeId}-systemPrompt`}
          value={systemPrompt}
          onChange={(e) => handlePropertyChange('systemPrompt', e.target.value)}
          placeholder="Define the AI agent's role, personality, and task instructions. E.g., 'You are a helpful assistant that summarizes text.'"
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 min-h-[80px]"
          rows={5} // Increased rows
        />
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Guides the AI's behavior and responses throughout the interaction.
         </p>
      </div>

      {/* Tools Section */}
       <div className="space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Agent Tools</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 mb-2">
                Enable tools the agent can use to perform actions.
            </p>
            {availableTools.map((tool) => {
                const ToolIcon = tool.icon;
                const isChecked = tools.includes(tool.name);
                return (
                    <label // Use label for better click handling
                        key={tool.name}
                        htmlFor={`${nodeId}-tool-${tool.name}`}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isChecked ? 'bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-300 dark:ring-blue-800' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                    >
                    <div className="flex items-center space-x-2">
                        <ToolIcon className={`w-4 h-4 ${isChecked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        <span className={`text-sm ${isChecked ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>{tool.name}</span>
                    </div>
                    <input
                        id={`${nodeId}-tool-${tool.name}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToolToggle(tool.name)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
                    />
                    </label>
                );
            })}
       </div>

      {/* Memory Configuration */}
       <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 -mb-1">Memory</h4>
            <div>
                <label htmlFor={`${nodeId}-memory`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sr-only">
                Memory Type
                </label>
                <select
                    id={`${nodeId}-memory`}
                    value={memory}
                    onChange={(e) => handlePropertyChange('memory', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.2em 1.2em'
                    }}
                    >
                    <option value="none">No Memory (Stateless)</option>
                    <option value="conversation">Conversation History</option>
                    <option value="vectorstore">Vector Store (RAG)</option>
                    {/* Add other memory types like Entity Memory if applicable */}
                </select>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Determines how the agent remembers past interactions or context.
                 </p>
            </div>

            {/* Vector Store Specific Configuration */}
            {memory === 'vectorstore' && (
                <div className="pl-2 border-l-2 border-gray-300 dark:border-gray-600 space-y-3 pt-2">
                    <label htmlFor={`${nodeId}-vectorStoreType`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Vector Store Provider
                    </label>
                    <select
                        id={`${nodeId}-vectorStoreType`}
                        value={vectorStoreType}
                        onChange={(e) => handlePropertyChange('vectorStoreType', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 appearance-none bg-no-repeat bg-right pr-8"
                         style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundSize: '1.2em 1.2em'
                        }}
                    >
                        <option value="pinecone">Pinecone</option>
                        <option value="qdrant">Qdrant</option>
                        <option value="weaviate">Weaviate</option>
                        <option value="chroma">Chroma DB</option>
                        {/* Add more vector store options */}
                    </select>
                    {/* TODO: Add further configuration inputs based on selected vectorStoreType (API Key, Index Name, Environment, etc.) */}
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select the vector database service used for Retrieval-Augmented Generation. Further credentials may be required elsewhere.
                     </p>
                </div>
            )}
       </div>
    </div>
  );
};

export default AIAgentProperties;
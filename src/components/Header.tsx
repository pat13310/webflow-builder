import React, { useRef } from 'react';
import { Play, Sun, Moon, Upload, Download, Square } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import useWorkflowStore from '../store/workflowStore';
import PushButton from './ui/PushButton';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { saveWorkflow, exportWorkflow, importWorkflow, isExecuting, stopExecution, nodes, edges, executeWorkflow } = useWorkflowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      await saveWorkflow();
      // Download workflow as JSON file
      const jsonData = await exportWorkflow();
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const workflow = JSON.parse(content);
        await importWorkflow(workflow);
      } catch (error) {
        console.error('Error importing workflow:', error);
        alert('Invalid workflow file');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecute = () => {
    if (nodes.length === 0) return;
    
    // Trouver les nœuds déclencheurs (nœuds sans arêtes entrantes)
    const triggerNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    if (triggerNodes.length > 0) {
      executeWorkflow(triggerNodes.map(node => node.id));
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 py-2 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-6">
        <div className="text-gray-900 dark:text-white font-bold text-lg flex items-center">
          <Play className="w-5 h-5 mr-2" />
          <span>Workflow Builder</span>
        </div>
        <nav className="flex space-x-4">
          <a href="#" className="text-blue-600 dark:text-blue-400 font-medium text-sm">Workflows</a>
          <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Templates</a>
          <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Settings</a>
        </nav>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <PushButton
          size="sm"
          variant="ghost"
          leftIcon={<Upload className="w-4 h-4" />}
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </PushButton>

        <PushButton
          size="sm"
          variant="ghost"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleSave}
        >
          Export
        </PushButton>

        {isExecuting ? (
          <PushButton
            size="sm"
            variant="danger"
            leftIcon={<Square className="w-4 h-4" />}
            onClick={stopExecution}
          >
            Stop
          </PushButton>
        ) : (
          <PushButton
            size="sm"
            variant="primary"
            leftIcon={<Play className="w-4 h-4" />}
            onClick={handleExecute}
          >
            Execute
          </PushButton>
        )}
      </div>
    </header>
  );
};

export default Header;
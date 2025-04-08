import React, { useRef } from 'react';
import { Play, Sun, Moon, Upload, Download, Square, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import useWorkflowStore from '../store/workflowStore';
import PushButton from './ui/PushButton';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { 
    saveWorkflow, 
    exportWorkflow, 
    importWorkflow, 
    isExecuting, 
    stopExecution, 
    nodes, 
    edges, 
    executeWorkflow,
    scheduleIntervals 
  } = useWorkflowStore();
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
    
    // Find trigger nodes (nodes without incoming edges)
    const triggerNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    if (triggerNodes.length > 0) {
      executeWorkflow(triggerNodes.map(node => node.id));
    }
  };

  interface Schedule {
    nodeId: string;
    intervalValue: number;
    intervalUnit: string;
  }

  // Get schedule intervals info
  const activeSchedules = Array.from(scheduleIntervals.entries())
    .map(([nodeId]) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;

      const intervalValue = parseInt(node.data.intervalValue || '1', 10);
      const intervalUnit = node.data.intervalUnit || 'seconds';
    
      return { nodeId, intervalValue, intervalUnit } as Schedule;
    })
    .filter((schedule): schedule is Schedule => schedule !== null);

  // Function to get human-readable interval text
  const getIntervalText = (value: number, unit: string) => {
    if (value === 1) {
      return unit.slice(0, -1); // Remove 's' from plural
    }
    return `${value} ${unit}`;
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
        {/* Schedule Intervals Indicator */}
        <AnimatePresence>
          {activeSchedules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center mr-2 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
            >
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-pulse mr-1.5" />
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                {activeSchedules.map((schedule, index) => (
                  <span key={schedule.nodeId}>
                    {index > 0 && ", "}
                    {getIntervalText(schedule.intervalValue, schedule.intervalUnit)}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            className="min-w-[80px]"
          >
            Stop
          </PushButton>
        ) : (
          <PushButton
            size="sm"
            variant="primary"
            leftIcon={<Play className="w-4 h-4" />}
            onClick={handleExecute}
            disabled={nodes.length === 0}
            className="min-w-[80px]"
          >
            Execute
          </PushButton>
        )}
      </div>
    </header>
  );
};

export default Header;
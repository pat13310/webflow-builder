import React, { useState, useEffect, useCallback } from 'react';
import { MousePointer, RefreshCw, Save, ChevronRight, X } from 'lucide-react'; // Changed ChevronDown to ChevronRight
import { Node } from 'reactflow';
import WebhookProperties from './properties/WebhookProperties';
import AIAgentProperties from './properties/AIAgentProperties';
import HttpRequestProperties from './properties/HttpRequestProperties';
import ScheduleProperties from './properties/ScheduleProperties';
import DatabaseProperties from './properties/DatabaseProperties';
import PushButtonProperties from './properties/PushButtonProperties';
import CounterProperties from './properties/CounterProperties';
import OutputProperties from './properties/OutputProperties';
import useWorkflowStore from '../store/workflowStore';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  // onNodeUpdate is technically handled by the store now,
  // but kept for potential future direct updates or logging
  onNodeUpdate: (nodeId: string, data: any) => void;
}

const PropertiesPanel = ({ selectedNode, onNodeUpdate }: PropertiesPanelProps) => {
  // Get necessary functions and state from the store
  const { updateNodeData, updateNodeName, saveWorkflow, nodes } = useWorkflowStore(
    (state) => ({
      updateNodeData: state.updateNodeData,
      updateNodeName: state.updateNodeName, // Use the store's updateNodeName
      saveWorkflow: state.saveWorkflow,
      nodes: state.nodes, // Need nodes to compare for dirtiness
    })
  );

  // Local state for UI
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<any>(null);

  // Effect to initialize form data when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setCurrentFormData(selectedNode.data);
      setIsDirty(false); // Reset dirty state when node changes
      setShowSaveSuccess(false); // Hide success message
      setIsCollapsed(false); // S'assurer que le panneau est ouvert quand un nœud est sélectionné
    } else {
      setCurrentFormData(null);
      setIsDirty(false);
    }
  }, [selectedNode]);

  // Gérer la temporisation de la fermeture et de l'ouverture
  const handleCollapse = () => {
    if (isDirty) {
      // Si des modifications sont en cours, demander confirmation
      if (window.confirm('Des modifications sont en cours. Voulez-vous vraiment fermer ?')) {
        setIsCollapsed(true);
      }
    } else {
      // Si aucune modification, ajouter une temporisation de 1 seconde
      setTimeout(() => {
        setIsCollapsed(true);
      }, 1000);
    }
  };

  const handleExpand = () => {
    // Ajouter une temporisation de 1 seconde pour l'ouverture
    setTimeout(() => {
      setIsCollapsed(false);
    }, 1000);
  };

  // Function to handle property changes locally before updating the store
  const handlePropertyChange = useCallback((field: string, value: any) => {
    if (!selectedNode) return;

    const updatedData = {
      ...currentFormData, // Use local form state
      [field]: value,
    };
    setCurrentFormData(updatedData); // Update local form state

    // Check if the data actually changed compared to the store's version
    const originalNode = nodes.find(n => n.id === selectedNode.id);
    const originalData = originalNode?.data || {};
    
    // Simple deep comparison (could be improved for performance if needed)
    const hasChanged = JSON.stringify(updatedData) !== JSON.stringify(originalData);
    setIsDirty(hasChanged);
    
    setShowSaveSuccess(false);

    // Update the node in the store immediately for reactivity
    // This ensures connected components react to changes in real-time
    updateNodeData(selectedNode.id, updatedData);

    // If the label changed, also update the node name specifically (might update graph node label)
    if (field === 'label') {
      updateNodeName(selectedNode.id, value);
    }

    // Call the prop callback (optional, depends on parent component needs)
    onNodeUpdate(selectedNode.id, updatedData);

  }, [selectedNode, currentFormData, updateNodeData, updateNodeName, onNodeUpdate, nodes]);


  const handleSave = async () => {
    if (!isDirty || !selectedNode) return;

    try {
      setIsSaving(true);
      // The node data is already up-to-date in the store via handlePropertyChange
      // saveWorkflow should save the entire current state from the store
      await saveWorkflow();
      setIsDirty(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2500);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du workflow:', error);
      // TODO: Ajouter un retour utilisateur pour l'erreur de sauvegarde
    } finally {
      setIsSaving(false);
      // Ne pas fermer la modale après la sauvegarde
      setTimeout(() => {
        setIsCollapsed(true);
      }, 1000);
    }
  };

  const handleRevert = () => {
    if (!selectedNode) return;
    // Find the original node data from the store (before local edits)
    const originalNode = nodes.find(n => n.id === selectedNode.id);
    if (originalNode) {
        setCurrentFormData(originalNode.data); // Reset local form state
        updateNodeData(selectedNode.id, originalNode.data); // Update store back to original
        if (originalNode.data.label !== currentFormData?.label) {
            updateNodeName(selectedNode.id, originalNode.data.label); // Revert name if changed
        }
        setIsDirty(false); // Mark as not dirty
        onNodeUpdate(selectedNode.id, originalNode.data); // Notify parent (optional)
    }
  }

  // Render placeholder if no node is selected
  if (!selectedNode || !currentFormData) {
    return (
      <div className="absolute top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-lg">
        <div className="p-2 h-10 border-b border-gray-200 dark:border-gray-800 flex items-center bg-gray-50 dark:bg-gray-800/50">
          <h2 className="font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Node Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MousePointer className="w-6 h-6 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium">Select a node</p>
            <p className="text-xs text-gray-400">Choose a node on the canvas to view and edit its properties.</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper to format node type label
  const formatNodeTypeLabel = (type: string | undefined): string => {
    if (!type) return 'Node';
    // Add space before capital letters (except the first one) and capitalize
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const nodeTypeLabel = formatNodeTypeLabel(selectedNode.type);

  const renderProperties = () => {
    switch (selectedNode.type) {
      case 'webhook':
        return <WebhookProperties selectedNode={selectedNode} onNodeUpdate={handlePropertyChange} formData={currentFormData} />;
      case 'aiAgent':
        return <AIAgentProperties selectedNode={selectedNode} onNodeUpdate={handlePropertyChange} formData={currentFormData} />;
      case 'httpRequest':
        return <HttpRequestProperties selectedNode={selectedNode} onNodeUpdate={handlePropertyChange} formData={currentFormData} />;
      case 'schedule':
        return <ScheduleProperties selectedNode={selectedNode} onNodeUpdate={handlePropertyChange} formData={currentFormData} />;
      case 'database':
        return <DatabaseProperties selectedNode={selectedNode} onNodeUpdate={handlePropertyChange} formData={currentFormData} />;
      case 'pushButton':
        return <PushButtonProperties selectedNode={selectedNode} onNodeUpdate={handlePropertyChange} formData={currentFormData} />;
      case 'counter':
        return <CounterProperties selectedNode={selectedNode} onNodeUpdate={handlePropertyChange} formData={currentFormData} />;
      case 'output':
        return <OutputProperties selectedNode={selectedNode} onNodeUpdate={handlePropertyChange} formData={currentFormData} />;
      default:
        return <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No specific properties for this node type.</div>;
    }
  };

  return (
    <div className={`absolute top-0 right-0 h-full ${isCollapsed ? 'w-10' : 'w-72'} transition-width duration-300 ease-in-out z-10`}>
      <div className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-3 h-10 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
          {!isCollapsed ? (
            <>
              <div className="flex items-center space-x-2 overflow-hidden">
                {/* Placeholder for potential node icon */}
                {/* <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-900"></div> */}
                <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate" title={nodeTypeLabel}>
                    {nodeTypeLabel} Properties
                </h2>
              </div>
              <button
                onClick={handleCollapse}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 -mr-1"
                aria-label="Fermer le panneau"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleExpand}
              className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Ouvrir le panneau"
            >
              <ChevronRight className="w-4 h-4 transform rotate-180" /> {/* Pointing left when collapsed */}
            </button>
          )}
        </div>

        {/* Content - Only render if not collapsed */}
        {!isCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar class if you have specific styles */}
              <div className="p-3 space-y-4">
                {/* Common Properties: Name */}
                <div>
                  <label htmlFor={`node-name-${selectedNode.id}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Node Name</label>
                  <input
                    id={`node-name-${selectedNode.id}`}
                    type="text"
                    value={currentFormData?.label || ''}
                    onChange={(e) => handlePropertyChange('label', e.target.value)}
                    placeholder="Enter node name"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                {/* Common Properties: Description */}
                <div>
                  <label htmlFor={`node-desc-${selectedNode.id}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description <span className="text-gray-400">(Optional)</span></label>
                  <textarea
                    id={`node-desc-${selectedNode.id}`}
                    value={currentFormData?.description || ''}
                    onChange={(e) => handlePropertyChange('description', e.target.value)}
                    placeholder="Add a short description..."
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 min-h-[40px]"
                    rows={2}
                  />
                </div>
                 <hr className="border-gray-200 dark:border-gray-700" />
              </div>


              {/* Type-Specific Properties */}
              <div className="px-3 pb-3">
                {renderProperties()}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center transition-all duration-150 ${
                    isDirty && !isSaving
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Save className={`w-4 h-4 mr-1.5 ${isSaving ? 'animate-spin' : ''}`} />
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={handleRevert}
                  disabled={!isDirty || isSaving}
                  title="Revert unsaved changes"
                  className={`p-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center justify-center ${
                      isDirty && !isSaving
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 focus:outline-none'
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {showSaveSuccess && (
                <div className="mt-2 text-center text-xs text-green-600 dark:text-green-400 animate-pulse">
                  Workflow sauvegardé avec succès !
                </div>
              )}
              {!isDirty && !showSaveSuccess && !isSaving && (
                 <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                   Aucune modification non sauvegardée.
                 </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
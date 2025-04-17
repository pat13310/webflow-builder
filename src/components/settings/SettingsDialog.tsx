import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import APICredentialsForm from './APICredentialsForm';
import APIsTableForm from './APIsTableForm';
import AIModelsForm from './AIModelsForm';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'credentials' | 'apis' | 'models'>('credentials');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Réinitialiser l'état lorsque le dialogue s'ouvre
  useEffect(() => {
    if (isOpen) {
      setIsDirty(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Logique de sauvegarde ici
      await new Promise(resolve => setTimeout(resolve, 500)); // Simuler un délai
      setIsDirty(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = () => {
    setIsDirty(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Paramètres</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'credentials'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('credentials')}
          >
            Credentials API
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'apis'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('apis')}
          >
            APIs
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'models'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('models')}
          >
            Modèles IA
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'credentials' ? (
            <APICredentialsForm onChange={handleChange} />
          ) : activeTab === 'apis' ? (
            <APIsTableForm onChange={handleChange} />
          ) : (
            <AIModelsForm onChange={handleChange} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md mr-2 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center ${
              !isDirty || isSaving
                ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsDialog;

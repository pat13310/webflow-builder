import React, { useState, useEffect } from 'react';
import { Key, Edit, Check, X, Trash2 } from 'lucide-react';

interface APICredential {
  id: string;
  name: string;
  key: string;
  service: 'google' | 'openai' | 'azure' | 'other';
}

interface APICredentialsFormProps {
  onChange: () => void;
}

const APICredentialsForm: React.FC<APICredentialsFormProps> = ({ onChange }) => {
  const [credentials, setCredentials] = useState<APICredential[]>([]);
  const [editingCredential, setEditingCredential] = useState<APICredential | null>(null);
  const [newCredential, setNewCredential] = useState<Omit<APICredential, 'id'>>({
    name: '',
    key: '',
    service: 'google',
  });

  // Charger les credentials depuis le localStorage au démarrage
  useEffect(() => {
    const savedCredentials = localStorage.getItem('api_credentials');
    if (savedCredentials) {
      try {
        setCredentials(JSON.parse(savedCredentials));
      } catch (error) {
        console.error("Erreur lors du chargement des credentials:", error);
      }
    }
  }, []);

  // Sauvegarder les credentials dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('api_credentials', JSON.stringify(credentials));
  }, [credentials]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, target: 'new' | 'edit') => {
    const { name, value } = e.target;
    
    if (target === 'new') {
      setNewCredential(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (editingCredential) {
      setEditingCredential({
        ...editingCredential,
        [name]: value
      });
    }
  };

  const addCredential = () => {
    if (!newCredential.name || !newCredential.key) return;
    
    const newId = `cred_${Date.now()}`;
    const updatedCredentials = [...credentials, { ...newCredential, id: newId }];
    
    setCredentials(updatedCredentials);
    setNewCredential({
      name: '',
      key: '',
      service: 'google',
    });
    
    onChange(); // Notifier le parent du changement
  };

  const removeCredential = (id: string) => {
    setCredentials(credentials.filter(cred => cred.id !== id));
    onChange(); // Notifier le parent du changement
  };

  const startEdit = (credential: APICredential) => {
    setEditingCredential(credential);
  };

  const cancelEdit = () => {
    setEditingCredential(null);
  };

  const updateCredential = () => {
    if (!editingCredential || !editingCredential.name || !editingCredential.key) return;
    
    const updatedCredentials = credentials.map(cred => 
      cred.id === editingCredential.id ? editingCredential : cred
    );
    
    setCredentials(updatedCredentials);
    setEditingCredential(null);
    
    onChange(); // Notifier le parent du changement
  };

  // Liste des services disponibles
  const availableServices = [
    { value: 'google', label: 'Google API' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'azure', label: 'Azure' },
    { value: 'deepseek', label: 'DeepSeek AI' },
    { value: 'ollama', label: 'Ollama' },
    { value: 'cohere', label: 'Cohere' },
    { value: 'local', label: 'Local' },
    { value: 'mistral', label: 'Mistral AI' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'replicate', label: 'Replicate' },
    { value: 'huggingface', label: 'HuggingFace' },
    { value: 'stability', label: 'Stability AI' },
    { value: 'perplexity', label: 'Perplexity AI' },
    { value: 'groq', label: 'Groq' },
    { value: 'together', label: 'Together AI' },
    { value: 'anyscale', label: 'Anyscale' },
    { value: 'qwen', label: 'Qwen (Alibaba)' },
    { value: 'gwencode', label: 'GWencode (Alibaba)' },
    { value: 'alibaba', label: 'Alibaba Cloud' },
    { value: 'other', label: 'Autre' }
  ];
  
  const getServiceLabel = (service: string) => {
    const serviceItem = availableServices.find(s => s.value === service);
    return serviceItem ? serviceItem.label : 'Autre';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Credentials API</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Gérez vos clés API pour les différents services externes utilisés par l'application.
        </p>
      </div>

      {/* Liste des credentials existants */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Clés API enregistrées</h4>
        
        {credentials.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Aucune clé API enregistrée
          </div>
        ) : (
          <div className="space-y-2">
            {credentials.map(cred => (
              editingCredential && editingCredential.id === cred.id ? (
                <div 
                  key={cred.id} 
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md"
                >
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingCredential.name}
                      onChange={(e) => handleInputChange(e, 'edit')}
                      className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service
                    </label>
                    <select
                      name="service"
                      value={editingCredential.service}
                      onChange={(e) => handleInputChange(e, 'edit')}
                      className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="google">Google API</option>
                      <option value="openai">OpenAI</option>
                      <option value="azure">Azure</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Clé API
                    </label>
                    <input
                      type="password"
                      name="key"
                      value={editingCredential.key}
                      onChange={(e) => handleInputChange(e, 'edit')}
                      className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={updateCredential}
                      className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded flex items-center"
                    >
                      <Check className="w-3 h-3 mr-1" /> Sauvegarder
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  key={cred.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  <div>
                    <div className="flex items-center">
                      <Key className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">{cred.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getServiceLabel(cred.service)} • 
                      <span className="ml-1">
                        {cred.key.substring(0, 4)}...{cred.key.substring(cred.key.length - 4)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(cred)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeCredential(cred.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Ajouter une nouvelle clé API</h4>
        
        <div className="space-y-3">
          <div>
            <label htmlFor="service" className="block text-xs font-medium uppercase text-gray-700 dark:text-gray-500 mb-1">
              Service
            </label>
            <select
              id="service"
              name="service"
              value={newCredential.service}
              onChange={(e) => handleInputChange(e, 'new')}
              className="text-xs w-full px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              {availableServices.map(service => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-xs font-medium uppercase text-gray-700 dark:text-gray-500 mb-1">
              Nom de la clé
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newCredential.name}
              onChange={(e) => handleInputChange(e, 'new')}
              placeholder="ex: Google Maps API Key"
              className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="key" className="block text-xs uppercase font-medium text-gray-700 dark:text-gray-500 mb-1">
              Clé API
            </label>
            <input
              type="password"
              id="key"
              name="key"
              value={newCredential.key}
              onChange={(e) => handleInputChange(e, 'new')}
              placeholder="Entrez votre clé API"
              className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          
          <button
            onClick={addCredential}
            disabled={!newCredential.name || !newCredential.key}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              !newCredential.name || !newCredential.key
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default APICredentialsForm;

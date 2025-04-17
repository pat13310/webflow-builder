import { useState, useEffect } from 'react';
import { Globe, Trash2, Edit, Check, X } from 'lucide-react';

interface API {
  id: string;
  name: string;
  endpoint: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  isActive: boolean;
}

interface APIsTableFormProps {
  onChange: () => void;
}

const APIsTableForm: React.FC<APIsTableFormProps> = ({ onChange }) => {
  const [apis, setApis] = useState<API[]>([]);
  const [editingApi, setEditingApi] = useState<API | null>(null);
  const [newApi, setNewApi] = useState<Omit<API, 'id'>>({
    name: '',
    endpoint: '',
    description: '',
    method: 'GET',
    isActive: true
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Charger les APIs depuis le localStorage au démarrage
  useEffect(() => {
    const savedApis = localStorage.getItem('apis_table');
    if (savedApis) {
      try {
        setApis(JSON.parse(savedApis));
      } catch (error) {
        console.error("Erreur lors du chargement des APIs:", error);
      }
    }
  }, []);

  // Sauvegarder les APIs dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('apis_table', JSON.stringify(apis));
  }, [apis]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, target: 'new' | 'edit') => {
    const { name, value } = e.target;
    
    if (target === 'new') {
      setNewApi(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (editingApi) {
      setEditingApi({
        ...editingApi,
        [name]: value
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const { name, checked } = e.target;
    
    if (target === 'new') {
      setNewApi(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (editingApi) {
      setEditingApi({
        ...editingApi,
        [name]: checked
      });
    }
  };

  const addApi = () => {
    if (!newApi.name || !newApi.endpoint) return;
    
    const newId = `api_${Date.now()}`;
    const updatedApis = [...apis, { ...newApi, id: newId }];
    
    setApis(updatedApis);
    setNewApi({
      name: '',
      endpoint: '',
      description: '',
      method: 'GET',
      isActive: true
    });
    setIsAddingNew(false);
    
    onChange(); // Notifier le parent du changement
  };

  const updateApi = () => {
    if (!editingApi || !editingApi.name || !editingApi.endpoint) return;
    
    const updatedApis = apis.map(api => 
      api.id === editingApi.id ? editingApi : api
    );
    
    setApis(updatedApis);
    setEditingApi(null);
    
    onChange(); // Notifier le parent du changement
  };

  const removeApi = (id: string) => {
    setApis(apis.filter(api => api.id !== id));
    onChange(); // Notifier le parent du changement
  };

  const cancelEdit = () => {
    setEditingApi(null);
  };

  const cancelAdd = () => {
    setIsAddingNew(false);
    setNewApi({
      name: '',
      endpoint: '',
      description: '',
      method: 'GET',
      isActive: true
    });
  };

  const startEdit = (api: API) => {
    setEditingApi(api);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tableau des APIs</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Gérez les endpoints API disponibles pour vos workflows.
        </p>
      </div>

      {/* Tableau des APIs */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Endpoint
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Méthode
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {apis.length === 0 && !isAddingNew ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center italic">
                  Aucune API enregistrée
                </td>
              </tr>
            ) : (
              apis.map(api => (
                editingApi && editingApi.id === api.id ? (
                  <tr key={api.id} className="bg-blue-50 dark:bg-blue-900/20">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        name="name"
                        value={editingApi.name}
                        onChange={(e) => handleInputChange(e, 'edit')}
                        className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        name="endpoint"
                        value={editingApi.endpoint}
                        onChange={(e) => handleInputChange(e, 'edit')}
                        className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        name="method"
                        value={editingApi.method}
                        onChange={(e) => handleInputChange(e, 'edit')}
                        className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`isActive-edit-${api.id}`}
                          name="isActive"
                          checked={editingApi.isActive}
                          onChange={(e) => handleCheckboxChange(e, 'edit')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`isActive-edit-${api.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Actif
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={updateApi}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Sauvegarder"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Annuler"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={api.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {api.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {api.endpoint}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        api.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        api.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        api.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {api.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        api.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {api.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => startEdit(api)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => removeApi(api.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                )
              ))
            )}
            
            {/* Ligne pour ajouter une nouvelle API */}
            {isAddingNew && (
              <tr className="bg-green-50 dark:bg-green-900/20">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    name="name"
                    value={newApi.name}
                    onChange={(e) => handleInputChange(e, 'new')}
                    placeholder="Nom de l'API"
                    className="w-full px-2 py-1 text-sm border border-green-300 dark:border-green-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    name="endpoint"
                    value={newApi.endpoint}
                    onChange={(e) => handleInputChange(e, 'new')}
                    placeholder="https://api.exemple.com/v1"
                    className="w-full px-2 py-1 text-sm border border-green-300 dark:border-green-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    name="method"
                    value={newApi.method}
                    onChange={(e) => handleInputChange(e, 'new')}
                    className="w-full px-2 py-1 text-sm border border-green-300 dark:border-green-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive-new"
                      name="isActive"
                      checked={newApi.isActive}
                      onChange={(e) => handleCheckboxChange(e, 'new')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive-new" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Actif
                    </label>
                  </div>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={addApi}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Ajouter"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelAdd}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Annuler"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bouton pour ajouter une nouvelle API */}
      {!isAddingNew && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md flex items-center"
          >
            <span className="mr-2">+</span> Ajouter une API
          </button>
        </div>
      )}

      {/* Description détaillée (visible uniquement lors de l'édition ou de l'ajout) */}
      {(editingApi || isAddingNew) && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </h4>
          <textarea
            name="description"
            value={editingApi ? editingApi.description : newApi.description}
            onChange={(e) => handleInputChange(e, editingApi ? 'edit' : 'new')}
            placeholder="Description détaillée de l'API et de son utilisation..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

export default APIsTableForm;

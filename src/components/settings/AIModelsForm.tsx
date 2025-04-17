import { useState, useEffect } from 'react';
import { Brain, Star, Edit, Trash2, Plus, Info, AlertCircle, ChevronUp } from 'lucide-react';
import { AIModel, AIModelsFormProps } from './types';
import { predefinedModels, getProviderIcon, getCapabilityLabel, formatCost } from './predefinedModels';

const AIModelsForm: React.FC<AIModelsFormProps> = ({ onChange }) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newModel, setNewModel] = useState<Omit<AIModel, 'id'>>({
    name: '',
    provider: 'openai',
    modelId: '',
    isDefault: false,
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 8192,
    costPer1kTokens: {
      input: 0.0015,
      output: 0.002,
    },
    maxTokens: 4096,
    description: '',
    tags: [],
    version: '1.0',
  });

  // Charger les modèles depuis le localStorage au démarrage
  useEffect(() => {
    const savedModels = localStorage.getItem('ai_models');
    if (savedModels) {
      try {
        setModels(JSON.parse(savedModels));
      } catch (error) {
        console.error("Erreur lors du chargement des modèles IA:", error);
      }
    }
  }, []);

  // Sauvegarder les modèles dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('ai_models', JSON.stringify(models));
  }, [models]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, target: 'new' | 'edit') => {
    const { name, value } = e.target;
    
    if (target === 'new') {
      if (name.includes('.')) {
        // Gestion des propriétés imbriquées comme 'capabilities.chat'
        const [parent, child] = name.split('.');
        setNewModel((prev: Omit<AIModel, 'id'>) => {
          const parentKey = parent as keyof Omit<AIModel, 'id'>;
          const parentValue = prev[parentKey] as Record<string, any>;
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value === 'true' ? true : value === 'false' ? false : value
            }
          };
        });
      } else {
        setNewModel((prev: Omit<AIModel, 'id'>) => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (editingModel) {
      if (name.includes('.')) {
        // Gestion des propriétés imbriquées comme 'capabilities.chat'
        const [parent, child] = name.split('.');
        const parentKey = parent as keyof AIModel;
        const parentValue = editingModel[parentKey] as Record<string, any>;
        setEditingModel({
          ...editingModel,
          [parent]: {
            ...parentValue,
            [child]: value === 'true' ? true : value === 'false' ? false : value
          }
        });
      } else {
        setEditingModel({
          ...editingModel,
          [name]: value
        });
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const { name, checked } = e.target;
    
    if (target === 'new') {
      if (name.includes('.')) {
        // Gestion des propriétés imbriquées comme 'capabilities.chat'
        const [parent, child] = name.split('.');
        setNewModel((prev: Omit<AIModel, 'id'>) => {
          const parentKey = parent as keyof Omit<AIModel, 'id'>;
          const parentValue = prev[parentKey] as Record<string, any>;
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: checked
            }
          };
        });
      } else {
        setNewModel((prev: Omit<AIModel, 'id'>) => ({
          ...prev,
          [name]: checked
        }));
      }
    } else if (editingModel) {
      if (name.includes('.')) {
        // Gestion des propriétés imbriquées comme 'capabilities.chat'
        const [parent, child] = name.split('.');
        const parentKey = parent as keyof AIModel;
        const parentValue = editingModel[parentKey] as Record<string, any>;
        setEditingModel({
          ...editingModel,
          [parent]: {
            ...parentValue,
            [child]: checked
          }
        });
      } else {
        setEditingModel({
          ...editingModel,
          [name]: checked
        });
      }
    }
  };

  const addModel = () => {
    if (!newModel.name || !newModel.modelId) return;

    const newId = `model_${Date.now()}`;

    // Si le nouveau modèle est défini par défaut, désactiver l'option pour tous les autres
    let updatedModels = [...models];
    if (newModel.isDefault) {
      updatedModels = updatedModels.map(model => ({
        ...model,
        isDefault: false,
      }));
    }

    // Si aucun modèle n'est défini par défaut et c'est le premier modèle, le définir par défaut
    const shouldBeDefault = newModel.isDefault || models.length === 0;

    updatedModels.push({
      ...newModel,
      id: newId,
      isDefault: shouldBeDefault,
    });

    setModels(updatedModels);
    setNewModel({
      name: '',
      provider: 'openai',
      modelId: '',
      isDefault: false,
      capabilities: {
        chat: true,
        completion: true,
        embeddings: false,
        vision: false,
        audio: false,
      },
      contextWindow: 8192,
      costPer1kTokens: {
        input: 0.0015,
        output: 0.002,
      },
      maxTokens: 4096,
      description: '',
      tags: [],
      version: '1.0',
    });

    onChange(updatedModels);
  };

  const removeModel = (id: string) => {
    const modelToRemove = models.find(model => model.id === id);
    const remainingModels = models.filter(model => model.id !== id);

    // Si le modèle supprimé était le modèle par défaut, définir le premier modèle restant comme défaut
    if (modelToRemove?.isDefault && remainingModels.length > 0) {
      remainingModels[0].isDefault = true;
    }

    setModels(remainingModels);
    setSelectedModel(null);
    onChange(remainingModels);
  };

  const startEdit = (model: AIModel) => {
    setEditingModel(model);
  };

  const cancelEdit = () => {
    setEditingModel(null);
  };

  const updateModel = () => {
    if (!editingModel || !editingModel.name || !editingModel.modelId) return;

    // Si le modèle édité est défini par défaut, désactiver l'option pour tous les autres
    let updatedModels = models.map(model =>
      model.id === editingModel.id ? editingModel : (editingModel.isDefault ? { ...model, isDefault: false } : model)
    );

    setModels(updatedModels);
    setEditingModel(null);

    onChange(updatedModels);
  };

  const viewModelDetails = (model: AIModel) => {
    setSelectedModel(model === selectedModel ? null : model);
  };

  // Fonction pour ajouter un tag au modèle en cours d'édition ou au nouveau modèle
  // Cette fonction est actuellement non utilisée mais peut être utile pour des fonctionnalités futures
  /*
  const addTag = (tag: string) => {
    if (editingModel) {
      if (!editingModel.tags.includes(tag)) {
        setEditingModel({
          ...editingModel,
          tags: [...editingModel.tags, tag],
        });
      }
    } else {
      if (!newModel.tags.includes(tag)) {
        setNewModel(prev => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
      }
    }
  };
  */

  // Fonction pour supprimer un tag du modèle en cours d'édition ou du nouveau modèle
  // Cette fonction est actuellement non utilisée mais peut être utile pour des fonctionnalités futures
  /*
  const removeTag = (tag: string) => {
    if (editingModel) {
      setEditingModel({
        ...editingModel,
        tags: editingModel.tags.filter(t => t !== tag),
      });
    } else {
      setNewModel(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag),
      }));
    }
  };
  */

  const setAsDefault = (id: string) => {
    const updatedModels = models.map(model => ({
      ...model,
      isDefault: model.id === id
    })) as AIModel[];
    
    setModels(updatedModels);
    onChange(updatedModels);
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'google': return 'Google AI';
      case 'azure': return 'Azure OpenAI';
      default: return 'Autre';
    }
  };

  // Fonction pour ajouter un modèle prédéfini
  const addPredefinedModel = (modelKey: string) => {
    const modelTemplate = predefinedModels[modelKey];
    if (!modelTemplate) return;
    
    const newId = `model_${Date.now()}`;
    
    // Si aucun modèle n'est défini par défaut, définir celui-ci comme défaut
    const shouldBeDefault = models.length === 0 || !models.some(m => m.isDefault);
    
    const newModel = {
      ...modelTemplate,
      id: newId,
      isDefault: shouldBeDefault
    };
    
    // Si ce modèle est défini par défaut, désactiver l'option pour tous les autres
    let updatedModels = [...models];
    if (shouldBeDefault) {
      updatedModels = updatedModels.map(model => ({
        ...model,
        isDefault: false
      }));
    }
    
    const finalModels = [...updatedModels, newModel];
    setModels(finalModels);
    onChange(finalModels);
  };

  // Grouper les modèles par fournisseur
  const modelsByProvider = models.reduce((acc, model) => {
    const provider = model.provider;
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  const [showPredefinedModels, setShowPredefinedModels] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Modèles d'IA</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configurez les modèles d'intelligence artificielle que vous souhaitez utiliser dans vos workflows.
        </p>
      </div>

      {/* Bouton pour ajouter des modèles prédéfinis */}
      <div className="mb-4">
        <button
          onClick={() => setShowPredefinedModels(!showPredefinedModels)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md"
        >
          {showPredefinedModels ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Masquer les modèles prédéfinis
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un modèle prédéfini
            </>
          )}
        </button>
      </div>

      {/* Liste des modèles prédéfinis */}
      {showPredefinedModels && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Modèles prédéfinis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(predefinedModels).map(([key, model]) => (
              <div 
                key={key}
                className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => addPredefinedModel(key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">{getProviderIcon(model.provider)}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{model.name}</span>
                  </div>
                  <Plus className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getProviderLabel(model.provider)} • {model.modelId}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {model.capabilities.vision && (
                    <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                      Vision
                    </span>
                  )}
                  {model.contextWindow >= 100000 && (
                    <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                      Long contexte
                    </span>
                  )}
                  {model.tags.includes('économique') && (
                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      Économique
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des modèles existants par fournisseur */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Modèles configurés</h4>
        
        {models.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
            <Brain className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            Aucun modèle d'IA configuré
            <p className="mt-1 text-xs">Utilisez le bouton ci-dessus pour ajouter des modèles prédéfinis</p>
          </div>
        ) : (
          Object.entries(modelsByProvider).map(([provider, providerModels]) => (
            <div key={provider} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center">
                <span className="mr-2 text-lg">{getProviderIcon(provider)}</span>
                <h5 className="font-medium text-gray-700 dark:text-gray-300">{getProviderLabel(provider)}</h5>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{providerModels.length} modèle(s)</span>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {providerModels.map(model => (
                  <div 
                    key={model.id} 
                    className={`p-3 ${model.isDefault ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {model.name}
                          </span>
                          {model.isDefault && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded">
                              Par défaut
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {model.modelId} • {model.contextWindow.toLocaleString()} tokens • v{model.version}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewModelDetails(model)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Détails"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEdit(model)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!model.isDefault && (
                          <button
                            onClick={() => setAsDefault(model.id)}
                            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Définir par défaut"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeModel(model.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Détails du modèle */}
                    {selectedModel && selectedModel.id === model.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Capacités</h6>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(model.capabilities).map(([capability, enabled]) => 
                              enabled ? (
                                <span 
                                  key={capability}
                                  className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded"
                                >
                                  {getCapabilityLabel(capability)}
                                </span>
                              ) : null
                            )}
                          </div>
                          
                          <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-3 mb-2">Tags</h6>
                          <div className="flex flex-wrap gap-1">
                            {model.tags.length > 0 ? model.tags.map(tag => (
                              <span 
                                key={tag}
                                className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                              >
                                {tag}
                              </span>
                            )) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400 italic">Aucun tag</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Coût</h6>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              <span className="text-gray-500 dark:text-gray-400">Entrée:</span>
                              <span className="block font-medium text-gray-800 dark:text-gray-200">
                                {formatCost(model.costPer1kTokens.input)}/1k tokens
                              </span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              <span className="text-gray-500 dark:text-gray-400">Sortie:</span>
                              <span className="block font-medium text-gray-800 dark:text-gray-200">
                                {formatCost(model.costPer1kTokens.output)}/1k tokens
                              </span>
                            </div>
                          </div>
                          
                          <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-3 mb-2">Description</h6>
                          <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {model.description || "Aucune description disponible."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note d'information */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-3 flex-shrink-0" />
          <div>
            <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Information importante</h5>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
              Les modèles d'IA sont utilisés par les nœuds AI Agent dans vos workflows. Vous pouvez ajouter des modèles prédéfinis ou créer vos propres configurations personnalisées.
            </p>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              <strong>Note:</strong> Pour utiliser ces modèles, vous devez configurer les clés API correspondantes dans l'onglet "Credentials API".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelsForm;

// Définition de l'interface AIModel directement dans ce fichier pour éviter les problèmes d'importation
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'google' | 'anthropic' | 'azure' | 'mistral' | 'cohere' | 'local' | 'deepseek' | 'ollama' | 'other';
  modelId: string;
  isDefault: boolean;
  capabilities: {
    chat: boolean;
    completion: boolean;
    embeddings: boolean;
    vision: boolean;
    audio: boolean;
  };
  contextWindow: number;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  maxTokens: number;
  description: string;
  tags: string[];
  version: string;
}

export type PredefinedModelTemplate = Omit<AIModel, 'id' | 'isDefault'>;

export const predefinedModels: Record<string, PredefinedModelTemplate> = {
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'openai',
    modelId: 'gpt-4-turbo-2024-04-09',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: true,
      audio: false,
    },
    contextWindow: 128000,
    costPer1kTokens: {
      input: 0.01,
      output: 0.03,
    },
    maxTokens: 4096,
    description: 'Modèle avancé d\'OpenAI avec excellente compréhension et capacités multimodales. Version d\'avril 2024.',
    tags: ['openai', 'chat', 'vision', 'multimodal'],
    version: '2024-04-09',
  },
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o-2024-05-13',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: true,
      audio: true,
    },
    contextWindow: 128000,
    costPer1kTokens: {
      input: 0.005,
      output: 0.015,
    },
    maxTokens: 4096,
    description: 'Le modèle phare d\'OpenAI, combinant performances élevées et coût réduit. Supporte l\'audio et la vision.',
    tags: ['openai', 'chat', 'vision', 'audio', 'multimodal'],
    version: '2024-05-13',
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    modelId: 'gpt-3.5-turbo-0125',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 16385,
    costPer1kTokens: {
      input: 0.0005,
      output: 0.0015,
    },
    maxTokens: 4096,
    description: 'Modèle rapide et économique pour la plupart des cas d\'utilisation. Excellent rapport performance/coût.',
    tags: ['openai', 'chat', 'économique', 'rapide'],
    version: '0125',
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    modelId: 'claude-3-opus-20240229',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: true,
      audio: false,
    },
    contextWindow: 200000,
    costPer1kTokens: {
      input: 0.015,
      output: 0.075,
    },
    maxTokens: 4096,
    description: 'Modèle le plus puissant d\'Anthropic avec raisonnement avancé, analyse complexe et compréhension nuancée.',
    tags: ['anthropic', 'claude', 'vision', 'raisonnement'],
    version: '20240229',
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    modelId: 'claude-3-sonnet-20240229',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: true,
      audio: false,
    },
    contextWindow: 200000,
    costPer1kTokens: {
      input: 0.003,
      output: 0.015,
    },
    maxTokens: 4096,
    description: 'Équilibre optimal entre performances et coût. Idéal pour applications professionnelles et assistance.',
    tags: ['anthropic', 'claude', 'vision', 'équilibré'],
    version: '20240229',
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    modelId: 'claude-3-haiku-20240307',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: true,
      audio: false,
    },
    contextWindow: 200000,
    costPer1kTokens: {
      input: 0.00025,
      output: 0.00125,
    },
    maxTokens: 4096,
    description: 'Modèle ultra-rapide pour applications temps réel. Coût très bas, idéal pour chatbots et assistance.',
    tags: ['anthropic', 'claude', 'rapide', 'vision', 'économique'],
    version: '20240307',
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    modelId: 'gemini-1.5-pro-latest',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: true,
      audio: true,
    },
    contextWindow: 1000000,
    costPer1kTokens: {
      input: 0.0005,
      output: 0.0015,
    },
    maxTokens: 8192,
    description: 'Modèle multimodal de Google avec fenêtre contextuelle d\'1M tokens. Excellent pour l\'analyse de documents longs.',
    tags: ['google', 'gemini', 'vision', 'audio', 'multimodal', 'contexte long'],
    version: 'latest',
  },
  'mistral-large': {
    name: 'Mistral Large',
    provider: 'mistral',
    modelId: 'mistral-large-2405',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 32768,
    costPer1kTokens: {
      input: 0.008,
      output: 0.024,
    },
    maxTokens: 8192,
    description: 'Modèle phare de Mistral AI. Performances exceptionnelles pour le code, le raisonnement et l\'analyse.',
    tags: ['mistral', 'code', 'raisonnement', 'analyse'],
    version: '2405',
  },
  'mistral-medium': {
    name: 'Mistral Medium',
    provider: 'mistral',
    modelId: 'mistral-medium-2312',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 32768,
    costPer1kTokens: {
      input: 0.0027,
      output: 0.0081,
    },
    maxTokens: 8192,
    description: 'Équilibre optimal entre performances et coût. Idéal pour applications d\'entreprise et assistants.',
    tags: ['mistral', 'équilibré', 'entreprise'],
    version: '2312',
  },
  'mistral-small': {
    name: 'Mistral Small',
    provider: 'mistral',
    modelId: 'mistral-small-2402',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 32768,
    costPer1kTokens: {
      input: 0.0006,
      output: 0.0018,
    },
    maxTokens: 8192,
    description: 'Modèle léger et économique pour applications à fort volume. Excellent pour chatbots et assistants simples.',
    tags: ['mistral', 'économique', 'rapide', 'volume'],
    version: '2402',
  },
  'cohere-command': {
    name: 'Cohere Command',
    provider: 'cohere',
    modelId: 'command',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 128000,
    costPer1kTokens: {
      input: 0.0015,
      output: 0.0015,
    },
    maxTokens: 4096,
    description: 'Modèle optimisé pour suivre des instructions précises avec un excellent contrôle.',
    tags: ['cohere', 'instructions'],
    version: '1.0',
  },
  'llama-3-70b': {
    name: 'Llama 3 70B',
    provider: 'local',
    modelId: 'llama-3-70b',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 8192,
    costPer1kTokens: {
      input: 0,
      output: 0,
    },
    maxTokens: 4096,
    description: 'Modèle open-source de Meta pour déploiement local, très performant.',
    tags: ['meta', 'llama', 'open-source', 'local'],
    version: '1.0',
  },
  'deepseek-coder': {
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    modelId: 'deepseek-coder-33b-instruct',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 32768,
    costPer1kTokens: {
      input: 0.0002,
      output: 0.0008,
    },
    maxTokens: 8192,
    description: 'Modèle spécialisé pour la génération et compréhension de code. Excellent pour le développement logiciel.',
    tags: ['deepseek', 'code', 'programmation'],
    version: '33b-instruct',
  },
  'deepseek-llm': {
    name: 'DeepSeek LLM',
    provider: 'deepseek',
    modelId: 'deepseek-llm-67b-chat',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 32768,
    costPer1kTokens: {
      input: 0.0003,
      output: 0.0009,
    },
    maxTokens: 8192,
    description: 'Modèle généraliste de DeepSeek avec d\'excellentes capacités de raisonnement et de compréhension.',
    tags: ['deepseek', 'chat', 'raisonnement'],
    version: '67b-chat',
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    modelId: 'gemini-1.5-flash-latest',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: true,
      audio: true,
    },
    contextWindow: 1000000,
    costPer1kTokens: {
      input: 0.00035,
      output: 0.00105,
    },
    maxTokens: 8192,
    description: 'Version rapide et économique de Gemini 1.5 avec une fenêtre contextuelle d\'1M tokens.',
    tags: ['google', 'gemini', 'vision', 'audio', 'multimodal', 'contexte long'],
    version: 'latest',
  },
  'gemini-1.0-pro': {
    name: 'Gemini 1.0 Pro',
    provider: 'google',
    modelId: 'gemini-1.0-pro-latest',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: true,
      audio: false,
    },
    contextWindow: 32768,
    costPer1kTokens: {
      input: 0.000125,
      output: 0.000375,
    },
    maxTokens: 8192,
    description: 'Modèle multimodal équilibré de Google avec un excellent rapport qualité-prix.',
    tags: ['google', 'gemini', 'vision', 'multimodal', 'économique'],
    version: 'latest',
  },
  'ollama-llama3': {
    name: 'Ollama Llama 3',
    provider: 'ollama',
    modelId: 'llama3',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 8192,
    costPer1kTokens: {
      input: 0,
      output: 0,
    },
    maxTokens: 4096,
    description: 'Modèle Llama 3 optimisé pour exécution locale via Ollama. Gratuit et performant.',
    tags: ['ollama', 'llama', 'local', 'gratuit'],
    version: '8b',
  },
  'ollama-mistral': {
    name: 'Ollama Mistral',
    provider: 'ollama',
    modelId: 'mistral',
    capabilities: {
      chat: true,
      completion: true,
      embeddings: false,
      vision: false,
      audio: false,
    },
    contextWindow: 8192,
    costPer1kTokens: {
      input: 0,
      output: 0,
    },
    maxTokens: 4096,
    description: 'Modèle Mistral optimisé pour exécution locale via Ollama. Idéal pour les applications locales.',
    tags: ['ollama', 'mistral', 'local', 'gratuit'],
    version: '7b',
  },
};

export const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'openai': return '🟢';
    case 'anthropic': return '🟣';
    case 'google': return '🔵';
    case 'mistral': return '🟠';
    case 'cohere': return '🟟';
    case 'azure': return '📗';
    case 'local': return '🞴';
    case 'deepseek': return '🐌';
    case 'ollama': return '🐘';
    default: return '⚪';
  }
};

export const getProviderLabel = (provider: string) => {
  switch (provider) {
    case 'openai': return 'OpenAI';
    case 'anthropic': return 'Anthropic';
    case 'google': return 'Google AI';
    case 'mistral': return 'Mistral AI';
    case 'cohere': return 'Cohere';
    case 'azure': return 'Azure OpenAI';
    case 'local': return 'Local';
    case 'deepseek': return 'DeepSeek AI';
    case 'ollama': return 'Ollama';
    default: return 'Autre';
  }
};

export const getCapabilityLabel = (capability: string) => {
  switch (capability) {
    case 'chat': return 'Chat';
    case 'completion': return 'Complétion';
    case 'embeddings': return 'Embeddings';
    case 'vision': return 'Vision';
    case 'audio': return 'Audio';
    default: return capability;
  }
};

export const formatCost = (cost: number) => {
  if (cost === 0) return 'Gratuit';
  if (cost < 0.001) return `${(cost * 1000000).toFixed(2)} µ$`;
  if (cost < 0.01) return `${(cost * 1000).toFixed(2)} m$`;
  return `${cost.toFixed(4)} $`;
};

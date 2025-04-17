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

export interface AIModelsFormProps {
  onChange: (models: AIModel[]) => void;
}

export type ModelCapability = 'chat' | 'completion' | 'embeddings' | 'vision' | 'audio';

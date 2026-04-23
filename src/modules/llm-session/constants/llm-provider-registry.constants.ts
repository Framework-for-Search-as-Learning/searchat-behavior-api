/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

export type LlmProviderRegistryEntry = {
  value: string;
  label: string;
  defaultModel: string;
  suggestedModels: string[];
  public: boolean;
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
};

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const LLM_PROVIDER_REGISTRY: Record<string, LlmProviderRegistryEntry> = {
  openrouter: {
    value: 'openrouter',
    label: 'OpenRouter',
    defaultModel: 'openai/gpt-4o-mini',
    suggestedModels: [
      'openai/gpt-4o-mini',
      'openai/gpt-4o',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-2.5-flash',
    ],
    public: false,
    baseURL: OPENROUTER_BASE_URL,
  },
  openai: {
    value: 'openai',
    label: 'OpenAI',
    defaultModel: 'openai/gpt-4o-mini',
    suggestedModels: [
      'openai/gpt-4o-mini',
      'openai/gpt-4o',
      'openai/gpt-4.1-mini',
      'openai/gpt-4.1',
      'openai/o4-mini',
    ],
    public: true,
    baseURL: OPENROUTER_BASE_URL,
  },
  anthropic: {
    value: 'anthropic',
    label: 'Anthropic',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    suggestedModels: [
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3.7-sonnet',
      'anthropic/claude-3.5-haiku',
    ],
    public: true,
    baseURL: OPENROUTER_BASE_URL,
  },
  google: {
    value: 'google',
    label: 'Google',
    defaultModel: 'google/gemini-2.5-flash',
    suggestedModels: [
      'google/gemini-2.5-flash',
      'google/gemini-2.5-pro',
      'google/gemini-2.0-flash-001',
      'google/gemini-2.0-flash-lite-001',
    ],
    public: true,
    baseURL: OPENROUTER_BASE_URL,
  },
  meta: {
    value: 'meta',
    label: 'Meta',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    suggestedModels: [
      'meta-llama/llama-3.3-70b-instruct',
      'meta-llama/llama-3.1-405b-instruct',
      'meta-llama/llama-3.1-70b-instruct',
      'meta-llama/llama-3.1-8b-instruct',
    ],
    public: true,
    baseURL: OPENROUTER_BASE_URL,
  },
  mistral: {
    value: 'mistral',
    label: 'Mistral',
    defaultModel: 'mistralai/mistral-large',
    suggestedModels: [
      'mistralai/mistral-large',
      'mistralai/mistral-small',
      'mistralai/codestral',
    ],
    public: true,
    baseURL: OPENROUTER_BASE_URL,
  },
  deepseek: {
    value: 'deepseek',
    label: 'DeepSeek',
    defaultModel: 'deepseek/deepseek-chat-v3-0324',
    suggestedModels: [
      'deepseek/deepseek-chat-v3-0324',
      'deepseek/deepseek-r1',
    ],
    public: true,
    baseURL: OPENROUTER_BASE_URL,
  },
};

const MODEL_PREFIX_PROVIDER_MAP: Record<string, string> = {
  openai: 'openai',
  anthropic: 'anthropic',
  google: 'google',
  meta: 'meta',
  'meta-llama': 'meta',
  mistralai: 'mistral',
  deepseek: 'deepseek',
};

export const inferProviderFromModel = (model?: string): string | undefined => {
  if (!model) {
    return undefined;
  }

  const [prefix] = model.split('/');
  return MODEL_PREFIX_PROVIDER_MAP[prefix];
};

export const resolveLlmProvider = (
  provider?: string,
  model?: string,
): LlmProviderRegistryEntry | undefined => {
  if (provider && LLM_PROVIDER_REGISTRY[provider]) {
    return LLM_PROVIDER_REGISTRY[provider];
  }

  const inferredProvider = inferProviderFromModel(model);
  if (inferredProvider) {
    return LLM_PROVIDER_REGISTRY[inferredProvider];
  }

  return undefined;
};

export const getPublicLlmProviderEntries = (): LlmProviderRegistryEntry[] =>
  Object.values(LLM_PROVIDER_REGISTRY).filter((entry) => entry.public);

export const getDisplayProviderValue = (
  provider?: string,
  model?: string,
): string | undefined => {
  if (provider && provider !== 'openrouter' && LLM_PROVIDER_REGISTRY[provider]?.public) {
    return provider;
  }

  return inferProviderFromModel(model);
};

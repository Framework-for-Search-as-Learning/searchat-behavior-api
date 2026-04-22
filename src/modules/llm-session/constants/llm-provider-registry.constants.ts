/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

export type LlmProviderRegistryEntry = {
  value: string;
  label: string;
  defaultModel: string;
  suggestedModels: string[];
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
};

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
    baseURL: 'https://openrouter.ai/api/v1',
  },
  openai: {
    value: 'openai',
    label: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    suggestedModels: ['gpt-4o-mini', 'gpt-4o'],
  },
};

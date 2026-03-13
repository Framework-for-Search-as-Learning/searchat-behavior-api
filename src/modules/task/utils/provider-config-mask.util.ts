/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { PROVIDER_CONFIG_SECRET_KEYS } from '../constants/provider-config.constants';
import type { TaskProviderConfig } from '../entities/task.entity';
import type { ProviderConfigMasked } from '../types/provider-config.types';

const maskValue = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length <= 6) {
    return '****';
  }
  const prefix = trimmed.slice(0, 3);
  const suffix = trimmed.slice(-4);
  return `${prefix}****${suffix}`;
};

export const isMaskedValue = (value: string): boolean => value.includes('*');

export const buildProviderConfigMask = (
  providerConfig?: TaskProviderConfig,
): { masked: ProviderConfigMasked; sanitized?: TaskProviderConfig } => {
  if (!providerConfig) {
    return {
      masked: {
        hasSecrets: false,
        masked: {},
      },
      sanitized: undefined,
    };
  }

  const sanitized = { ...providerConfig } as TaskProviderConfig;
  const masked: Record<string, string> = {};
  for (const key of PROVIDER_CONFIG_SECRET_KEYS) {
    const rawValue = sanitized[key];
    if (typeof rawValue === 'string' && rawValue) {
      masked[key] = maskValue(rawValue);
      delete sanitized[key];
    }
  }

  return {
    masked: {
      hasSecrets: Object.keys(masked).length > 0,
      masked,
    },
    sanitized,
  };
};

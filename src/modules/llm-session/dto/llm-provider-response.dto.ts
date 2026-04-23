/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {ApiProperty} from '@nestjs/swagger';

export class LlmProviderResponseDto {
  @ApiProperty({description: 'Provider identifier', example: 'openai'})
  value: string;

  @ApiProperty({description: 'Human-readable provider name', example: 'OpenAI'})
  label: string;

  @ApiProperty({
    description: 'Default model used by the backend registry',
    example: 'openai/gpt-4o-mini',
  })
  defaultModel: string;

  @ApiProperty({
    description:
      'Backend-controlled model suggestions. These are suggestions, not a closed validation list.',
    example: ['openai/gpt-4o-mini', 'openai/gpt-4o', 'anthropic/claude-3.7-sonnet'],
    isArray: true,
  })
  suggestedModels: string[];
}

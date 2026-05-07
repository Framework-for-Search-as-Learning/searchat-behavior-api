/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {ApiProperty} from '@nestjs/swagger';

export class LlmProviderModelsResponseDto {
  @ApiProperty({description: 'Provider identifier', example: 'openai'})
  provider: string;

  @ApiProperty({
    description: 'Default model used by the backend registry',
    example: 'openai/gpt-4o-mini',
  })
  defaultModel: string;

  @ApiProperty({
    description:
      'Backend-controlled model suggestions. These are suggestions, not a closed validation list.',
    example: ['openai/gpt-4o-mini', 'openai/gpt-4o', 'openai/gpt-4.1'],
    isArray: true,
  })
  suggestedModels: string[];
}

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {ApiProperty} from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Task ID',
    example: '9f0d7a5d-2a11-4b6b-8c1a-3f7a4a0292f9',
  })
  _id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Find evidence of confirmation bias',
  })
  title: string;

  @ApiProperty({
    description: 'Short summary for display',
    example: 'Search and evaluate sources',
  })
  summary: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Search for articles and summarize findings.',
  })
  description: string;

  @ApiProperty({description: 'Search source identifier', example: 'bing'})
  search_source: string;

  @ApiProperty({
    description: 'Experiment ID associated with this task',
    example: '64d2f4a8e5f9b20b1c8a9f10',
  })
  experiment_id: string;

  @ApiProperty({
    description: 'Survey ID associated with this task',
    example: '64d2f4a8e5f9b20b1c8a9f11',
    required: false,
  })
  survey_id?: string;

  @ApiProperty({
    description: 'Rule type used for task selection',
    example: 'score',
    required: false,
  })
  rule_type?: string;

  @ApiProperty({
    description: 'Minimum score to qualify',
    example: 10,
    required: false,
  })
  min_score?: number;

  @ApiProperty({
    description: 'Maximum score to qualify',
    example: 25,
    required: false,
  })
  max_score?: number;

  @ApiProperty({
    description: 'Provider configuration returned by API',
    example: {
      model: 'openai/gpt-4o-mini',
      apiKey: 'sk-o-----v1-1234',
      modelProvider: 'openrouter',
      systemInstruction: 'You are a friendly and helpful assistant.',
    },
    required: false,
  })
  provider_config?: Record<string, unknown>;

  @ApiProperty({
    description: 'Whether secret fields in provider config were masked',
    example: true,
    required: false,
  })
  provider_config_masked?: boolean;

  @ApiProperty({description: 'Whether the record is active', example: true})
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-02-24T13:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-02-24T13:30:00.000Z',
  })
  lastChangeAt: Date;
}

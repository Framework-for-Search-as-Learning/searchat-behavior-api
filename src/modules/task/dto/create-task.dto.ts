/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {ApiProperty} from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Find evidence of confirmation bias',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Short summary for display',
    example: 'Search and evaluate sources',
  })
  @IsNotEmpty()
  @IsString()
  summary: string;

  @ApiProperty({
    description: 'Full task description',
    example: 'Search for articles and summarize findings.',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({description: 'Search source identifier', example: 'bing'})
  @IsOptional()
  @IsString()
  search_source: string;

  @ApiProperty({
    description: 'Experiment ID this task belongs to',
    example: '64d2f4a8e5f9b20b1c8a9f10',
  })
  @IsNotEmpty()
  @IsString()
  experiment_id: string;

  @ApiProperty({
    description: 'Survey ID associated with this task',
    example: '64d2f4a8e5f9b20b1c8a9f11',
    required: false,
  })
  @IsOptional()
  @IsString()
  survey_id?: string;

  @ApiProperty({
    description: 'Rule type used for task selection',
    example: 'score',
    required: false,
  })
  @IsOptional()
  @IsString()
  rule_type?: string;

  @ApiProperty({
    description: 'Question IDs used by rule selection',
    example: ['64d2f4a8e5f9b20b1c8a9f21'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  questionsId?: string[];

  @ApiProperty({
    description: 'Minimum score to qualify',
    example: 10,
    required: false,
  })
  @IsOptional()
  min_score?: number;

  @ApiProperty({
    description: 'Maximum score to qualify',
    example: 25,
    required: false,
  })
  @IsOptional()
  max_score?: number;

  @ApiProperty({
    description: 'Provider specific configuration',
    example: {
      model: 'openai/gpt-4o-mini',
      apiKey: 'sk-or-v1-...',
      modelProvider: 'openrouter',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  provider_config?: Record<string, unknown>;
}

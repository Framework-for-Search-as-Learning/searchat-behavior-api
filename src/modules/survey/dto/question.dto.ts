/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { OptionDTO } from './option.dto';

export enum QuestionType {
  MULTIPLE_CHOICES = 'multiple-choices',
  OPEN = 'open',
  MULTIPLE_SELECTION = 'multiple-selection',
}

export class QuestionDTO {
  @ApiProperty({ description: 'Question statement', example: 'How confident are you in your answer?' })
  @IsString()
  statement: string;

  @ApiProperty({ enum: QuestionType, description: 'Question type' })
  @IsEnum(QuestionType)
  type: QuestionType = QuestionType.MULTIPLE_CHOICES;

  @ApiProperty({ type: [OptionDTO], description: 'Selectable options for the question', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDTO)
  options?: OptionDTO[];

  @ApiProperty({ description: 'Whether the question contributes to score', example: true })
  @IsBoolean()
  @IsOptional()
  hasscore?: boolean;

  @ApiProperty({ description: 'Whether the question is required', example: true })
  @IsBoolean()
  required: boolean;

  @ApiProperty({ description: 'Optional statement for an "other" answer', example: 'Other (please specify)', required: false })
  @IsString()
  @IsOptional()
  otherStatement?: string;

  @ApiProperty({ description: 'Helper text displayed to participants', example: 'Select one option', required: false })
  @IsString()
  @IsOptional()
  helperText?: string;
}

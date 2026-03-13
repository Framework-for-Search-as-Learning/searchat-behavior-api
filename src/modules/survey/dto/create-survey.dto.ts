/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {SurveyType} from '../entity/survey.entity';
import {QuestionDTO} from './question.dto';

export class CreateSurveyDto {
  @ApiProperty({
    description: 'Survey UUID',
    example: '6b1e8c1a-3f7a-4a02-92f9-4b0d7a5d2a11',
  })
  @IsOptional()
  @IsString()
  uuid: string;

  @ApiProperty({
    description: 'Internal survey name',
    example: 'bias-awareness-pre',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Survey title for participants',
    example: 'Pre-task questionnaire',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Survey description',
    example: 'Questions about prior knowledge.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({enum: SurveyType, description: 'Survey type'})
  @IsEnum(SurveyType)
  type: SurveyType;

  @ApiProperty({type: [QuestionDTO], description: 'Survey questions'})
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => QuestionDTO)
  questions: QuestionDTO[];

  @ApiProperty({
    description: 'Experiment ID this survey belongs to',
    example: '64d2f4a8e5f9b20b1c8a9f10',
  })
  @IsNotEmpty()
  @IsString()
  experimentId: string;

  @ApiProperty({
    description: 'Whether the survey requires unique answers per participant',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  uniqueAnswer: boolean;
}

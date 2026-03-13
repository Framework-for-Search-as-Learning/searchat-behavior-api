/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';

import { SurveyType } from '../entity/survey.entity';
import { QuestionDTO } from './question.dto';

export class SurveyResponseDto {
  @ApiProperty({ description: 'Survey ID', example: '6b1e8c1a-3f7a-4a02-92f9-4b0d7a5d2a11' })
  _id: string;

  @ApiProperty({ description: 'Internal survey name', example: 'bias-awareness-pre' })
  name: string;

  @ApiProperty({ description: 'Survey title', example: 'Pre-task questionnaire' })
  title: string;

  @ApiProperty({ description: 'Survey description', example: 'Questions about prior knowledge.' })
  description: string;

  @ApiProperty({ enum: SurveyType, description: 'Survey type', example: SurveyType.PRE })
  type: SurveyType;

  @ApiProperty({ type: [QuestionDTO], description: 'Survey questions' })
  questions: QuestionDTO[];

  @ApiProperty({ description: 'Experiment ID associated with this survey', example: '64d2f4a8e5f9b20b1c8a9f10' })
  experiment_id: string;

  @ApiProperty({ description: 'If true, only one answer per user is allowed', example: false })
  uniqueAnswer: boolean;

  @ApiProperty({ description: 'If true, the survey is mandatory', example: true })
  required: boolean;

  @ApiProperty({ description: 'Whether the record is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp', example: '2026-02-24T13:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2026-02-24T13:30:00.000Z' })
  lastChangeAt: Date;
}

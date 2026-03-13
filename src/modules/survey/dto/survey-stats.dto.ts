/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';

import { SurveyType } from '../entity/survey.entity';

export class SurveyQuestionStatOptionDto {
  @ApiProperty({ description: 'Option statement' })
  statement: string;

  @ApiProperty({ description: 'Number of selections' })
  count: number;

  @ApiProperty({ description: 'Percentage of selections' })
  percentage: number;
}

export class SurveyQuestionStatDto {
  @ApiProperty({ description: 'Question statement' })
  statement: string;

  @ApiProperty({ description: 'Question type' })
  type: string;

  @ApiProperty({ description: 'Total number of answers' })
  totalAnswers: number;

  @ApiProperty({ type: [SurveyQuestionStatOptionDto], description: 'Option statistics' })
  options: SurveyQuestionStatOptionDto[];
}

export class SurveyStatsDto {
  @ApiProperty({ description: 'Survey ID' })
  surveyId: string;

  @ApiProperty({ description: 'Survey name' })
  name: string;

  @ApiProperty({ description: 'Survey title' })
  title: string;

  @ApiProperty({ description: 'Survey description' })
  description: string;

  @ApiProperty({ enum: SurveyType, description: 'Survey type' })
  type: SurveyType;

  @ApiProperty({ type: [SurveyQuestionStatDto], description: 'Question statistics' })
  questions: SurveyQuestionStatDto[];
}

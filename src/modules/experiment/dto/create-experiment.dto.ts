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
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {QuestionDTO} from 'src/modules/survey/dto/question.dto';
import {SurveyType} from 'src/modules/survey/entity/survey.entity';

export class CreateExperimentTaskPropsDto {
  @ApiProperty({description: 'Temporary task reference', required: false})
  @IsOptional()
  @IsString()
  uuid?: string;

  @ApiProperty({description: 'Task title', example: 'Task 1'})
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({description: 'Task summary', example: 'Task summary'})
  @IsNotEmpty()
  @IsString()
  summary: string;

  @ApiProperty({description: 'Task description', required: false})
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({description: 'Task search source', example: 'search-engine'})
  @IsNotEmpty()
  @IsString()
  search_source: string;

  @ApiProperty({description: 'Legacy single linked survey id/ref', required: false})
  @IsOptional()
  @IsString()
  SelectedSurvey?: string;

  @ApiProperty({description: 'Rules experiment type', required: false})
  @IsOptional()
  @IsString()
  RulesExperiment?: string;

  @ApiProperty({description: 'Minimum score threshold', required: false})
  @IsOptional()
  ScoreThreshold?: number;

  @ApiProperty({description: 'Maximum score threshold', required: false})
  @IsOptional()
  ScoreThresholdmx?: number;

  @ApiProperty({description: 'Question ids linked to this task', required: false})
  @IsOptional()
  @IsArray()
  @IsString({each: true})
  selectedQuestionIds?: string[];

  @ApiProperty({description: 'Provider config for llm/search', required: false})
  @IsOptional()
  @IsObject()
  provider_config?: Record<string, unknown>;

  @ApiProperty({
    description: 'Optional list of survey references (temporary uuid or real id) to link in task_survey',
    required: false,
    example: ['survey-temp-1', 'survey-temp-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({each: true})
  linkedSurveyRefs?: string[];
}

export class CreateExperimentIcfDto {
  @ApiProperty({description: 'ICF title', example: 'Consent'})
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({description: 'ICF description', example: 'You agree to participate.'})
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class CreateExperimentSurveyPropsDto {
  @ApiProperty({description: 'Temporary survey reference', required: false})
  @IsOptional()
  @IsString()
  uuid?: string;

  @ApiProperty({description: 'Internal survey name', example: 'survey-name'})
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({description: 'Survey title', example: 'Survey title'})
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({description: 'Survey description', example: 'Survey description'})
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

  @ApiProperty({description: 'Whether survey answers must be unique', example: false})
  @IsNotEmpty()
  @IsBoolean()
  uniqueAnswer: boolean;

  @ApiProperty({
    description: 'Deprecated on POST /experiment and ignored when provided',
    required: false,
  })
  @IsOptional()
  @IsString()
  experimentId?: string;
}

export class CreateExperimentDto {
  @ApiProperty({ description: 'Experiment name', example: 'Bias Study A' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Owner user ID', example: '64d2f4a8e5f9b20b1c8a9f10' })
  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'Experiment summary', example: 'Comparing two search strategies', required: false })
  @IsOptional()
  @IsString()
  summary: string;

  @ApiProperty({ description: 'Experiment type identifier', example: 'between' })
  @IsNotEmpty()
  @IsString()
  typeExperiment: string;

  @ApiProperty({ description: 'Between-experiment design type', example: 'A/B' })
  @IsNotEmpty()
  @IsString()
  betweenExperimentType: string;

  @ApiProperty({
    description: 'Task definitions used in the experiment',
    type: [CreateExperimentTaskPropsDto],
    example: [
      {
        uuid: 'task-temp-1',
        title: 'Task 1',
        summary: 'Task summary',
        description: 'Task description',
        search_source: 'search-engine',
        linkedSurveyRefs: ['survey-temp-1'],
      },
    ],
  })
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => CreateExperimentTaskPropsDto)
  tasksProps: CreateExperimentTaskPropsDto[];
  @ApiProperty({
    description: 'Survey definitions used in the experiment',
    type: [CreateExperimentSurveyPropsDto],
    example: [
      {
        uuid: 'survey-temp-1',
        name: 'survey-name',
        title: 'Survey title',
        description: 'Survey description',
        type: 'pre',
        questions: [],
        uniqueAnswer: false,
      },
    ],
  })
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => CreateExperimentSurveyPropsDto)
  surveysProps: CreateExperimentSurveyPropsDto[];

  @ApiProperty({
    description: 'ICF (consent) information',
    example: { title: 'Consent', description: 'You agree to participate.' },
    type: CreateExperimentIcfDto,
  })
  @ValidateNested()
  @Type(() => CreateExperimentIcfDto)
  icf: CreateExperimentIcfDto;
}

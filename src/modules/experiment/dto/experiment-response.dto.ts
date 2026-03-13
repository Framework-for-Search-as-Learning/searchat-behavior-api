/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';

import { ExperimentStatus } from '../entity/experiment.entity';

export class ExperimentResponseDto {
  @ApiProperty({ description: 'Experiment ID', example: '64d2f4a8e5f9b20b1c8a9f20' })
  _id: string;

  @ApiProperty({ description: 'Experiment name', example: 'Bias Awareness Study' })
  name: string;

  @ApiProperty({ description: 'Owner user ID', example: '64d2f4a8e5f9b20b1c8a9f10' })
  owner_id: string;

  @ApiProperty({ description: 'Experiment summary', example: 'Study on search behavior and confirmation bias.' })
  summary: string;

  @ApiProperty({ description: 'Experiment type', example: 'between-subject' })
  typeExperiment: string;

  @ApiProperty({ description: 'Between-subject assignment mode', example: 'rules_based' })
  betweenExperimentType: string;

  @ApiProperty({ enum: ExperimentStatus, description: 'Experiment status', example: ExperimentStatus.NOT_STARTED })
  status: ExperimentStatus;

  @ApiProperty({ description: 'Whether the record is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp', example: '2026-02-24T13:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2026-02-24T13:40:00.000Z' })
  lastChangeAt: Date;
}

export class ImportExperimentErrorsResponseDto {
  @ApiProperty({
    description: 'Validation errors found during YAML import (empty when successful)',
    type: [String],
    example: ['yaml_error_missing_experiment_name'],
  })
  errors: string[];
}

export class ExperimentGeneralInfoResponseDto {
  @ApiProperty({ enum: ExperimentStatus, description: 'Experiment status', example: ExperimentStatus.IN_PROGRESS })
  experimentStatus: ExperimentStatus;

  @ApiProperty({ description: 'Aggregated user experiment info', example: { totalUsers: 42, completedResponses: 30 } })
  userExperimentInfos: {
    totalUsers: number;
    completedResponses: number;
  };
}

export class ExperimentStepInfoResponseDto {
  @ApiProperty({ description: 'Step label', example: 'accept_icf' })
  label: string;

  @ApiProperty({ description: 'Step order in flow', example: 1 })
  order: number;
}

export class ExperimentStepsResponseDto {
  @ApiProperty({ type: ExperimentStepInfoResponseDto, required: false })
  icf?: ExperimentStepInfoResponseDto;

  @ApiProperty({ type: ExperimentStepInfoResponseDto, required: false })
  pre?: ExperimentStepInfoResponseDto;

  @ApiProperty({ type: ExperimentStepInfoResponseDto, required: false })
  post?: ExperimentStepInfoResponseDto;

  @ApiProperty({ type: ExperimentStepInfoResponseDto, required: false })
  task?: ExperimentStepInfoResponseDto;
}

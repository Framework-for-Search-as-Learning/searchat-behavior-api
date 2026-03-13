/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';

import { UserExperimentStatus } from '../entities/user-experiments.entity';

export class UserExperimentResponseDto {
  @ApiProperty({ description: 'UserExperiment ID', example: '4a0292f9-4b0d-7a5d-2a11-8e2c1a3f7a4a' })
  _id: string;

  @ApiProperty({ description: 'User ID', example: '64d2f4a8e5f9b20b1c8a9f10' })
  user_id: string;

  @ApiProperty({ description: 'Experiment ID', example: '64d2f4a8e5f9b20b1c8a9f20' })
  experiment_id: string;

  @ApiProperty({ description: 'Whether user has finished experiment', example: false })
  hasFinished: boolean;

  @ApiProperty({ enum: UserExperimentStatus, description: 'Participation status', example: UserExperimentStatus.IN_PROGRESS })
  status: UserExperimentStatus;

  @ApiProperty({ description: 'Experiment start date', example: '2026-02-24T13:30:00.000Z', required: false })
  startDate?: Date;

  @ApiProperty({ description: 'Experiment completion date', example: '2026-02-24T14:10:00.000Z', required: false })
  completionDate?: Date;

  @ApiProperty({ description: 'Map of completed steps', example: { icf: true, pre: true, task: false, post: false }, required: false })
  stepsCompleted?: Record<string, boolean>;

  @ApiProperty({ description: 'Whether the record is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp', example: '2026-02-24T13:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2026-02-24T13:40:00.000Z' })
  lastChangeAt: Date;
}

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */


import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { StepsType } from 'src/modules/experiment/entity/experiment.entity';

import { UserExperimentStatus } from '../entities/user-experiments.entity';

export class CreateUserExperimentDto {
  @ApiProperty({ description: 'User ID', example: '64d2f4a8e5f9b20b1c8a9f10' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Experiment ID', example: '64d2f4a8e5f9b20b1c8a9f20' })
  @IsNotEmpty()
  @IsString()
  experimentId: string;

  @ApiProperty({ description: 'Steps completed map', required: false, example: { consent: true } })
  @IsOptional()
  @IsObject()
  stepsCompleted?: Record<StepsType, boolean>;

  @ApiProperty({ enum: UserExperimentStatus, description: 'Experiment participation status', required: false })
  @IsOptional()
  @IsEnum(UserExperimentStatus)
  status?: UserExperimentStatus;

  @ApiProperty({ description: 'Start date', example: '2026-02-11T10:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ description: 'Completion date', example: '2026-02-11T12:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  completionDate?: Date;
}

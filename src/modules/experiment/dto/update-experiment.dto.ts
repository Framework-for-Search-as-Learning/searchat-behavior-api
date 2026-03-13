/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {ApiProperty, PartialType} from '@nestjs/swagger';
import {IsEnum, IsOptional} from 'class-validator';

import {ExperimentStatus} from '../entity/experiment.entity';
import {CreateExperimentDto} from './create-experiment.dto';

export class UpdateExperimentDto extends PartialType(CreateExperimentDto) {
  @ApiProperty({enum: ExperimentStatus, required: false})
  @IsOptional()
  @IsEnum(ExperimentStatus)
  status: ExperimentStatus;
}

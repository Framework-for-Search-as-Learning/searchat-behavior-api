/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { AnswerDTO } from './answers.dto';

export class CreateSurveyAnswerDto {
  @ApiProperty({ description: 'User ID', example: '64d2f4a8e5f9b20b1c8a9f10' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Survey ID', example: '64d2f4a8e5f9b20b1c8a9f11' })
  @IsNotEmpty()
  @IsString()
  surveyId: string;

  @ApiProperty({ type: [AnswerDTO], description: 'Answers for the survey' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDTO)
  answers: AnswerDTO[];

  @ApiProperty({ description: 'Computed survey score', example: 12, required: false })
  @IsOptional()
  @IsNumber()
  score?: number = 0;
}

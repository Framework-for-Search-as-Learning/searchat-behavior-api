/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';

import { AnswerDTO } from './answers.dto';

export class SurveyAnswerResponseDto {
  @ApiProperty({ description: 'Survey answer ID', example: '7a4a0292-f94b-0d7a-5d2a-118e2c1a3f70' })
  _id: string;

  @ApiProperty({ description: 'User ID', example: '64d2f4a8e5f9b20b1c8a9f10' })
  user_id: string;

  @ApiProperty({ description: 'Survey ID', example: '64d2f4a8e5f9b20b1c8a9f11' })
  survey_id: string;

  @ApiProperty({ description: 'Submitted answers', type: [AnswerDTO] })
  answers: AnswerDTO[];

  @ApiProperty({ description: 'Total score for submission', example: 17.5 })
  score: number;

  @ApiProperty({ description: 'Whether the record is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp', example: '2026-02-24T13:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2026-02-24T13:40:00.000Z' })
  lastChangeAt: Date;
}

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';

export class TimeEditUserTaskDto {
  @ApiProperty({ description: 'Whether the task is paused', required: false, example: false })
  isPaused?: boolean;

  @ApiProperty({ description: 'Whether the task is finished', required: false, example: false })
  hasFinishedTask?: boolean;

  @ApiProperty({ description: 'Task start time', required: false, example: '2026-02-11T10:00:00.000Z' })
  startTime?: Date;

  @ApiProperty({ description: 'Task end time', required: false, example: '2026-02-11T10:10:00.000Z' })
  endTime?: Date;

  @ApiProperty({ description: 'Pause timestamps', required: false, type: [Date] })
  pauseTime?: Date[];

  @ApiProperty({ description: 'Resume timestamps', required: false, type: [Date] })
  resumeTime?: Date[];

  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, unknown> | null;
}

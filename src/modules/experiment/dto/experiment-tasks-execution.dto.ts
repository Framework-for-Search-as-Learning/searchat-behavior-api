/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';
import { TaskExecutionDetailsDto } from 'src/modules/user-task/dto/task-execution-details.dto';

export class ExperimentTaskExecutionDto {
  @ApiProperty()
  taskId: string;

  @ApiProperty()
  taskTitle: string;

  @ApiProperty()
  taskType: string;

  @ApiProperty({ nullable: true, required: false })
  systemInstruction?: string | null;

  @ApiProperty({ type: [TaskExecutionDetailsDto] })
  executions: TaskExecutionDetailsDto[];
}

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { taskQuestionIdsResponseSchema } from './dto/task-question-ids.response';
import { TaskQuestionMapService } from './task-question-map.service';

@ApiTags('Task Question Map')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('task-question-map')
export class TaskQuestionMapController {
  constructor(
    private readonly taskQuestionMapService: TaskQuestionMapService,
  ) { }

  @Get('/task/:taskId')
  @ApiOperation({ summary: 'Get questions by taskId' })
  @ApiParam({ name: 'taskId', type: String, description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'List of question IDs for the task.',
    schema: taskQuestionIdsResponseSchema,
  })
  async findQuestions(@Param('taskId') taskId: string): Promise<string[]> {
    return await this.taskQuestionMapService.findQuestionsByTask(taskId);
  }
}

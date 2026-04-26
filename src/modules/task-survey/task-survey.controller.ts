/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {Controller, Delete, Get, HttpCode, Param, Post, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';

import {Survey} from '../survey/entity/survey.entity';
import {TaskSurvey} from './entity/taskSurvey.entity';
import {TaskSurveyService} from './task-survey.service';

@ApiTags('Task Survey')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('task-survey')
export class TaskSurveyController {
  constructor(private readonly taskSurveyService: TaskSurveyService) {}

  @Post('task/:taskId/survey/:surveyId')
  @ApiOperation({summary: 'Link a survey to a task'})
  @ApiParam({name: 'taskId', type: String})
  @ApiParam({name: 'surveyId', type: String})
  async link(
    @Param('taskId') taskId: string,
    @Param('surveyId') surveyId: string,
  ): Promise<TaskSurvey> {
    return await this.taskSurveyService.link(taskId, surveyId);
  }

  @Delete('task/:taskId/survey/:surveyId')
  @HttpCode(204)
  @ApiOperation({summary: 'Unlink a survey from a task'})
  @ApiParam({name: 'taskId', type: String})
  @ApiParam({name: 'surveyId', type: String})
  async unlink(
    @Param('taskId') taskId: string,
    @Param('surveyId') surveyId: string,
  ): Promise<void> {
    return await this.taskSurveyService.unlink(taskId, surveyId);
  }

  @Get('task/:taskId')
  @ApiOperation({summary: 'List surveys linked to a task'})
  @ApiParam({name: 'taskId', type: String})
  async findSurveysByTask(@Param('taskId') taskId: string): Promise<Survey[]> {
    return await this.taskSurveyService.findSurveysByTask(taskId);
  }
}

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/api-responses.dto';

import { TaskResponseDto } from '../task/dto/task-response.dto';
import { Task } from '../task/entities/task.entity';
import { GetUserDto } from '../user/dto/user.dto';
import { User } from '../user/entity/user.entity';
import { CreateUserTaskDto } from './dto/create-userTask.dto';
import { TaskExecutionDetailsDto } from './dto/task-execution-details.dto';
import { TimeEditUserTaskDto } from './dto/timeEditUserTaskDTO';
import { UpdateUserTaskDto } from './dto/update-userTask.dto';
import { UserTaskResponseDto } from './dto/user-task-response.dto';
import { UserTask } from './entities/user-tasks.entity';
import { UserTaskService } from './user-task.service';

@ApiTags('User Task')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('user-task')
export class UserTaskController {
  constructor(private readonly userTaskService: UserTaskService) { }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user task by id' })
  @ApiParam({ name: 'id', type: String, description: 'UserTask ID' })
  @ApiResponse({ status: 200, description: 'User task details.', type: UserTaskResponseDto })
  @ApiResponse({ status: 404, description: 'User task not found.', type: ErrorResponseDto })
  async findOne(@Param('id') id: string): Promise<UserTask> {
    return await this.userTaskService.findOne(id);
  }


  @Get('execution-details/user/:userId/task/:taskId')
  @ApiOperation({ summary: 'Get detailed execution info for a specific user and task' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiParam({ name: 'taskId', type: String, description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Execution details for matching user tasks.', type: TaskExecutionDetailsDto, isArray: true })
  async getUserTaskExecutionDetails(
    @Param('userId') userId: string,
    @Param('taskId') taskId: string
  ): Promise<TaskExecutionDetailsDto[]> {
    const userTasks = await this.userTaskService.findByUserAndTask(userId, taskId);
    return await Promise.all(
      userTasks.map(ut => this.userTaskService.getExecutionDetailsFromEntity(ut))
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all user tasks or filter by userId and taskId' })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'taskId',
    required: false,
    type: String,
    description: 'Task ID',
  })
  @ApiResponse({ status: 200, description: 'User tasks list or filtered results.', type: UserTaskResponseDto, isArray: true })
  async findAll(
    @Query('userId') userId: string,
    @Query('taskId') taskId: string,
  ): Promise<UserTask[] | UserTask> {
    if (userId) {
      if (taskId) {
        return await this.userTaskService.findByUserIdAndTaskId(userId, taskId);
      }
      return await this.userTaskService.findByUserId(userId);
    }
    return await this.userTaskService.findAll();
  }

  @Get('user/:userId/experiment/:experimentId')
  @ApiOperation({
    summary: 'Get all userTasks associated with a specific user and experiment',
  })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiParam({ name: 'experimentId', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'User tasks for the user and experiment.', type: UserTaskResponseDto, isArray: true })
  async findByExperimentId(
    @Param('userId') userId: string,
    @Param('experimentId') experimentId: string,
  ): Promise<UserTask[]> {
    return await this.userTaskService.findByUserIdAndExperimentId(
      userId,
      experimentId,
    );
  }
  @Get('task/:taskId/users')
  @ApiOperation({ summary: 'Get all users associated with a specific task' })
  @ApiParam({ name: 'taskId', type: String, description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Users linked to the task.', type: GetUserDto, isArray: true })
  async findUsersByTaskId(@Param('taskId') taskId: string): Promise<User[]> {
    return await this.userTaskService.findUsersByTaskId(taskId);
  }

  @Get('user/:userId/tasks')
  @ApiOperation({ summary: 'Get all tasks associated with a specific user' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Tasks linked to the user.', type: TaskResponseDto, isArray: true })
  async findTasksByUserId(@Param('userId') userId: string): Promise<Task[]> {
    return await this.userTaskService.findTasksByUserId(userId);
  }

  @Get('/user/:userId/experiment/:experimentId/tasks')
  @ApiOperation({
    summary: 'get all tasks associated with a specific user and experiment',
  })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiParam({ name: 'experimentId', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Tasks linked to the user and experiment.', type: TaskResponseDto, isArray: true })
  async findTasksByUserIdAndExperimentId(
    @Param('userId') userId: string,
    @Param('experimentId') experimentId: string,
  ): Promise<Task[]> {
    return await this.userTaskService.findTasksByUserIdAndExperimentId(
      userId,
      experimentId,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user task' })
  @ApiBody({ type: CreateUserTaskDto })
  @ApiResponse({ status: 201, description: 'User task created successfully.', type: UserTaskResponseDto })
  async create(
    @Body() createUserTaskDto: CreateUserTaskDto,
  ): Promise<UserTask> {
    return await this.userTaskService.create(createUserTaskDto);
  }


  @Delete()
  @ApiOperation({ summary: 'Remove a user task by userId and taskId' })
  @ApiQuery({
    name: 'userId',
    required: true,
    type: String,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'taskId',
    required: true,
    type: String,
    description: 'Task ID',
  })
  @ApiResponse({ status: 200, description: 'User task removed.', type: UserTaskResponseDto })
  async removeByUserIdAndTaskId(
    @Query('userId') userId: string,
    @Query('taskId') taskId: string,
  ): Promise<UserTask> {
    if (userId && taskId) {
      return await this.userTaskService.removeByUserIdAndTaskId(userId, taskId);
    }
    return null;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a user task by id' })
  @ApiParam({ name: 'id', type: String, description: 'UserTask ID' })
  @ApiResponse({ status: 200, description: 'User task removed.', type: UserTaskResponseDto })
  async remove(@Param('id') id: string): Promise<UserTask> {
    return await this.userTaskService.remove(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user task' })
  @ApiParam({ name: 'id', type: String, description: 'UserTask ID' })
  @ApiBody({ type: UpdateUserTaskDto })
  @ApiResponse({ status: 200, description: 'User task updated successfully.', type: UserTaskResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateUserTaskDto: UpdateUserTaskDto,
  ): Promise<UserTask> {
    return await this.update(id, updateUserTaskDto);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Start a user task' })
  @ApiParam({ name: 'id', type: String, description: 'UserTask ID' })
  @ApiResponse({ status: 200, description: 'User task started.', type: UserTaskResponseDto })
  async start(@Param('id') id: string): Promise<UserTask> {
    const userTask = await this.userTaskService.findOne(id);
    const isPaused = userTask.isPaused;
    const startTime = userTask.startTime;
    return await this.userTaskService.start(id, { isPaused, startTime });
  }

  @Patch(':id/pause')
  @ApiOperation({ summary: 'Pause a user task' })
  @ApiParam({ name: 'id', type: String, description: 'UserTask ID' })
  @ApiResponse({ status: 200, description: 'User task paused.', type: UserTaskResponseDto })
  async pause(@Param('id') id: string): Promise<UserTask> {
    const userTask = await this.userTaskService.findOne(id);
    const isPaused = userTask.isPaused;
    const pauseTime = userTask.pauseTime;
    return await this.userTaskService.pause(id, { isPaused, pauseTime });
  }

  @Patch(':id/resume')
  @ApiOperation({ summary: 'Resume a user task' })
  @ApiParam({ name: 'id', type: String, description: 'UserTask ID' })
  @ApiResponse({ status: 200, description: 'User task resumed.', type: UserTaskResponseDto })
  async resume(@Param('id') id: string): Promise<UserTask> {
    const userTask = await this.userTaskService.findOne(id);
    const isPaused = userTask.isPaused;
    const resumeTime = userTask.resumeTime;
    return await this.userTaskService.resume(id, { isPaused, resumeTime });
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Finish a user task' })
  @ApiParam({ name: 'id', type: String, description: 'UserTask ID' })
  @ApiBody({ type: TimeEditUserTaskDto })
  @ApiResponse({ status: 200, description: 'User task finished.', type: UserTaskResponseDto })
  async finish(@Param('id') id: string, @Body() timeEditUserTaskDto: TimeEditUserTaskDto): Promise<UserTask> {
    return await this.userTaskService.finish(id, timeEditUserTaskDto);
  }
}

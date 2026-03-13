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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/api-responses.dto';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';

@ApiTags('Task')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully.', type: TaskResponseDto })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks.', type: TaskResponseDto, isArray: true })
  async findAll(): Promise<Task[]> {
    return await this.taskService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiParam({ name: 'id', type: String, description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task details.', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found.', type: ErrorResponseDto })
  async findOne(@Param('id') id: string): Promise<Task> {
    return await this.taskService.findOne(id);
  }

  @Get('/experiment/:experimentId')
  @ApiOperation({ summary: 'Get tasks by experiment id' })
  @ApiParam({ name: 'experimentId', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Tasks linked to the experiment.', type: TaskResponseDto, isArray: true })
  async findByExperimentId(
    @Param('experimentId') experimentId: string,
  ): Promise<Task[]> {
    return await this.taskService.findByExperimentId(experimentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task by id' })
  @ApiParam({ name: 'id', type: String, description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task updated successfully.', type: TaskResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return await this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task by id' })
  @ApiParam({ name: 'id', type: String, description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully.', type: TaskResponseDto })
  async remove(@Param('id') id: string) {
    return await this.taskService.remove(id);
  }
}

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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

import { CreateUserTaskSessionDto } from './dto/create-userTaskSession.dto';
import { HandlePageDto } from './dto/handlePage.dto';
import { UserTaskSessionResponseDto } from './dto/user-task-session-response.dto';
import { UserTaskSession } from './entities/user-task-session.entity';
import { UserTaskSessionService } from './user-task-session.service';

@ApiTags('User Task Session')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('user-task-session')
export class UserTaskSessionController {
  constructor(
    private readonly userTaskSessionService: UserTaskSessionService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get user task sessions or filter by userId and taskId' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'User ID' })
  @ApiQuery({ name: 'taskId', required: false, type: String, description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'User task sessions list or filtered results.', type: UserTaskSessionResponseDto, isArray: true })
  async findAll(
    @Query('userId') userId: string,
    @Query('taskId') taskId: string,
  ): Promise<UserTaskSession[]> {
    if (userId) {
      if (taskId) {
        return await this.userTaskSessionService.finByUserIdAndTaskId(
          userId,
          taskId,
        );
      }
      return await this.userTaskSessionService.findByUserId(userId);
    }
    return await this.userTaskSessionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user task session by id' })
  @ApiParam({ name: 'id', type: String, description: 'UserTaskSession ID' })
  @ApiResponse({ status: 200, description: 'User task session details.', type: UserTaskSessionResponseDto })
  @ApiResponse({ status: 404, description: 'User task session not found.', type: ErrorResponseDto })
  async findOne(@Param('id') id: string): Promise<UserTaskSession> {
    return await this.userTaskSessionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a user task session' })
  @ApiBody({ type: CreateUserTaskSessionDto })
  @ApiResponse({ status: 201, description: 'User task session created.', type: UserTaskSessionResponseDto })
  async create(
    @Body() createUserTaskSessionDto: CreateUserTaskSessionDto,
  ): Promise<UserTaskSession> {
    return await this.userTaskSessionService.create(createUserTaskSessionDto);
  }



  @Patch(':id/open-page/:rank')
  @ApiOperation({ summary: 'Register opening a result page' })
  @ApiParam({ name: 'id', type: String, description: 'UserTaskSession ID' })
  @ApiParam({ name: 'rank', type: Number, description: 'Result rank' })
  @ApiBody({ type: HandlePageDto })
  @ApiResponse({ status: 200, description: 'Page open event stored.', type: UserTaskSessionResponseDto })
  async openPage(
    @Param('id') id: string,
    @Param('rank') rank: number,
    @Body() openPageDto: HandlePageDto,
  ): Promise<UserTaskSession> {
    return await this.userTaskSessionService.openPage(id, rank, openPageDto);
  }

  @Patch(':id/close-page/:rank')
  @ApiOperation({ summary: 'Register closing a result page' })
  @ApiParam({ name: 'id', type: String, description: 'UserTaskSession ID' })
  @ApiParam({ name: 'rank', type: Number, description: 'Result rank' })
  @ApiBody({ type: HandlePageDto })
  @ApiResponse({ status: 200, description: 'Page close event stored.', type: UserTaskSessionResponseDto })
  async closePage(
    @Param('id') id: string,
    @Param('rank') rank: number,
    @Body() closePageDto: HandlePageDto,
  ): Promise<UserTaskSession> {
    return await this.userTaskSessionService.closePage(id, rank, closePageDto);
  }
}

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
import { CountUsersResponseDto } from 'src/common/dto/api-responses.dto';
import { GetUserDto } from 'src/modules/user/dto/user.dto';

import { User } from '../user/entity/user.entity';
import { CreateUserExperimentDto } from './dto/create-userExperiment.dto';
import { UpdateUserExperimentDto } from './dto/update-userExperiment.dto';
import { UserExperimentResponseDto } from './dto/user-experiment-response.dto';
import { UserExperiment } from './entities/user-experiments.entity';
import { UserExperimentService } from './user-experiment.service';

@ApiTags('User Experiment')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('user-experiment')
export class UserExperimentController {
  constructor(
    private readonly userExperimentService: UserExperimentService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a user experiment' })
  @ApiBody({ type: CreateUserExperimentDto })
  @ApiResponse({ status: 201, description: 'User experiment created successfully.', type: UserExperimentResponseDto })
  async create(
    @Body() createUserExperimentDto: CreateUserExperimentDto,
  ): Promise<UserExperiment> {
    return await this.userExperimentService.create(createUserExperimentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user experiments' })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID to filter',
  })
  @ApiQuery({
    name: 'experimentId',
    required: false,
    type: String,
    description: 'Experiment ID to filter',
  })
  @ApiResponse({ status: 200, description: 'User experiments list or filtered results.', type: UserExperimentResponseDto, isArray: true })
  async findAll(
    @Query('userId') userId: string,
    @Query('experimentId') experimentId: string,
  ): Promise<UserExperiment[] | UserExperiment> {
    if (userId) {
      if (experimentId) {
        return await this.userExperimentService.findByUserAndExperimentId(
          userId,
          experimentId,
        );
      }
      return await this.userExperimentService.findByUserId(userId);
    }
    return await this.userExperimentService.findAll();
  }

  @Get('/experiment/:experimentId')
  @ApiOperation({ summary: 'Get users by experiment id' })
  @ApiParam({ name: 'experimentId', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Users participating in the experiment.', type: GetUserDto, isArray: true })
  async findUsersByExperimentId(
    @Param('experimentId') experimentId: string,
  ): Promise<GetUserDto[]> {
    const users =
      await this.userExperimentService.findUsersByExperimentId(experimentId);
    return users.map((user) => {
      return {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        researcher: user.researcher,
      };
    });
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Get experiments by user id' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Experiments for the user.', type: UserExperimentResponseDto, isArray: true })
  async findExperimentsByUserId(
    @Param('userId') userId: string,
  ): Promise<UserExperiment[]> {
    const experiments =
      await this.userExperimentService.findExperimentsByUserId(userId);
    return experiments;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user experiment' })
  @ApiParam({ name: 'id', type: String, description: 'UserExperiment ID' })
  @ApiBody({ type: UpdateUserExperimentDto })
  @ApiResponse({ status: 200, description: 'User experiment updated successfully.', type: UserExperimentResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateUserExperimentDto: UpdateUserExperimentDto,
  ): Promise<UserExperiment> {
    const result = await this.userExperimentService.update(
      id,
      updateUserExperimentDto,
    );
    return result;
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Mark a user experiment as finished' })
  @ApiParam({ name: 'id', type: String, description: 'UserExperiment ID' })
  @ApiResponse({ status: 200, description: 'User experiment marked as finished.', type: UserExperimentResponseDto })
  async finish(
    @Param('id') id: string,
  ): Promise<UserExperiment> {
    const result = await this.userExperimentService.finish(id);
    return result;
  }

  @Patch('/update-users/:id')
  @ApiOperation({ summary: 'Replace experiment users' })
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newUsersId: { type: 'array', items: { type: 'string' } },
      },
      required: ['newUsersId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Experiment users updated.', type: GetUserDto, isArray: true })
  async updateExperimentUsers(
    @Param('id') id: string,
    @Body() body: { newUsersId: string[] },
  ): Promise<User[]> {
    const { newUsersId } = body;
    return this.userExperimentService.updateExperimentUsers(id, newUsersId);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete user experiment by user and experiment id' })
  @ApiQuery({
    name: 'userId',
    required: true,
    type: String,
    description: 'User ID',
  })
  @ApiQuery({
    name: 'experimentId',
    required: true,
    type: String,
    description: 'Experiment ID',
  })
  @ApiResponse({ status: 200, description: 'User experiment removed.', type: UserExperimentResponseDto })
  async removeByUserAndExperimentId(
    @Query('userId') userId: string,
    @Query('experimentId') experimentId: string,
  ) {
    return await this.userExperimentService.removeByUserIdAndExperimentId(
      userId,
      experimentId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user experiment by id' })
  @ApiParam({ name: 'id', type: String, description: 'UserExperiment ID' })
  @ApiResponse({ status: 200, description: 'User experiment removed.', type: UserExperimentResponseDto })
  async remove(@Param('id') id: string) {
    return await this.userExperimentService.remove(id);
  }

  @Get('users-count/:experimentId')
  @ApiOperation({ summary: 'Count users participating in an experiment' })
  @ApiParam({ name: 'experimentId', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Number of users in the experiment.', type: CountUsersResponseDto })
  async countUsers(@Param('experimentId') experimentId: string) {
    return await this.userExperimentService.countUsersByExperimentId(experimentId);
  }
}


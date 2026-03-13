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

import { CreateSurveyAnswerDto } from './dto/create-surveyAnswer.dto';
import { SurveyAnswerResponseDto } from './dto/survey-answer-response.dto';
import { UpdateSurveyAnswerDto } from './dto/update-surveyAnswer.dto';
import { SurveyAnswer } from './entity/survey-answer.entity';
import { SurveyAnswerService } from './survey-answer.service';

@ApiTags('Survey Answer')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('survey-answer')
export class SurveyAnswerController {
  constructor(private readonly surveyAnswerService: SurveyAnswerService) { }

  @Post()
  @ApiOperation({ summary: 'Submit survey answers' })
  @ApiBody({ type: CreateSurveyAnswerDto })
  @ApiResponse({ status: 201, description: 'Survey answers submitted.', type: SurveyAnswerResponseDto })
  async create(
    @Body() createSurveyAnswerDto: CreateSurveyAnswerDto,
  ): Promise<SurveyAnswer> {
    return await this.surveyAnswerService.create(createSurveyAnswerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get survey answers or filter by userId and surveyId' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'User ID' })
  @ApiQuery({ name: 'surveyId', required: false, type: String, description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Survey answers list or filtered result.', type: SurveyAnswerResponseDto, isArray: true })
  async findAll(
    @Query('userId') userId: string,
    @Query('surveyId') surveyId: string,
  ): Promise<SurveyAnswer[] | SurveyAnswer> {
    if (userId) {
      if (surveyId) {
        return await this.surveyAnswerService.findByUserIdAndSurveyId(
          userId,
          surveyId,
        );
      }
      return await this.surveyAnswerService.findByUserId(userId);
    }
    return await this.surveyAnswerService.findAll();
  }

  @Get('/user/:userId/survey/:surveyId')
  @ApiOperation({ summary: 'Get survey answer by user and survey' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiParam({ name: 'surveyId', type: String, description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Survey answer.', type: SurveyAnswerResponseDto })
  async findByUserIdAndSurveyId(
    @Param('userId') userId: string,
    @Param('surveyId') surveyId: string,
  ): Promise<SurveyAnswer> {
    return await this.surveyAnswerService.findByUserIdAndSurveyId(
      userId,
      surveyId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update survey answer' })
  @ApiParam({ name: 'id', type: String, description: 'SurveyAnswer ID' })
  @ApiBody({ type: UpdateSurveyAnswerDto })
  @ApiResponse({ status: 200, description: 'Survey answer updated.', type: SurveyAnswerResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateSurveyAnswerDto: UpdateSurveyAnswerDto,
  ): Promise<SurveyAnswer> {
    return await this.surveyAnswerService.update(id, updateSurveyAnswerDto);
  }
}

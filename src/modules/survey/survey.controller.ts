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

import { CreateSurveyDto } from './dto/create-survey.dto';
import { SurveyResponseDto } from './dto/survey-response.dto';
import { SurveyStatsDto } from './dto/survey-stats.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { Survey } from './entity/survey.entity';
import { SurveyService } from './survey.service';

@ApiTags('Survey')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) { }

  @Post()
  @ApiOperation({ summary: 'Create a survey' })
  @ApiBody({ type: CreateSurveyDto })
  @ApiResponse({ status: 201, description: 'Survey created successfully.', type: SurveyResponseDto })
  async create(@Body() createSurveyDto: CreateSurveyDto): Promise<Survey> {
    return await this.surveyService.create(createSurveyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all surveys' })
  @ApiResponse({ status: 200, description: 'List of surveys.', type: SurveyResponseDto, isArray: true })
  async findAll(): Promise<Survey[]> {
    return await this.surveyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a survey by id' })
  @ApiParam({ name: 'id', type: String, description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Survey details.', type: SurveyResponseDto })
  @ApiResponse({ status: 404, description: 'Survey not found.', type: ErrorResponseDto })
  async findOne(@Param('id') id: string): Promise<Survey> {
    return await this.surveyService.findOne(id);
  }

  @Get('/experiment/:experimentId')
  @ApiOperation({ summary: 'Get surveys by experiment id' })
  @ApiParam({ name: 'experimentId', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Surveys linked to the experiment.', type: SurveyResponseDto, isArray: true })
  async findByExperimentId(
    @Param('experimentId') experimentId: string,
  ): Promise<Survey[]> {
    return await this.surveyService.findByExperimentId(experimentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a survey by id' })
  @ApiParam({ name: 'id', type: String, description: 'Survey ID' })
  @ApiBody({ type: UpdateSurveyDto })
  @ApiResponse({ status: 200, description: 'Survey updated successfully.', type: SurveyResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateSurveyDto: UpdateSurveyDto,
  ): Promise<Survey> {
    return await this.surveyService.update(id, updateSurveyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a survey by id' })
  @ApiParam({ name: 'id', type: String, description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Survey deleted successfully.', type: SurveyResponseDto })
  async remove(@Param('id') id: string) {
    return await this.surveyService.remove(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get survey statistics' })
  @ApiParam({ name: 'id', type: String, description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Survey statistics.', type: SurveyStatsDto })
  async getStats(@Param('id') id: string): Promise<SurveyStatsDto> {
    return await this.surveyService.getStats(id);
  }
}

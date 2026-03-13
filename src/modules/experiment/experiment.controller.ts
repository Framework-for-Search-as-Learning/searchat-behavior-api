/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ErrorResponseDto } from 'src/common/dto/api-responses.dto';

import { CreateExperimentDto } from './dto/create-experiment.dto';
import { ExperimentParticipantDto } from './dto/experiment-participant.dto';
import {
  ExperimentGeneralInfoResponseDto,
  ExperimentResponseDto,
  ExperimentStepsResponseDto,
} from './dto/experiment-response.dto';
import { ExperimentStatsDto } from './dto/experiment-stats.dto';
import { ExperimentSurveyStatsDto } from './dto/experiment-surveys-stats.dto';
import { ExperimentTaskExecutionDto } from './dto/experiment-tasks-execution.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { Experiment } from './entity/experiment.entity';
import { ExperimentService } from './experiment.service';

type UploadedYamlFile = {
  buffer: Buffer;
};

@ApiTags('Experiment')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('experiment')
export class ExperimentController {
  constructor(private readonly experimentService: ExperimentService) { }

  @Post()
  @ApiOperation({ summary: 'Create an experiment' })
  @ApiBody({ type: CreateExperimentDto })
  @ApiResponse({ status: 201, description: 'Experiment created successfully.', type: ExperimentResponseDto })
  async create(
    @Body() createExperimentDto: CreateExperimentDto,
  ): Promise<Experiment> {
    return await this.experimentService.create(createExperimentDto);
  }

  @Post('import/:ownerId')
  @ApiOperation({ summary: 'Import experiment from YAML file' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'ownerId', type: String, description: 'Owner ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Experiment imported successfully.',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: [],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importExperiment(
    @Param('ownerId') ownerId: string,
    @UploadedFile() file: UploadedYamlFile,
  ): Promise<string[]> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const yamlContent = file.buffer.toString('utf-8');
    return await this.experimentService.importFromYaml(yamlContent, ownerId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all experiments' })
  @ApiResponse({ status: 200, description: 'List of experiments.', type: ExperimentResponseDto, isArray: true })
  async findAll(): Promise<Experiment[]> {
    return await this.experimentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single experiment by id' })
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Experiment details.', type: ExperimentResponseDto })
  @ApiResponse({ status: 404, description: 'Experiment not found.', type: ErrorResponseDto })
  async findOne(@Param('id') id: string): Promise<Experiment> {
    return await this.experimentService.find(id);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get experiments by ownerId' })
  @ApiParam({ name: 'ownerId', type: String, description: 'Owner ID' })
  @ApiResponse({ status: 200, description: 'Experiments for the owner.', type: ExperimentResponseDto, isArray: true })
  async findByOwenerId(
    @Param('ownerId') ownerId: string,
  ): Promise<Experiment[]> {
    return await this.experimentService.findByOwnerId(ownerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an experiment by id' })
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiBody({ type: UpdateExperimentDto })
  @ApiResponse({ status: 200, description: 'Experiment updated successfully.', type: ExperimentResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateExperimentDto: UpdateExperimentDto,
  ): Promise<Experiment> {
    return await this.experimentService.update(id, updateExperimentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an experiment by id' })
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Experiment deleted successfully.', type: ExperimentResponseDto })
  async remove(@Param('id') id: string) {
    return await this.experimentService.remove(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get experiment statistics' })
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Experiment statistics.', type: ExperimentStatsDto })
  async getStats(@Param('id') id: string): Promise<ExperimentStatsDto> {
    return await this.experimentService.getStats(id);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get experiment participants details' })
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Participants details.', type: ExperimentParticipantDto, isArray: true })
  async getParticipants(@Param('id') id: string): Promise<ExperimentParticipantDto[]> {
    return await this.experimentService.getParticipants(id);
  }

  @Get(':id/tasks-execution')
  @ApiOperation({ summary: 'Get experiment tasks execution details' })
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Task execution details.', type: ExperimentTaskExecutionDto, isArray: true })
  async getTasksExecution(@Param('id') id: string): Promise<ExperimentTaskExecutionDto[]> {
    return await this.experimentService.getTasksExecutionDetails(id);
  }


  @Get(':id/surveys-stats')
  @ApiOperation({ summary: 'Get experiment surveys statistics' })
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Survey statistics for the experiment.', type: ExperimentSurveyStatsDto })
  async getSurveysStats(@Param('id') id: string): Promise<ExperimentSurveyStatsDto> {
    return await this.experimentService.getSurveysStats(id);
  }

  @Get('export/:id')
  @ApiOperation({ summary: 'Export experiment as YAML file' })
  @Header('Content-Type', 'application/x-yaml')
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiProduces('application/x-yaml')
  @ApiResponse({
    status: 200,
    description: 'YAML file content.',
    schema: {
      type: 'string',
      example: 'experiment:\n  name: bias-study\n  summary: Sample experiment\n',
    },
  })
  async exportExperiment(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const yamlContent = await this.experimentService.exportToYaml(id);
    const experiment = await this.experimentService.find(id);
    const filename = `experiment_${experiment.name.replace(/[^a-zA-Z0-9]/g, '_')}.yaml`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/x-yaml');
    res.send(yamlContent);
  }

  @Get('general-info/:experimentId')
  @ApiOperation({ summary: 'Get general experiment info' })
  @ApiParam({ name: 'experimentId', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'General experiment information.', type: ExperimentGeneralInfoResponseDto })
  async getGeneralExperimentInfo(@Param('experimentId') experimentId: string) {
    return await this.experimentService.getGeneralExpirementInfos(experimentId);
  }

  @Get(':id/step')
  @ApiOperation({ summary: 'Get steps from experiment' })
  @ApiParam({ name: 'id', type: String, description: 'Experiment ID' })
  @ApiResponse({ status: 200, description: 'Experiment steps.', type: ExperimentStepsResponseDto })
  async getStep(@Param('id') id: string) {
    return await this.experimentService.buildStep(id);
  }
}

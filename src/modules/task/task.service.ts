/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ExperimentService } from '../experiment/experiment.service';
import { SurveyService } from '../survey/survey.service';
import { TaskQuestionMapService } from '../task-question-map/task-question-map.service';
import { getDisplayProviderValue } from '../llm-session/constants/llm-provider-registry.constants';
import { PROVIDER_CONFIG_SECRET_KEYS } from './constants/provider-config.constants';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskProviderConfig } from './entities/task.entity';
import { TaskWithProviderMask } from './types/provider-config.types';
import {
  buildProviderConfigMask,
  isMaskedValue,
} from './utils/provider-config-mask.util';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject(forwardRef(() => ExperimentService))
    private readonly experimentService: ExperimentService,
    @Inject(forwardRef(() => SurveyService))
    private readonly surveyService: SurveyService,
    @Inject(forwardRef(() => TaskQuestionMapService))
    private readonly taskQuestionMapService: TaskQuestionMapService,
  ) { }

  private normalizeProviderConfigForOutput(
    providerConfig?: TaskProviderConfig,
  ): TaskProviderConfig | undefined {
    if (!providerConfig) {
      return undefined;
    }

    const displayProvider = getDisplayProviderValue(
      typeof providerConfig.modelProvider === 'string'
        ? providerConfig.modelProvider
        : undefined,
      typeof providerConfig.model === 'string' ? providerConfig.model : undefined,
    );

    if (!displayProvider) {
      return providerConfig;
    }

    return {
      ...providerConfig,
      modelProvider: displayProvider,
    };
  }

  private applyProviderConfigMask(task: Task | null): TaskWithProviderMask | null {
    if (!task) {
      return task;
    }
    const { masked, sanitized } = buildProviderConfigMask(
      task.provider_config as TaskProviderConfig,
    );
    return {
      ...task,
      provider_config: this.normalizeProviderConfigForOutput(
        sanitized as TaskProviderConfig,
      ) as Record<string, unknown>,
      provider_config_masked: masked,
    } as TaskWithProviderMask;
  }

  private applyProviderConfigMaskList(tasks: Task[]): TaskWithProviderMask[] {
    return tasks.map((task) => this.applyProviderConfigMask(task) as TaskWithProviderMask);
  }

  async create(createTaskDto: CreateTaskDto): Promise<TaskWithProviderMask> {
    try {
      const {
        title,
        summary,
        description,
        search_source,
        experiment_id,
        survey_id,
        rule_type,
        min_score,
        max_score,
        questionsId,
        provider_config
      } = createTaskDto;


      const experiment = await this.experimentService.find(experiment_id);
      if (!experiment) {
        throw new NotFoundException('Experimento não encontrado');
      }
      let survey = null;
      if (survey_id) {
        survey = await this.surveyService.findOne(survey_id);
        if (!survey) {
          throw new NotFoundException('Survey não encontrado');
        }
      }
      const newTask = await this.taskRepository.save({
        title,
        summary,
        description,
        experiment,
        search_source,
        survey,
        rule_type,
        min_score: min_score || 0,
        max_score: max_score || 0,
        provider_config
      });
      if (questionsId?.length > 0) {
        await Promise.all(
          questionsId.map((questionId) =>
            this.taskQuestionMapService.create(newTask._id, questionId),
          ),
        );
      }
      return newTask;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  async findOne(id: string): Promise<TaskWithProviderMask> {
    const task = await this.taskRepository
      .createQueryBuilder('task')
      .addSelect('task.provider_config')
      .where('task._id = :id', { id })
      .getOne();
    return this.applyProviderConfigMask(task) as TaskWithProviderMask;
  }

  async findMany(ids: string[]): Promise<Task[]> {
    return await this.taskRepository.find({
      where: {
        _id: In(ids),
      },
    });
  }

  async findByExperimentId(experimentId: string): Promise<Task[]> {
    return await this.taskRepository.find({
      where: {
        experiment: { _id: experimentId },
      },
    });
  }

  async findBySurveyId(surveyId: string): Promise<Task[]> {
    return await this.taskRepository.find({
      where: {
        survey_id: surveyId,
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskWithProviderMask> {
    const oldTask = await this.findOne(id);
    if (
      updateTaskDto.survey_id &&
      updateTaskDto?.survey_id !== oldTask.survey_id
    ) {
      const survey = await this.surveyService.findOne(updateTaskDto.survey_id);
      if (!survey) {
        throw new NotFoundException('Survey não encontrado');
      }
    }
    const questionsInTask =
      await this.taskQuestionMapService.findQuestionsByTask(id);
    if (updateTaskDto.rule_type !== 'score' && questionsInTask !== updateTaskDto?.questionsId) {
      await this.taskQuestionMapService.updateTaskQuestionMap(
        id,
        updateTaskDto.questionsId,
      );
    }
    delete updateTaskDto.questionsId;

    if (updateTaskDto.provider_config) {
      const current = await this.taskRepository.findOne({
        where: { _id: id },
        select: ['provider_config'],
      });
      const currentConfig = (current?.provider_config || {}) as TaskProviderConfig;
      const incomingConfig = updateTaskDto.provider_config as TaskProviderConfig;
      const mergedConfig: TaskProviderConfig = {
        ...currentConfig,
        ...incomingConfig,
      };
      for (const key of PROVIDER_CONFIG_SECRET_KEYS) {
        const incomingValue = incomingConfig[key];
        const incomingString = typeof incomingValue === 'string' ? incomingValue : undefined;
        const preserveValue = !incomingString || isMaskedValue(incomingString);
        if (preserveValue) {
          if (currentConfig[key]) {
            mergedConfig[key] = currentConfig[key];
          } else {
            delete mergedConfig[key];
          }
        }
      }
      updateTaskDto.provider_config = mergedConfig as Record<string, unknown>;
    }

    await this.taskRepository.update({ _id: id }, updateTaskDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.taskRepository.delete({ _id: id });
    return task;
  }


  async getGoogleCredentials(taskId: string) {
    try {
      const task = await this.taskRepository.findOne({
        where: { _id: taskId },
        select: ['provider_config'],
      });
      const providerConfig = task?.provider_config || {};
      if (providerConfig.searchProvider !== 'google') {
        throw new Error('GoogleSearch provider not configured for this task');
      }
      return { apiKey: providerConfig.apiKey, cx: providerConfig.cx };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to load Google credentials',
        { cause: error },
      );
    }
  }

}

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

import {SurveyService} from '../survey/survey.service';
import {Survey} from '../survey/entity/survey.entity';
import {TaskService} from '../task/task.service';
import {TaskSurvey} from './entity/taskSurvey.entity';

@Injectable()
export class TaskSurveyService {
  constructor(
    @InjectRepository(TaskSurvey)
    private readonly taskSurveyRepository: Repository<TaskSurvey>,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
    @Inject(forwardRef(() => SurveyService))
    private readonly surveyService: SurveyService,
  ) {}

  async link(taskId: string, surveyId: string): Promise<TaskSurvey> {
    const task = await this.taskService.findOne(taskId);
    if (!task) {
      throw new NotFoundException('Task não encontrada.');
    }
    const survey = await this.surveyService.findOne(surveyId);
    if (!survey) {
      throw new NotFoundException('Survey não encontrado.');
    }
    const existing = await this.taskSurveyRepository.findOne({
      where: {task_id: taskId, survey_id: surveyId},
    });
    if (existing) {
      throw new ConflictException('Survey já está vinculado a esta task.');
    }
    return await this.taskSurveyRepository.save({task, survey});
  }

  async unlink(taskId: string, surveyId: string): Promise<void> {
    const record = await this.taskSurveyRepository.findOne({
      where: {task_id: taskId, survey_id: surveyId},
    });
    if (!record) {
      throw new NotFoundException('Vínculo entre task e survey não encontrado.');
    }
    await this.taskSurveyRepository.delete({_id: record._id});
  }

  async findSurveysByTask(taskId: string): Promise<Survey[]> {
    const records = await this.taskSurveyRepository.find({
      where: {task_id: taskId},
      relations: ['survey'],
    });
    return records.map((r) => r.survey);
  }

  async findTasksBySurvey(surveyId: string): Promise<string[]> {
    const records = await this.taskSurveyRepository.find({
      where: {survey_id: surveyId},
    });
    return records.map((r) => r.task_id);
  }
}

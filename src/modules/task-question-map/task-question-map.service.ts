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

import { TaskService } from '../task/task.service';
import { TaskQuestionMap } from './entity/taskQuestionMap.entity';

@Injectable()
export class TaskQuestionMapService {
  constructor(
    @InjectRepository(TaskQuestionMap)
    private readonly taskQuestionMapRepository: Repository<TaskQuestionMap>,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) { }

  async create(taskId: string, questionId: string): Promise<TaskQuestionMap> {
    const task = await this.taskService.findOne(taskId);
    if (!task) {
      throw new NotFoundException('Task não encontrada.');
    }
    return await this.taskQuestionMapRepository.save({
      task,
      question_id: questionId,
    });
  }

  async findQuestionsByTask(taskId: string): Promise<string[]> {
    const taskquestions = await this.taskQuestionMapRepository.find({
      where: { task_id: taskId },
    });
    const questionsIds = taskquestions.map(
      (taskQuestion) => taskQuestion.question_id,
    );
    return questionsIds;
  }

  async updateTaskQuestionMap(
    taskId: string,
    newQuestionsId: string[],
  ): Promise<void> {
    const currentQuestionsInTask = await this.findQuestionsByTask(taskId);

    const questionsToRemove = currentQuestionsInTask.filter(
      (question) => !newQuestionsId.includes(question),
    );

    const questionsToAdd = newQuestionsId.filter(
      (question) => !currentQuestionsInTask.includes(question),
    );

    if (questionsToRemove.length !== 0) {
      await this.removeQuestionsFromTask(taskId, questionsToRemove);
    }

    if (questionsToAdd.length !== 0) {
      await Promise.all(
        questionsToAdd.map((questionsId) => this.create(taskId, questionsId)),
      );
    }
  }

  async removeQuestionsFromTask(
    taskId: string,
    questionIds: string[],
  ): Promise<void> {
    await this.taskQuestionMapRepository.delete({
      task_id: taskId,
      question_id: In(questionIds),
    });
  }
}

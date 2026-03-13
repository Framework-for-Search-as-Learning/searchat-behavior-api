/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ExperimentService } from '../experiment/experiment.service';
import { SurveyService } from '../survey/survey.service';
import { TaskQuestionMapService } from '../task-question-map/task-question-map.service';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ExperimentService,
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: SurveyService,
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: TaskQuestionMapService,
          useValue: {
            findQuestionsByTask: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

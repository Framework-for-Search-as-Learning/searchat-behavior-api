/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SurveyService } from '../survey/survey.service';
import { UserService } from '../user/user.service';
import { UserTaskService } from '../user-task/user-task.service';
import { SurveyAnswer } from './entity/survey-answer.entity';
import { SurveyAnswerService } from './survey-answer.service';

describe('SurveyAnswerService', () => {
  let service: SurveyAnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyAnswerService,
        {
          provide: getRepositoryToken(SurveyAnswer),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: SurveyService,
          useValue: { find: jest.fn() },
        },
        {
          provide: UserTaskService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SurveyAnswerService>(SurveyAnswerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

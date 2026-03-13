/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { SurveyAnswerController } from './survey-answer.controller';
import { SurveyAnswerService } from './survey-answer.service';

describe('SurveyAnswerController', () => {
  let controller: SurveyAnswerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveyAnswerController],
      providers: [
        {
          provide: SurveyAnswerService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SurveyAnswerController>(SurveyAnswerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

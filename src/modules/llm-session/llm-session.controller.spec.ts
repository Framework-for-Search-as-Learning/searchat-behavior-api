/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { LlmSessionController } from './llm-session.controller';
import { LlmSessionService } from './llm-session.service';

describe('LlmSessionController', () => {
  let controller: LlmSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmSessionController],
      providers: [
        {
          provide: LlmSessionService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<LlmSessionController>(LlmSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

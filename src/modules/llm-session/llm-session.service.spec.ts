/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from 'src/modules/task/entities/task.entity';

import { LlmMessage } from './entity/llm-message.entity';
import { LlmSession } from './entity/llm-session.entity';
import { LlmSessionService } from './llm-session.service';

describe('LlmSessionService', () => {
  let service: LlmSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmSessionService,
        {
          provide: getRepositoryToken(LlmSession),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LlmMessage),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LlmSessionService>(LlmSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

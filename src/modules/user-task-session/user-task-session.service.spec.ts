/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Page } from './entities/page.entity';
import { UserTaskSession } from './entities/user-task-session.entity';
import { UserTaskSessionService } from './user-task-session.service';

describe('UserTaskSessionService', () => {
  let service: UserTaskSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTaskSessionService,
        {
          provide: getRepositoryToken(UserTaskSession),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Page),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserTaskSessionService>(UserTaskSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserTaskController } from './user-task.controller';
import { UserTaskService } from './user-task.service';

describe('UserTaskController', () => {
  let controller: UserTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTaskController],
      providers: [
        {
          provide: UserTaskService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserTaskController>(UserTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserExperimentController } from './user-experiment.controller';
import { UserExperimentService } from './user-experiment.service';

describe('UserExperimentController', () => {
  let controller: UserExperimentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserExperimentController],
      providers: [
        {
          provide: UserExperimentService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserExperimentController>(UserExperimentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { ExperimentController } from './experiment.controller';
import { ExperimentService } from './experiment.service';

describe('ExperimentController', () => {
  let controller: ExperimentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperimentController],
      providers: [
        {
          provide: ExperimentService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ExperimentController>(ExperimentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

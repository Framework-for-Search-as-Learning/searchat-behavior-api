/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { IcfController } from './icf.controller';
import { IcfService } from './icf.service';

describe('IcfController', () => {
  let controller: IcfController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IcfController],
      providers: [
        {
          provide: IcfService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<IcfController>(IcfController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

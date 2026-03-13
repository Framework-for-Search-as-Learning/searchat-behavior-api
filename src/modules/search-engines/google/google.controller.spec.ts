/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';

describe('GoogleController', () => {
  let controller: GoogleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleController],
      providers: [
        {
          provide: GoogleService,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GoogleController>(GoogleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { HttpService } from '../../http/http.service';
import { TaskService } from '../../task/task.service';
import { GoogleService } from './google.service';

describe('GoogleService', () => {
  let service: GoogleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            head: jest.fn(),
          },
        },
        {
          provide: TaskService,
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GoogleService>(GoogleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskModule } from '../task/task.module';
import { TaskQuestionMap } from './entity/taskQuestionMap.entity';
import { TaskQuestionMapController } from './task-question-map.controller';
import { TaskQuestionMapService } from './task-question-map.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskQuestionMap]),
    forwardRef(() => TaskModule),
  ],
  providers: [TaskQuestionMapService],
  controllers: [TaskQuestionMapController],
  exports: [TaskQuestionMapService],
})
export class TaskQuestionMapModule { }

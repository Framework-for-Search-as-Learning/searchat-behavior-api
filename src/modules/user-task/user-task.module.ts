/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LlmSessionModule } from 'src/modules/llm-session/llm-session.module';

import { TaskModule } from '../task/task.module';
import { TaskQuestionMapModule } from '../task-question-map/task-question-map.module';
import { UserModule } from '../user/user.module';
import { UserTaskSessionModule } from '../user-task-session/user-task-session.module';
import { UserTask } from './entities/user-tasks.entity';
import { UserTaskController } from './user-task.controller';
import { UserTaskService } from './user-task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTask]),
    forwardRef(() => TaskModule),
    UserModule,
    TaskQuestionMapModule,
    forwardRef(() => UserTaskSessionModule),
    forwardRef(() => LlmSessionModule)
  ],
  providers: [UserTaskService],
  controllers: [UserTaskController],
  exports: [UserTaskService],
})
export class UserTaskModule { }

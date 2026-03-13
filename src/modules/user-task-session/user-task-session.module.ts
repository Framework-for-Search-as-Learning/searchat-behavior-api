/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Page } from './entities/page.entity';
import { UserTaskSession } from './entities/user-task-session.entity';
import { UserTaskSessionController } from './user-task-session.controller';
import { UserTaskSessionService } from './user-task-session.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTaskSession, Page])],
  providers: [UserTaskSessionService],
  controllers: [UserTaskSessionController],
  exports: [UserTaskSessionService],
})
export class UserTaskSessionModule { }

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExperimentModule } from '../experiment/experiment.module';
import { TaskModule } from '../task/task.module';
import { UserModule } from '../user/user.module';
import { UserTaskModule } from '../user-task/user-task.module';
import { UserExperiment } from './entities/user-experiments.entity';
import { UserExperimentController } from './user-experiment.controller';
import { UserExperimentService } from './user-experiment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserExperiment]),
    UserModule,
    forwardRef(() => ExperimentModule),
    UserTaskModule,
    forwardRef(() => TaskModule),
  ],
  providers: [UserExperimentService],
  controllers: [UserExperimentController],
  exports: [UserExperimentService],
})
export class UserExperimentModule { }

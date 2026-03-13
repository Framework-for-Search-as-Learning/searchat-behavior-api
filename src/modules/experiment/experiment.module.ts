/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IcfModule } from '../icf/icf.module';
import { SurveyModule } from '../survey/survey.module';
import { TaskModule } from '../task/task.module';
import { UserModule } from '../user/user.module';
import { UserExperimentModule } from '../user-experiment/user-experiment.module';
import { UserTaskModule } from '../user-task/user-task.module';
import { Experiment } from './entity/experiment.entity';
import { ExperimentController } from './experiment.controller';
import { ExperimentService } from './experiment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experiment]),
    forwardRef(() => UserExperimentModule),
    UserTaskModule,
    UserModule,
    forwardRef(() => TaskModule),
    SurveyModule,
    forwardRef(() => IcfModule),
  ],
  providers: [ExperimentService],
  controllers: [ExperimentController],
  exports: [ExperimentService],
})
export class ExperimentModule { }

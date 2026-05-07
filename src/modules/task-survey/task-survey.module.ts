/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {SurveyModule} from '../survey/survey.module';
import {TaskModule} from '../task/task.module';
import {TaskSurvey} from './entity/taskSurvey.entity';
import {TaskSurveyController} from './task-survey.controller';
import {TaskSurveyService} from './task-survey.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskSurvey]),
    forwardRef(() => TaskModule),
    forwardRef(() => SurveyModule),
  ],
  providers: [TaskSurveyService],
  controllers: [TaskSurveyController],
  exports: [TaskSurveyService],
})
export class TaskSurveyModule {}

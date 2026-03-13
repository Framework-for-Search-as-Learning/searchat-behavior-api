/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExperimentModule } from '../experiment/experiment.module';
import { SurveyAnswerModule } from '../survey-answer/survey-answer.module';
import { Survey } from './entity/survey.entity';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey]),
    forwardRef(() => ExperimentModule),
    forwardRef(() => SurveyAnswerModule),
  ],
  controllers: [SurveyController],
  providers: [SurveyService],
  exports: [SurveyService],
})
export class SurveyModule { }

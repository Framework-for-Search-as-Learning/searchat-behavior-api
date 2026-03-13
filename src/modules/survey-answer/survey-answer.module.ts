/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SurveyModule } from '../survey/survey.module';
import { UserModule } from '../user/user.module';
import { UserTaskModule } from '../user-task/user-task.module';
import { SurveyAnswer } from './entity/survey-answer.entity';
import { SurveyAnswerController } from './survey-answer.controller';
import { SurveyAnswerService } from './survey-answer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SurveyAnswer]),
    UserModule,
    forwardRef(() => SurveyModule),
    UserTaskModule,
  ],
  providers: [SurveyAnswerService],
  controllers: [SurveyAnswerController],
  exports: [SurveyAnswerService],
})
export class SurveyAnswerModule { }

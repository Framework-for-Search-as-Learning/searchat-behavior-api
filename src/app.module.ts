/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MailerModule} from '@nestjs-modules/mailer';
import * as Joi from 'joi';

import {AppController} from './app.controller';
import {AuthModule} from './modules/auth/auth.module';
import {Experiment} from './modules/experiment/entity/experiment.entity';
import {ExperimentModule} from './modules/experiment/experiment.module';
import {HttpModule} from './modules/http/http.module';
import {Icf} from './modules/icf/entity/icf.entity';
import {IcfModule} from './modules/icf/icf.module';
import {LlmMessage} from './modules/llm-session/entity/llm-message.entity';
import {LlmSession} from './modules/llm-session/entity/llm-session.entity';
import {LlmSessionModule} from './modules/llm-session/llm-session.module';
import {GoogleModule} from './modules/search-engines/google/google.module';
import {Survey} from './modules/survey/entity/survey.entity';
import {SurveyModule} from './modules/survey/survey.module';
import {SurveyAnswer} from './modules/survey-answer/entity/survey-answer.entity';
import {SurveyAnswerModule} from './modules/survey-answer/survey-answer.module';
import {Task} from './modules/task/entities/task.entity';
import {TaskModule} from './modules/task/task.module';
import {TaskQuestionMap} from './modules/task-question-map/entity/taskQuestionMap.entity';
import {TaskQuestionMapModule} from './modules/task-question-map/task-question-map.module';
import {User} from './modules/user/entity/user.entity';
import {UserModule} from './modules/user/user.module';
import {UserExperiment} from './modules/user-experiment/entities/user-experiments.entity';
import {UserExperimentModule} from './modules/user-experiment/user-experiment.module';
import {UserTask} from './modules/user-task/entities/user-tasks.entity';
import {UserTaskModule} from './modules/user-task/user-task.module';
import {Page} from './modules/user-task-session/entities/page.entity';
import {UserTaskSession} from './modules/user-task-session/entities/user-task-session.entity';
import {UserTaskSessionModule} from './modules/user-task-session/user-task-session.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_USER: Joi.string().empty('').default('postgres'),
        DB_PASSWORD: Joi.string().empty('').default('postgres'),
        DB_HOST: Joi.string().empty('').default('localhost'),
        DB_PORT: Joi.number().empty('').default(5432),
        DB_NAME: Joi.string().empty('').default('sal'),
        PORT: Joi.number().default(3000),
        SECRET: Joi.string().required(),
      }),
    }),
    AuthModule,
    HttpModule,
    GoogleModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [
          User,
          Experiment,
          Task,
          Survey,
          UserExperiment,
          UserTask,
          SurveyAnswer,
          TaskQuestionMap,
          Icf,
          UserTaskSession,
          Page,
          LlmSession,
          LlmMessage,
        ],
        synchronize: true,
      }),
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
        },
      },
    }),
    UserModule,
    ExperimentModule,
    TaskModule,
    UserExperimentModule,
    UserTaskModule,
    SurveyModule,
    SurveyAnswerModule,
    TaskQuestionMapModule,
    IcfModule,
    UserTaskSessionModule,
    LlmSessionModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

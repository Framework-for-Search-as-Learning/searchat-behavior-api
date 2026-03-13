/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { BaseEntity } from 'src/model/base-entity';
import { LlmSession } from 'src/modules/llm-session/entity/llm-session.entity';
import { SurveyAnswer } from 'src/modules/survey-answer/entity/survey-answer.entity';
import { UserExperiment } from 'src/modules/user-experiment/entities/user-experiments.entity';
import { UserTask } from 'src/modules/user-task/entities/user-tasks.entity';
import { UserTaskSession } from 'src/modules/user-task-session/entities/user-task-session.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column()
  name: string;
  @Column()
  lastName: string;
  @Column({ unique: true, nullable: false })
  email: string;
  @Column({ nullable: false })
  password: string;
  @Column({ nullable: true })
  birthDate: Date;
  @Column({ nullable: true })
  recoveryPasswordToken: string;
  @Column({ nullable: true })
  recoveryPasswordTokenExpirationDate: Date;
  @Column()
  researcher: boolean;
  @OneToMany(() => UserExperiment, (userExperiment) => userExperiment.user, {
    cascade: true,
  })
  userExperiments: UserExperiment[];
  @OneToMany(() => UserTask, (userTask) => userTask.user, { cascade: true })
  userTasks: UserTask[];
  @OneToMany(() => SurveyAnswer, (surveyAnswer) => surveyAnswer.user, {
    cascade: true,
  })
  surveyAnswers: SurveyAnswer[];

  @OneToMany(() => UserTaskSession, (session) => session.user)
  sessions: UserTaskSession[];


  @OneToMany(() => LlmSession, (session) => session.user)
  llmSessions: LlmSession[];

}

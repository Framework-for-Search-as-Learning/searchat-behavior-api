/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { BaseEntity } from 'src/model/base-entity';
import { Experiment } from 'src/modules/experiment/entity/experiment.entity';
import { SurveyAnswer } from 'src/modules/survey-answer/entity/survey-answer.entity';
import { Task } from 'src/modules/task/entities/task.entity';
import { TaskSurvey } from 'src/modules/task-survey/entity/taskSurvey.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { QuestionDTO } from '../dto/question.dto';

export enum SurveyType {
  PRE = 'pre',
  POST = 'post',
  DEMO = 'demo',
}

@Entity()
export class Survey extends BaseEntity {
  @Column()
  name: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({ type: 'jsonb' })
  questions: QuestionDTO[];
  @Column({
    type: 'enum',
    enum: SurveyType,
  })
  type: SurveyType = SurveyType.DEMO;
  @Column()
  experiment_id: string;
  @ManyToOne(() => Experiment, (experiment) => experiment.surveys, {
    onDelete: 'CASCADE',
  })
  experiment: Experiment;
  @OneToMany(() => SurveyAnswer, (surveyAnswer) => surveyAnswer.survey, {
    cascade: true,
  })
  surveyAnswers: SurveyAnswer[];

  @OneToMany(() => Task, (task) => task.survey, { cascade: true })
  tasks: Task[];

  @Column({ default: false })
  uniqueAnswer: boolean;

  @Column({ default: true })
  required: boolean;

  @OneToMany(() => TaskSurvey, (taskSurvey) => taskSurvey.survey)
  taskSurveys: TaskSurvey[];
}

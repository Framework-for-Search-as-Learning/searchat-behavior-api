/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { BaseEntity } from 'src/model/base-entity';
import { Survey } from 'src/modules/survey/entity/survey.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

import { AnswerDTO } from '../dto/answers.dto';

@Entity()
export class SurveyAnswer extends BaseEntity {
  @ManyToOne(() => User, (user) => user.surveyAnswers, { onDelete: 'CASCADE' })
  user: User;
  @Column()
  user_id: string;

  @ManyToOne(() => Survey, (survey) => survey.surveyAnswers, {
    onDelete: 'CASCADE',
  })
  survey: Survey;
  @Column()
  survey_id: string;

  @Column({ type: 'jsonb' })
  answers: AnswerDTO[];

  @Column({ type: 'float' })
  score: number;
}

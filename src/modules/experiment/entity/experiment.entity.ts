/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { BaseEntity } from 'src/model/base-entity';
import { Icf } from 'src/modules/icf/entity/icf.entity';
import { Survey } from 'src/modules/survey/entity/survey.entity';
import { Task } from 'src/modules/task/entities/task.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { UserExperiment } from 'src/modules/user-experiment/entities/user-experiments.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

enum SurveyType {
  PRE = 'pre',
  POST = 'post',
  OTHER = 'other',
}

export enum ExperimentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export class SurveyProps {
  id: string;
  uniqueAnswer: boolean = false;
  type: SurveyType = SurveyType.OTHER;
  required: boolean = false;
}
export class TaskProps {
  title: string;
  summary: string;
  description: string;
  search_source: string;
  SelectedSurvey: string;
  RulesExperiment: string; 
  ScoreThreshold: number;
  ScoreThresholdmx: number;
  selectedQuestionIds: string[];
  provider_config?: Record<string, unknown>;
}

export class UserProps {
  id: string;
  name: string;
  email: string;
}

export enum StepsType {
  ICF = 'icf',
  PRE = 'pre',
  POST = 'post',
  TASK = 'task',
}
@Entity()
export class Experiment extends BaseEntity {
  @Column()
  name: string;
  @Column({ nullable: true })
  owner_id: string;
  @ManyToOne(() => User)
  owner: User;
  @Column()
  summary: string;
  @Column()
  typeExperiment: string;
  @Column()
  betweenExperimentType: string;

  @Column({ default: ExperimentStatus.NOT_STARTED })
  status: ExperimentStatus;

  @OneToMany(() => Task, (task) => task.experiment, { cascade: true })
  tasks: Task[];
  @OneToMany(
    () => UserExperiment,
    (userExperiment) => userExperiment.experiment,
    { cascade: true },
  )
  userExperiments: UserExperiment[];
  @OneToMany(() => Survey, (survey) => survey.experiment, { cascade: true })
  surveys: Survey[];

  @OneToMany(() => Icf, (icf) => icf.experiment, { cascade: true })
  icfs: Icf[];
}

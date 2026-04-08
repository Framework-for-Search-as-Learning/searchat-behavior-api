/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { BaseEntity } from 'src/model/base-entity';
import { Experiment } from 'src/modules/experiment/entity/experiment.entity';
import { LlmSession } from 'src/modules/llm-session/entity/llm-session.entity';
import { Survey } from 'src/modules/survey/entity/survey.entity';
import { TaskQuestionMap } from 'src/modules/task-question-map/entity/taskQuestionMap.entity';
import { UserTask } from 'src/modules/user-task/entities/user-tasks.entity';
import { UserTaskSession } from 'src/modules/user-task-session/entities/user-task-session.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

export type TaskProviderConfig = {
  modelProvider?: string;
  searchProvider?: string;
  model?: string;
  apiKey?: string;
  cx?: string;
  systemInstruction?: string;
  [key: string]: unknown;
};

@Entity()
export class Task extends BaseEntity {
  @Column()
  title: string;
  @Column()
  summary: string;
  @Column()
  description: string;
  @Column()
  search_source: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    select: false,
  })
  provider_config?: TaskProviderConfig;

  @OneToMany(() => LlmSession, (session) => session.task)
  llmSessions: LlmSession[];

  @ManyToOne(() => Experiment, (experiment) => experiment.tasks, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  experiment: Experiment;
  @Column()
  experiment_id: string;

  @ManyToOne(() => Survey, (survey) => survey.tasks, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  survey: Survey;
  @Column({ nullable: true })
  survey_id: string;

  @OneToMany(() => TaskQuestionMap, (taskQuestionMap) => taskQuestionMap.task, {
    cascade: true,
  })
  taskQuestionsMap: TaskQuestionMap[];

  @Column({ nullable: true })
  rule_type: string;

  @Column({ nullable: true })
  max_score: number;
  @Column({ nullable: true })
  min_score: number;

  @OneToMany(() => UserTask, (userTask) => userTask.task, { cascade: true })
  userTasks: UserTask[];

  @OneToMany(() => UserTaskSession, (session) => session.task)
  sessions: UserTaskSession[];
}

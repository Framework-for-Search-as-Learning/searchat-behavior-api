/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {Survey} from 'src/modules/survey/entity/survey.entity';
import {Task} from 'src/modules/task/entities/task.entity';
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique} from 'typeorm';

@Entity()
@Unique('UQ_task_survey_task_id_survey_id', ['task_id', 'survey_id'])
export class TaskSurvey {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @ManyToOne(() => Task, (task) => task.taskSurveys, {onDelete: 'CASCADE'})
  task: Task;
  @Column()
  task_id: string;

  @ManyToOne(() => Survey, (survey) => survey.taskSurveys, {onDelete: 'CASCADE'})
  survey: Survey;
  @Column()
  survey_id: string;
}

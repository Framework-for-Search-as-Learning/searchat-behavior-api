/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { BaseEntity } from 'src/model/base-entity';
import { Task } from 'src/modules/task/entities/task.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class UserTask extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userTasks, { onDelete: 'CASCADE' })
  user: User;
  @Column()
  user_id: string;
  @ManyToOne(() => Task, (task) => task.userTasks, { onDelete: 'CASCADE' })
  task: Task;
  @Column()
  task_id: string;
  @Column({ default: false })
  hasFinishedTask: boolean = false;
  @Column({ default: false })
  isPaused: boolean = false;
  @Column({ default: null })
  startTime: Date = null;
  @Column('date', { array: true })
  pauseTime: Date[] = [];
  @Column('date', { array: true })
  resumeTime: Date[] = [];
  @Column({ default: null })
  endTime: Date = null;
  @Column('json', { nullable: true, default: null })
  metadata: Record<string, unknown> | null = null;
}

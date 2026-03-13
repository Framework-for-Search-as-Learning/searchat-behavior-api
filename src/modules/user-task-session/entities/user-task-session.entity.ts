/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { BaseEntity } from 'src/model/base-entity';
import { Task } from 'src/modules/task/entities/task.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Page } from './page.entity';

@Entity()
export class UserTaskSession extends BaseEntity {
  @Column()
  timestamp: Date;

  @Column({ default: 1 })
  serpNumber: number;

  @Column()
  query: string;

  @ManyToOne(() => Task, (task) => task.sessions, { onDelete: 'CASCADE' })
  task: Task;
  @Column()
  task_id: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: User;
  @Column()
  user_id: string;

  @OneToMany(() => Page, (page) => page.session, { cascade: true })
  pages: Page[];
}

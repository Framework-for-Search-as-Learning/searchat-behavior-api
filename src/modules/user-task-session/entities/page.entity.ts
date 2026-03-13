/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {BaseEntity} from 'src/model/base-entity';
import {Column, Entity, ManyToOne} from 'typeorm';

import {UserTaskSession} from './user-task-session.entity';

@Entity()
export class Page extends BaseEntity {
  @ManyToOne(() => UserTaskSession, (session) => session.pages, {
    onDelete: 'CASCADE',
  })
  session: UserTaskSession;
  @Column()
  session_id: string;
  @Column()
  title: string;
  @Column()
  url: string;
  @Column()
  startTime: Date;
  @Column({nullable: true})
  endTime: Date;

  @Column()
  rank: number;
}

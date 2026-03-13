/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LlmSession } from './llm-session.entity';

@Entity('llm_messages')
export class LlmMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  role: 'user' | 'model'; 

  @ManyToOne(() => LlmSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  session: LlmSession;

  @CreateDateColumn()
  createdAt: Date;
}

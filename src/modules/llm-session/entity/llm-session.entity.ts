/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Task } from 'src/modules/task/entities/task.entity';
import { User } from 'src/modules/user/entity/user.entity';
import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LlmMessage } from './llm-message.entity';

@Entity('llm_sessions')
export class LlmSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.llmSessions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Task, (task) => task.llmSessions, { onDelete: 'CASCADE' })
  task: Task;

  @OneToMany(() => LlmMessage, (msg) => msg.session, { cascade: true })
  messages: LlmMessage[];
}

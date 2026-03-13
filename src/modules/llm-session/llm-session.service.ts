/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Content, GoogleGenerativeAI } from '@google/generative-ai';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/modules/task/entities/task.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Repository } from 'typeorm';

import { LlmMessage } from './entity/llm-message.entity';
import { LlmSession } from './entity/llm-session.entity';

@Injectable()
export class LlmSessionService {
  constructor(
    @InjectRepository(LlmSession)
    private readonly llmSessionRepository: Repository<LlmSession>,
    @InjectRepository(LlmMessage)
    private readonly llmMessageRepository: Repository<LlmMessage>,
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) { }

  async startSession(userId: string, taskId: string): Promise<LlmSession> {
    const existingSession = await this.llmSessionRepository.findOne({
      where: { user: { _id: userId }, task: { _id: taskId } },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } },
    });

    if (existingSession) {
      return existingSession;
    }

    const task = await this.taskRepository.findOne({ where: { _id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const newSession = this.llmSessionRepository.create({
      user: { _id: userId } as User,
      task: task,
    });

    return await this.llmSessionRepository.save(newSession);
  }

  async processChatMessage(sessionId: string, userId: string, content: string) {
    const session = await this.llmSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['task', 'user'],
      select: {
        id: true,
        task: {
          _id: true,
          provider_config: {
            apiKey: true,
            modelProvider: true,
            model: true,
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.user._id !== userId)
      throw new ForbiddenException('Session does not belong to user');
    const providerConfig = session.task.provider_config || {};
    if (!providerConfig.apiKey || !providerConfig.modelProvider) {
      throw new ForbiddenException('Task without AI configuration');
    }

    await this.llmMessageRepository.save({
      content: content,
      role: 'user',
      session: session,
    });

    const history = await this.llmMessageRepository.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' },
      take: 20,
    });

    const historyForAi: Content[] = history.slice(0, -1).map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    if (!['google'].includes(providerConfig.modelProvider)) {
      throw new ForbiddenException('LLM provider not supported');
    }

    const modelName = providerConfig.model || 'gemini-2.5-flash';
    const genAI = new GoogleGenerativeAI(providerConfig.apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const chat = model.startChat({ history: historyForAi });

    try {
      const result = await chat.sendMessageStream(content);

      return {
        stream: result.stream,
        saveBotResponse: async (fulltext: string) => {
          await this.llmMessageRepository.save({
            content: fulltext,
            role: 'model',
            session: session,
          });
        },
      };
    } catch (error) {
      console.error('Error Gemini:', error);
      throw new Error('Error processing Gemini AI response', {cause: error});
    }
  }

  async findByUserIdAndTaskId(userId: string, taskId: string): Promise<LlmSession> {
    return await this.llmSessionRepository.findOne({
      where: {
        user: { _id: userId },
        task: { _id: taskId }
      },
      relations: ['messages']
    });
  }
}

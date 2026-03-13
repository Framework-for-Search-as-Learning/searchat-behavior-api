/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Body, Controller, Param, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { LlmSessionResponseDto } from './dto/llm-session-response.dto';
import { LlmSessionService } from './llm-session.service';

@ApiTags('LLM Session')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('llm-session')
export class LlmSessionController {
  constructor(private readonly llmSessionService: LlmSessionService) { }

  @Post('start')
  @ApiOperation({ summary: 'Start an LLM session' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' },
        userId: { type: 'string', description: 'User ID' },
      },
      required: ['taskId', 'userId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Session started.', type: LlmSessionResponseDto })
  async startSession(@Body() body: { taskId: string; userId: string }) {
    return this.llmSessionService.startSession(body.userId, body.taskId);
  }

  @Post(':id/message')
  @ApiOperation({ summary: 'Send a message to an LLM session' })
  @ApiParam({ name: 'id', type: String, description: 'LLM session ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        content: { type: 'string', description: 'Message content' },
      },
      required: ['userId', 'content'],
    },
  })
  @ApiProduces('text/plain')
  @ApiResponse({
    status: 200,
    description: 'Streaming response from the model.',
    schema: {
      type: 'string',
      example: 'This topic can be explored by comparing multiple independent sources...',
    },
  })
  async sendMessage(
    @Param('id') sessionId: string,
    @Body() body: { userId: string; content: string },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
      const { stream, saveBotResponse } =
        await this.llmSessionService.processChatMessage(
          sessionId,
          body.userId,
          body.content,
        );

      let fullBotResponse = '';

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullBotResponse += chunkText;
        res.write(chunkText);
      }

      await saveBotResponse(fullBotResponse);
    } catch (error) {
      console.error('Error processing chat message:', error.message);
      res.write('\n[ERROR: Error to generate  response]');
    } finally {
      if (!res.writableEnded) {
        res.end();
      }
    }
  }
}

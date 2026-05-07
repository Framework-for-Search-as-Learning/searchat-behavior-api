/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { ApiProperty } from '@nestjs/swagger';

export class SearchTaskDetailsDto {
  @ApiProperty({ description: 'Total number of resources accessed across all queries', example: 6 })
  resourcesAccessedTotal: number;

  @ApiProperty({ description: 'Number of search queries performed', example: 2 })
  queriesCount: number;

  @ApiProperty({ type: () => SearchQueryWithResourcesDto, isArray: true, description: 'Queries with their resources' })
  queries: SearchQueryWithResourcesDto[];
}

export class SearchQueryWithResourcesDto {
  @ApiProperty({ description: 'Search query text', example: 'confirmation bias examples' })
  query: string;

  @ApiProperty({ description: 'When query was executed', type: String, format: 'date-time', example: '2026-02-24T13:31:00.000Z' })
  timestamp: Date;

  @ApiProperty({ description: 'SERP/page number', example: 1 })
  serpNumber: number;

  @ApiProperty({ description: 'Number of resources accessed for this query' })
  resourcesAccessedCount: number;

  @ApiProperty({ type: () => ResourceAccessDto, isArray: true, description: 'Visited resources for this query' })
  resources: ResourceAccessDto[];
}

export class ResourceAccessDto {
  @ApiProperty({ description: 'Resource page title', example: 'Confirmation bias - Wikipedia' })
  title: string;

  @ApiProperty({ description: 'Resource URL', example: 'https://en.wikipedia.org/wiki/Confirmation_bias' })
  url: string;

  @ApiProperty({ description: 'Time spent on resource in milliseconds' })
  timeSpent: number;

  @ApiProperty({ description: 'When resource visit started', type: String, format: 'date-time', example: '2026-02-24T13:32:10.000Z' })
  visitTime: Date;
}

export class LlmMessageDetailsDto {
  @ApiProperty({ description: 'Message content', example: 'Can you give me examples of confirmation bias?' })
  content: string;

  @ApiProperty({ description: 'Author role', enum: ['user', 'model'], example: 'user' })
  role: 'user' | 'model';

  @ApiProperty({ description: 'When message was created', type: String, format: 'date-time', example: '2026-02-24T13:35:00.000Z' })
  createdAt: Date;
}

export class LlmTaskDetailsDto {
  @ApiProperty({ nullable: true, required: false, description: 'System instruction configured for the LLM task' })
  systemInstruction?: string | null;

  @ApiProperty({ type: [LlmMessageDetailsDto], description: 'Messages exchanged with the model' })
  messages: LlmMessageDetailsDto[];

  @ApiProperty({ description: 'Total messages (user + model)', example: 8 })
  totalMessages: number;

  @ApiProperty({ description: 'Number of user prompts', example: 4 })
  promptsCount: number;
}

export class TaskExecutionDetailsDto {
  @ApiProperty({ description: 'UserTask ID', example: '1a0e8c1a-3f7a-4a02-92f9-4b0d7a5d2a12' })
  userTaskId: string;

  @ApiProperty({ description: 'Participant name', example: 'Maria Silva' })
  userName: string;

  @ApiProperty({ description: 'Participant email', example: 'maria.silva@example.com' })
  userEmail: string;

  @ApiProperty({ description: 'Task ID', example: '64d2f4a8e5f9b20b1c8a9f22' })
  taskId: string;

  @ApiProperty({ description: 'Task title', example: 'Find evidence of confirmation bias' })
  taskTitle: string;

  @ApiProperty({ description: 'Task type/source', example: 'search-engine' })
  taskType: string;

  @ApiProperty({ description: 'Total execution time in milliseconds', example: 312000 })
  executionTime: number;

  @ApiProperty({ required: false, type: SearchTaskDetailsDto, description: 'Execution details for search-engine tasks' })
  searchDetails?: SearchTaskDetailsDto;

  @ApiProperty({ required: false, type: LlmTaskDetailsDto, description: 'Execution details for LLM tasks' })
  llmDetails?: LlmTaskDetailsDto;
}

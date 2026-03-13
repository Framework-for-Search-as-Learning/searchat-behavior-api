/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SearchQueryResponseDto } from '../search-query-response.dto';
import { BingService } from './bing.service';

@ApiTags('Search Engine')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('search-engine')
export class BingController {

  private cache: Record<string, unknown> = {};

  constructor(private readonly bingService: BingService) { }

  @Get('bing')
  @ApiOperation({ summary: 'Search using Bing' })
  @ApiQuery({ name: 'query', type: String, required: true, description: 'Search query' })
  @ApiQuery({ name: 'start', type: Number, required: false, description: 'Start index for pagination' })
  @ApiQuery({ name: 'num', type: Number, required: false, description: 'Number of results per page' })
  @ApiResponse({ status: 200, description: 'Search results from Bing.', type: SearchQueryResponseDto })
  async query(
    @Query('query') query: string,
    @Query('taskId') taskId: string,
    @Query('start') startIndex: number = 0,
    @Query('num') resultsPerPage: number = 10,
  ) {
    query = query.trim();

    return await this.bingService.query(query, Number(startIndex), Number(resultsPerPage), taskId);

  }
}

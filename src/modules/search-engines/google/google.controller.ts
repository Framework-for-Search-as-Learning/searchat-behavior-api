/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

import { GoogleService } from './google.service';


@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('search-engine')
export class GoogleController {

  constructor(private readonly googleService: GoogleService) { }

  @Get('google')
  async query(
    @Query('query') query: string,
    @Query('taskId') taskId: string,
    @Query('start') startIndex: number = 0,
    @Query('num') resultsPerPage: number = 10,
  ) {
    query = query.trim();

    return await this.googleService.query(
      query,
      Number(startIndex),
      Number(resultsPerPage),
      taskId,
    );
  }
}

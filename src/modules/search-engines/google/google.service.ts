/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Injectable } from '@nestjs/common';
import { QueryResponse, SearchEngineService } from 'src/interfaces/search-engine';
import { HttpService } from 'src/modules/http/http.service';
import { TaskService } from 'src/modules/task/task.service';

import { SearchResultDto } from '../search-result.dto';
import { GOOGLE } from './google-constants';

const MAX_RESULTS = 100;
const MAX_START_INDEX = 91;

@Injectable()
export class GoogleService implements SearchEngineService {
  constructor(
    private readonly httpService: HttpService,
    private readonly taskService: TaskService
  ) { }

  async query(
    query: string,
    startIndex: number = 1,
    resultsPerPage: number = 10,
    taskId: string,
  ): Promise<QueryResponse> {
    const credentials = await this.taskService.getGoogleCredentials(taskId);
    return this.queryInternal(query, startIndex, resultsPerPage, credentials);
  }
  private async queryInternal(
    query: string,
    startIndex: number = 1,
    resultsPerPage: number = 10,
    credentials: { apiKey: string; cx: string },
  ): Promise<QueryResponse> {
    try {
      startIndex = Math.min(startIndex, MAX_START_INDEX);
      const url = `${GOOGLE.URL_BASE}?q=${query}&key=${credentials.apiKey}&cx=${credentials.cx}&num=${resultsPerPage}&start=${startIndex}&hl=pt-BR&gl=br&safe=active`;
      const response = await this.httpService.get<SearchResultDto>(url);
      const results = response?.data;

      const items = results.items;

      items.forEach((item, index) => {
        Object.assign(item, { rank: index + startIndex });
      });

      const totalResults = Math.min(Number(results?.searchInformation?.totalResults), MAX_RESULTS);

      return {
        items: items.slice(0, resultsPerPage),
        totalResults: totalResults,
        googlePagesAccessed: 1
      } as QueryResponse;
    } catch (error) {
      console.error(error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to query Google',
        { cause: error },
      );
    }
  }
}

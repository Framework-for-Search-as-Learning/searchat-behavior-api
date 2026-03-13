/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { HttpException, Injectable } from '@nestjs/common';
import { CanceledError } from 'axios';
import pLimit from 'p-limit';
import { QueryResponse, SearchEngineService, SearchResultItem } from 'src/interfaces/search-engine';
import { HttpService } from 'src/modules/http/http.service';

import { SearchResultDto } from '../search-result.dto';
import { BING } from './bing-constants';

type HttpErrorResponse = {
  headers?: Record<string, string>;
};

const checkXFrameOptions = async (url: string, httpService: HttpService, maxAttemps: number = 3, sleep: number = 100, timeout = 3000) => {
  let attempt = 0;

  while (attempt < maxAttemps) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);
    try {
      const response = await httpService.head(url, { signal: abortController.signal });
      const xFrameOptions = response.headers['x-frame-options'] as string || null;
      if (!xFrameOptions) {
        return true;
      }

      return !xFrameOptions.toLowerCase().includes('sameorigin')
        && !xFrameOptions.toLowerCase().includes('deny');
    } catch (error: unknown) {
      console.error(
        `Error checking X-Frame-Options for ${url}:`,
        error instanceof Error ? error.message : error,
      );
      if (error instanceof HttpException && error.getStatus() >= 400) {
        const response = error.getResponse() as HttpErrorResponse;
        const xFrameOptions = response.headers?.['x-frame-options'] || null;
        if (!xFrameOptions) {
          return true;
        }

        return !xFrameOptions.toLowerCase().includes('sameorigin')
          && !xFrameOptions.toLowerCase().includes('deny');
      }

      if (error instanceof CanceledError) {
        console.error('Request aborted due to timeout');
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, sleep));
      attempt++;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return false;
}

const MAX_RESULTS = 100;
const MAX_START_INDEX = 91;
const CONCURRENT_REQUEST_LIMIT = 10;

@Injectable()
export class BingService implements SearchEngineService {
  constructor(
    private readonly httpService: HttpService,
  ) { }

   
  async query(
    query: string,
    startIndex: number = 1,
    resultsPerPage: number = 10,
    _taskId = '',
  ): Promise<QueryResponse> {
    // parameter present for interface compatibility; mark as used so linter stops complaining
    void _taskId;

    return this.queryInternal(query, startIndex, resultsPerPage, []);
  }
  private async queryInternal(
    query: string,
    startIndex: number = 1,
    resultsPerPage: number = 10,
    internalResults: SearchResultItem[] = []
  ): Promise<QueryResponse> {

    try {
      startIndex = Math.min(startIndex, MAX_START_INDEX);

      const result = await this.httpService.get<SearchResultDto>(
        `${BING.URL_BASE}?q=${query}&key=${process.env.BING_API_KEY}&cx=${process.env.BING_CX}&num=${resultsPerPage}&start=${startIndex}`
      );

      const limit = pLimit(CONCURRENT_REQUEST_LIMIT);

      internalResults = [...internalResults, ...(
        (
          await Promise.all(
            result.data?.items?.map(async (item, index) => {
              const isXFrameOptionsValid = await limit(() => checkXFrameOptions(item.link, this.httpService));
              return isXFrameOptionsValid ? { ...item, rank: index + startIndex } : null;
            }) || [])
        ).filter(Boolean))];

      const totalResults = Math.min(Number(result.data?.searchInformation?.totalResults), MAX_RESULTS);

      while (internalResults.length < resultsPerPage && startIndex <= totalResults) {
        const nextPageResults = await this.queryInternal(query, startIndex + resultsPerPage, resultsPerPage, internalResults);
        internalResults = nextPageResults.items;
      }

      return {
        items: internalResults.slice(0, resultsPerPage),
        totalResults: totalResults
      } as QueryResponse;
    } catch (error) {
      console.error(error)
      throw error;
    }
  }
}

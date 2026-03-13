/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { CanceledError } from 'axios';
import type { HttpService } from 'src/modules/http/http.service';

export interface SearchResultItem extends Record<string, unknown> {
  title?: string;
  link?: string;
  snippet?: string;
  rank?: number;
}

export interface QueryResponse {
  items: SearchResultItem[]
  totalResults: number
}

export interface SearchEngineService {
  query(
    query: string,
    startIndex: number,
    resultsPerPage: number,
    taskId: string,
  ): Promise<QueryResponse>;
}


export const checkXFrameOptions = async (url: string, httpService: HttpService, maxAttemps: number = 2, sleep: number = 100, timeout = 2000) => {
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
        && !xFrameOptions.toLowerCase().includes('deny') && !xFrameOptions.toLowerCase().includes('allow-from');
    } catch (error: unknown) {
      if (error instanceof CanceledError) {
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

/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import type { SearchResultItem } from 'src/interfaces/search-engine';

export interface SearchResultDto {
  items: SearchResultItem[];
  queries: Record<string, unknown>;
  searchInformation: Record<string, unknown> & {
    totalResults?: string | number;
  };
}

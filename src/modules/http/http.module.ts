/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Module } from '@nestjs/common';

import { HttpService } from './http.service';

@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule { }

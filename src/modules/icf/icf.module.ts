/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExperimentModule } from '../experiment/experiment.module';
import { Icf } from './entity/icf.entity';
import { IcfController } from './icf.controller';
import { IcfService } from './icf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Icf]),
    forwardRef(() => ExperimentModule),
  ],
  providers: [IcfService],
  controllers: [IcfController],
  exports: [IcfService],
})
export class IcfModule { }

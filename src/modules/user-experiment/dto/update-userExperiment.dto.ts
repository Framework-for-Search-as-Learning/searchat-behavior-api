/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {PartialType} from '@nestjs/swagger';

import {CreateUserExperimentDto} from './create-userExperiment.dto';

export class UpdateUserExperimentDto extends PartialType(
  CreateUserExperimentDto,
) {}

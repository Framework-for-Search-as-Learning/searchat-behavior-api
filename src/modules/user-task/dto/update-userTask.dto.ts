/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {IntersectionType, PartialType} from '@nestjs/swagger';

import {CreateUserTaskDto} from './create-userTask.dto';
import {TimeEditUserTaskDto} from './timeEditUserTaskDTO';

export class UpdateUserTaskDto extends PartialType(
  IntersectionType(CreateUserTaskDto, TimeEditUserTaskDto),
) {}

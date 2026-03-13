/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {PartialType} from '@nestjs/swagger';

import {CreateTaskDto} from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

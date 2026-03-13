/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {OmitType, PartialType} from '@nestjs/swagger';

import {CreateUserDto} from './create-user.dto';

class UpdateUserBaseDto extends OmitType(CreateUserDto, [
  'password',
] as const) {}

export class UpdateUserDto extends PartialType(UpdateUserBaseDto) {}

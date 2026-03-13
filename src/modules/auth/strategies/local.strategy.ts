/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import dotenv from 'dotenv';
import { Strategy } from 'passport-local';

import { User } from '../../user/entity/user.entity';
import { AuthService } from '../auth.service';
dotenv.config();

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<User | null> {
    return await this.authService.validateUserCredentials(
      username,
      password,
    );
  }
}

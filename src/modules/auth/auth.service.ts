/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    try {
      return await this.userService.findByEmailAndPassword({
        email,
        password,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw error;
    }
  }

  async loginWithCredentials(user: User) {
    const payload = { email: user.email };
    return {
      id: user._id,
      email: user.email,
      researcher: user.researcher,
      name: user.name,
      lastName: user.lastName,
      accessToken: this.jwtService.sign(payload),
      expiredAt: Date.now() + 60000,
    };
  }
}

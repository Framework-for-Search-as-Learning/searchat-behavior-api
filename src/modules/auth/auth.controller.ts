/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ErrorResponseDto } from 'src/common/dto/api-responses.dto';

import { User } from '../user/entity/user.entity';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Validates credentials and returns a JWT access token.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'StrongPassword123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful with JWT token.',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.', type: ErrorResponseDto })
  async login(@Req() req: Request & { user: User }) {
    return this.authService.loginWithCredentials(req.user);
  }
}

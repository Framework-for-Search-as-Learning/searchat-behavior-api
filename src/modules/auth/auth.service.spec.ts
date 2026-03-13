/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    _id: '123',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'John',
    lastName: 'Doe',
    researcher: true,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmailAndPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  describe('validateUserCredentials', () => {
    it('should return user when credentials are valid', async () => {
      userService.findByEmailAndPassword.mockResolvedValue(mockUser);
      const result = await service.validateUserCredentials('test@example.com', 'password');
      expect(result).toEqual(mockUser);
      expect(userService.findByEmailAndPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      userService.findByEmailAndPassword.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );
      await expect(
        service.validateUserCredentials('test@example.com', 'wrong_password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Database error');
      userService.findByEmailAndPassword.mockRejectedValue(error);
      await expect(
        service.validateUserCredentials('test@example.com', 'password'),
      ).rejects.toThrow(error);
    });
  });

  describe('loginWithCredentials', () => {
    it('should return login response with access token and user data', async () => {
      const result = await service.loginWithCredentials(mockUser);
      expect(result).toMatchObject({
        id: mockUser._id,
        email: mockUser.email,
        researcher: mockUser.researcher,
        name: mockUser.name,
        lastName: mockUser.lastName,
        accessToken: 'mock_token',
      });
      expect(result.expiredAt).toBeGreaterThan(Date.now());
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email });
    });

    it('should set expiredAt to approximately 60 seconds from now', async () => {
      const before = Date.now();
      const result = await service.loginWithCredentials(mockUser);
      const after = Date.now();
      expect(result.expiredAt).toBeGreaterThanOrEqual(before + 60000);
      expect(result.expiredAt).toBeLessThanOrEqual(after + 60000);
    });
  });
});
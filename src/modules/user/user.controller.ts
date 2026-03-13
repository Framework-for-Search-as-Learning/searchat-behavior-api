/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ErrorResponseDto,
  MessageResponseDto,
} from 'src/common/dto/api-responses.dto';
import {
  ForgotPasswordDto,
  GetRecoveryPasswordDto,
  GetUserDto,
  ResetPasswordDto,
} from 'src/modules/user/dto/user.dto';

import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {UpdatePasswordDto} from './dto/updatePassword.dto';
import {UserService} from './user.service';

@ApiTags('User')
@ApiExtraModels(GetUserDto, ErrorResponseDto, MessageResponseDto)
@Controller('user')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Post('forgot-password')
  @ApiOperation({summary: 'Request password recovery'})
  @ApiBody({type: ForgotPasswordDto})
  @ApiResponse({
    status: 200,
    description: 'Recovery email sent if user exists.',
    type: MessageResponseDto,
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    await this._userService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({summary: 'Reset a user’s password'})
  @ApiBody({type: ResetPasswordDto})
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or expired.',
    type: ErrorResponseDto,
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
      await this._userService.resetPassword(resetPasswordDto);
  }

  @Post()
  @ApiOperation({summary: 'Create a new user'})
  @ApiBody({type: CreateUserDto})
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: GetUserDto,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<GetUserDto> {
    createUserDto.name = createUserDto.name.trim();
    createUserDto.lastName = createUserDto.lastName.trim();
    createUserDto.email = createUserDto.email.trim();
    const userDto = await this._userService.create(createUserDto);
    return {
      id: userDto._id,
      name: userDto.name,
      lastName: userDto.lastName,
      email: userDto.email,
      researcher: userDto.researcher,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({summary: 'Get all users'})
  @ApiBearerAuth('jwt')
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter users by email',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users or a single user when filtered by email.',
    schema: {
      oneOf: [
        {type: 'array', items: {$ref: getSchemaPath(GetUserDto)}},
        {$ref: getSchemaPath(GetUserDto)},
        {$ref: getSchemaPath(ErrorResponseDto)},
      ],
    },
  })
  async findAll(
    @Query('email') email: string,
  ): Promise<
    | GetUserDto[]
    | GetUserDto
    | {data?: unknown; error?: string; statusCode?: number}
  > {
    if (email) {
      try {
        const user = await this._userService.findOneByEmail(email);
        return {
          id: user._id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          researcher: user.researcher,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {error: 'User not found', statusCode: 404};
        } else {
          throw error;
        }
      }
    }
    const users = await this._userService.findAll();
    return users.map((user) => {
      return {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        researcher: user.researcher,
      };
    });

  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({summary: 'Get a user by ID'})
  @ApiBearerAuth('jwt')
  @ApiParam({name: 'id', type: String, description: 'User ID'})
  @ApiResponse({status: 200, description: 'User details.', type: GetUserDto})
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<GetUserDto> {
    const user = await this._userService.findOne(id);
    return {
      id: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      researcher: user.researcher,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({summary: "Update a user's data"})
  @ApiBearerAuth('jwt')
  @ApiParam({name: 'id', type: String, description: 'User ID'})
  @ApiBody({type: UpdateUserDto})
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: GetUserDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<GetUserDto> {
    const userDto = await this._userService.update(id, updateUserDto);
    return {
      id: userDto._id,
      name: userDto.name,
      lastName: userDto.lastName,
      email: userDto.email,
      researcher: userDto.researcher,
    };
  }

  @Patch(':id/password')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({summary: "Update a user's password"})
  @ApiBearerAuth('jwt')
  @ApiParam({name: 'id', type: String, description: 'User ID'})
  @ApiBody({type: UpdatePasswordDto})
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully.',
    type: GetUserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Current password is invalid.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Senha atual inválida',
        error: 'Unauthorized',
      },
    },
  })
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<GetUserDto> {
    const userDto = await this._userService.updatePassword(
      id,
      updatePasswordDto,
    );
    return {
      id: userDto._id,
      name: userDto.name,
      lastName: userDto.lastName,
      email: userDto.email,
      researcher: userDto.researcher,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({summary: 'Delete a user'})
  @ApiBearerAuth('jwt')
  @ApiParam({name: 'id', type: String, description: 'User ID'})
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
    type: GetUserDto,
  })
  async remove(@Param('id') id: string) {
    return await this._userService.remove(id);
  }

  @Patch()
  @ApiOperation({summary: 'Add password recovery token'})
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'User email to send the token',
  })
  @ApiResponse({
    status: 200,
    description: 'Recovery token created and stored.',
    type: GetRecoveryPasswordDto,
  })
  async addChangesPasswordToken(
    @Query('email') email: string,
  ): Promise<GetRecoveryPasswordDto> {
    const user = await this._userService.addChangesPasswordToken(email);
    return {
      id: user._id,
      recoveryPasswordToken: user.recoveryPasswordToken,
      recoveryPasswordTokenExpirationDate:
        user.recoveryPasswordTokenExpirationDate,
    };
  }
}

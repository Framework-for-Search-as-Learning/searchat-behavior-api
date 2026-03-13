/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from 'src/modules/user/dto/user.dto';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { User } from './entity/user.entity';

const HOUR_1 = 3600000;
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) { }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    try {
      const user = await this.findOneByEmail(email);
      user.recoveryPasswordToken = crypto.randomBytes(20).toString('hex');
      user.recoveryPasswordTokenExpirationDate = new Date(Date.now() + HOUR_1);
      await this.userRepository.update(user._id, {
        recoveryPasswordToken: user.recoveryPasswordToken,
        recoveryPasswordTokenExpirationDate: user.recoveryPasswordTokenExpirationDate,
      });
      await this.sendResetPasswordEmail(user.email, user.recoveryPasswordToken);
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, 500);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    try {
      const user = await this.findOneByEmail(resetPasswordDto.email);
      if (
        user.recoveryPasswordToken &&
        user.recoveryPasswordToken !== resetPasswordDto.token
      ) {
        throw new Error('Token inválido');
      }
      if (user.recoveryPasswordTokenExpirationDate < new Date()) {
        throw new Error('Token expirado');
      }
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
      await this.userRepository.update(user._id, {
        password: hashedPassword,
        recoveryPasswordToken: null,
        recoveryPasswordTokenExpirationDate: null,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { name, lastName, email, password, researcher } = createUserDto;
      const hashedPassword = await bcrypt.hash(password, 10);
      const userSaved = await this.userRepository.save({
        name,
        lastName,
        email,
        password: hashedPassword,
        researcher: researcher,
      });
      return userSaved;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { _id: id } });
      if (!user) {
        throw new NotFoundException(
          `Não foi possível encontrar usuário com id: ${id}`,
        );
      }
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException(
          `Não foi possível encontrar usuário com email: ${email}`,
        );
      }
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async addChangesPasswordToken(email: string): Promise<User> {
    const user = await this.findOneByEmail(email);
    const token = crypto.randomBytes(32).toString('hex');
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30);
    await this.userRepository.update(user._id, {
      recoveryPasswordToken: token,
      recoveryPasswordTokenExpirationDate: expirationDate,
    });
    return await this.findOne(user._id);
  }
  async findByEmailAndPassword({ email, password }): Promise<User> {
    const user = await this.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException();

  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update({ _id: id }, updateUserDto);
    const result = await this.findOne(id);
    return result;

  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const user = await this.findOne(id);
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual inválida');
    }
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await this.userRepository.update({ _id: id }, { password: hashedPassword });
    return await this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.delete({ _id: id });
    return user;
  }
  async removeAll() {
    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .delete()
        .from(User)
        .execute();

      return { n: result.affected || 0 };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  private async sendResetPasswordEmail(
    email: string,
    token: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: process.env.MY_GMAIL_EMAIL,
      subject: 'Alteração de Senha plataforma Searchat Behavior',
      text: `Por favor, acesse o link a seguir para restaurar sua senha: https://buscandoeaprendendo.onrender.com/reset-password?token=${token}&email=${email}`,
      html: `Por favor, acesse o link a seguir para restaurar sua senha: <a href='https://buscandoeaprendendo.onrender.com/reset-password?token=${token}&email=${email}'>https://buscandoeaprendendo.onrender.com/reset-password?token=${token}</a>`,
    });
  }
}

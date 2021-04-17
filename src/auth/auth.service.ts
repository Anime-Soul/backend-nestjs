import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import User from 'src/entity/User';
import { JWT_USER_INFO } from '../type';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  hashUserPwd(password: string) {
    return crypto
      .createHmac('sha512', process.env.PWD_SOAT)
      .update(password + process.env.PWD_SOAT);
  }

  validateUserPwd(password: string, hashPassword: string): boolean {
    return hashPassword === this.hashUserPwd(password).digest('hex');
  }

  certificate(user: User) {
    const payload: JWT_USER_INFO = {
      email: user.email,
      userId: user.id,
      username: user.username,
      role: user.roleLevel,
      status: user.status,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    return token;
  }
}

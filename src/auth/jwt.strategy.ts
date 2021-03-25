import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWT_USER_INFO } from '../type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JWT_USER_INFO): Promise<JWT_USER_INFO> {
    if (!payload) throw new UnauthorizedException();

    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      status: payload.status,
    };
  }
}

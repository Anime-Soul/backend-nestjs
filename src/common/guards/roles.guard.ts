import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isNumber } from 'class-validator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const exroles = this.reflector.get<string[]>(
      'exroles',
      context.getHandler(),
    );
    if (!roles && !exroles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    let hasRole = false;
    if (roles) {
      hasRole = roles.includes(user.role);
    }
    if (exroles) {
      hasRole = !exroles.includes(user.role);
    }
    console.log('RolesGuard', roles, exroles, user.role);

    return user && isNumber(user.role) && hasRole;
  }
}

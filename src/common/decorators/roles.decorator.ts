import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: number[]) => SetMetadata('roles', roles);
export const ExRoles = (roles: number[]) => SetMetadata('exroles', roles);

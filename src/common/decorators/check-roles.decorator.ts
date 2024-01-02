import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '@/entities/user.entity';

import { ApiErrorMessage } from '../constants/api-error-message.constant';
import APIError from '../exceptions/api-error.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userRoles = request.user?.role || [];

    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw APIError.fromMessage(ApiErrorMessage.UNAUTHORIZED);
    }

    return true;
  }
}

export const CheckRoles = (...roles: UserRole[]) =>
  applyDecorators(SetMetadata('roles', roles), UseGuards(RolesGuard));

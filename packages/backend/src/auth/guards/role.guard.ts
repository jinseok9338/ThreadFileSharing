import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CompanyRole } from '../../user/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Role Guard - Company role-based authorization
 * - Checks if user has required company role (Owner, Admin, Member)
 * - Works with @Roles() decorator
 * - Hierarchical: Owner > Admin > Member
 *
 * Usage:
 * @Roles(CompanyRole.ADMIN, CompanyRole.OWNER)
 * @UseGuards(JwtAuthGuard, RoleGuard)
 *
 * Assumes:
 * - JwtAuthGuard has already attached user to request
 * - User object has companyRole property
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<CompanyRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => user.companyRole === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

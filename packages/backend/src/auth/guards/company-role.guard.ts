import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CompanyRole } from '../../constants/permissions';
import { hasCompanyRole } from '../../constants/permissions';

/**
 * Company Role Guard
 * Validates that the authenticated user has the required company role
 */
@Injectable()
export class CompanyRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<CompanyRole[]>(
      'company_roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'USER_NOT_AUTHENTICATED',
        message: 'User not authenticated',
      });
    }

    const userRole = user.companyRole;

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some((role) =>
      hasCompanyRole(userRole, role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_COMPANY_ROLE',
        message: `Required company role: ${requiredRoles.join(' or ')}. Current role: ${userRole}`,
        data: {
          required: requiredRoles,
          current: userRole,
        },
      });
    }

    return true;
  }
}

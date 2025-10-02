import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThreadRole } from '../../constants/permissions';
import { hasThreadRole } from '../../constants/permissions';

/**
 * Thread Role Guard
 * Validates that the authenticated user has the required thread role
 * Requires threadId in route parameters or request body
 */
@Injectable()
export class ThreadRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ThreadRole[]>(
      'thread_roles',
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

    // Get threadId from route parameters or request body
    const threadId = request.params?.threadId || request.body?.threadId;

    if (!threadId) {
      throw new NotFoundException({
        code: 'THREAD_NOT_FOUND',
        message: 'Thread ID not provided',
      });
    }

    // Get user's thread role from request context
    // This should be populated by middleware or service
    const userThreadRole = request.userThreadRole;

    if (!userThreadRole) {
      throw new ForbiddenException({
        code: 'THREAD_ACCESS_DENIED',
        message: 'User does not have access to this thread',
      });
    }

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some((role) =>
      hasThreadRole(userThreadRole, role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_THREAD_ROLE',
        message: `Required thread role: ${requiredRoles.join(' or ')}. Current role: ${userThreadRole}`,
        data: {
          required: requiredRoles,
          current: userThreadRole,
          threadId,
        },
      });
    }

    return true;
  }
}


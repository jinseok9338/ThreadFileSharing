import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Company Guard - Multi-tenancy enforcement
 * - Ensures users can only access resources within their company
 * - Compares request.user.companyId with resource's company_id
 * - Prevents cross-company data access
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, CompanyGuard)
 *
 * Assumes:
 * - JwtAuthGuard has already attached user to request
 * - Resource has companyId in params or body
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Extract companyId from various sources
    const resourceCompanyId =
      request.params?.companyId ||
      request.body?.companyId ||
      request.query?.companyId;

    // If no companyId is specified in request, use user's company
    if (!resourceCompanyId) {
      return true;
    }

    // Check if user belongs to the requested company
    if (user.companyId !== resourceCompanyId) {
      throw new ForbiddenException(
        'You do not have access to this company resource',
      );
    }

    return true;
  }
}

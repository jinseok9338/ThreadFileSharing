import { SetMetadata } from '@nestjs/common';
import { CompanyRole } from '../../user/entities/user.entity';
import { ROLES_KEY } from '../guards/role.guard';

/**
 * Roles Decorator
 * - Sets metadata for required company roles
 * - Used with RoleGuard to enforce role-based access
 *
 * Usage:
 * @Roles(CompanyRole.ADMIN, CompanyRole.OWNER)
 * @UseGuards(JwtAuthGuard, RoleGuard)
 * @Delete(':id')
 * deleteUser(@Param('id') id: string) {
 *   // Only admins and owners can access
 * }
 */
export const Roles = (...roles: CompanyRole[]) => SetMetadata(ROLES_KEY, roles);

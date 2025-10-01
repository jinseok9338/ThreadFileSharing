import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public Decorator
 * - Marks endpoints that don't require authentication
 * - Bypasses JwtAuthGuard when used globally
 *
 * Usage:
 * @Public()
 * @Post('register')
 * register(@Body() dto: RegisterDto) {
 *   // No authentication required
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

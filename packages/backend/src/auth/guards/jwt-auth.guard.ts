import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * - Validates JWT token from Authorization header
 * - Attaches user data to request object
 * - Used for protecting endpoints that require authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

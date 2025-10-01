import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { ApiSuccessResponse } from '../common/decorators';

@ApiTags('Authentication')
@ApiExtraModels(AuthResponseDto, UserResponseDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Register new user and create company
   * - Creates company with user as owner
   * - Returns user, company, and JWT tokens
   * Public endpoint (no auth required)
   */
  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new user and create company' })
  @ApiSuccessResponse(AuthResponseDto, {
    status: 201,
    description: 'User and company created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Login with email and password
   * - Validates credentials
   * - Checks account lock status
   * - Returns user, company, and JWT tokens
   * Public endpoint (no auth required)
   */
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiSuccessResponse(AuthResponseDto, { description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 423, description: 'Account locked' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   * - Validates refresh token
   * - Generates new access and refresh tokens (rotation)
   * - Revokes old refresh token
   * Public endpoint (no auth required)
   */
  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New tokens generated',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Logout user and revoke refresh token
   * - Marks refresh token as revoked
   * - Prevents token reuse
   * Requires: Authentication
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Body() logoutDto: RefreshTokenDto) {
    return this.authService.logout(logoutDto.refreshToken);
  }

  /**
   * GET /auth/me
   * Get current authenticated user info
   * - Quick endpoint to verify authentication
   * Requires: Authentication
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiSuccessResponse(UserResponseDto, { description: 'Current user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: any) {
    return UserResponseDto.fromEntity(user);
  }
}

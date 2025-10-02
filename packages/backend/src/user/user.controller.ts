import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CompanyRole } from '../constants/permissions';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { MessageData } from '../common/dto';
import { ApiSuccessResponse } from '../common/decorators';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiExtraModels(UserResponseDto, MessageData)
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /users/me
   * Get current user's profile
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiSuccessResponse(UserResponseDto, { description: 'User profile' })
  async getMe(@CurrentUser() user: User) {
    const fullUser = await this.userService.findById(user.id);
    return UserResponseDto.fromEntity(fullUser);
  }

  /**
   * PUT /users/me
   * Update current user's profile
   */
  @Put('me')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiSuccessResponse(UserResponseDto, { description: 'Updated user' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.userService.updateProfile(
      user.id,
      updateDto,
    );
    return UserResponseDto.fromEntity(updatedUser);
  }

  /**
   * PUT /users/me/password
   * Change current user's password
   */
  @Put('me/password')
  @ApiOperation({ summary: 'Change password' })
  @ApiSuccessResponse(MessageData, { description: 'Password changed' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(user.id, changePasswordDto);
    return new MessageData('Password changed successfully');
  }

  /**
   * PUT /users/:userId/role
   * Update user's company role
   * Requires: Admin or Owner role
   */
  @Put(':userId/role')
  @UseGuards(RoleGuard)
  @Roles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @ApiOperation({ summary: 'Update user role' })
  @ApiSuccessResponse(UserResponseDto, { description: 'User role updated' })
  async updateUserRole(
    @CurrentUser() user: User,
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const updatedUser = await this.userService.updateRole(
      userId,
      updateRoleDto,
      user.id,
    );
    return UserResponseDto.fromEntity(updatedUser);
  }

  /**
   * DELETE /users/:userId
   * Deactivate user account
   * Requires: Admin or Owner role
   */
  @Delete(':userId')
  @UseGuards(RoleGuard)
  @Roles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiSuccessResponse(MessageData, { description: 'User deactivated' })
  async deactivateUser(
    @CurrentUser() user: User,
    @Param('userId') userId: string,
  ) {
    await this.userService.deactivateAccount(userId);
    return new MessageData('User deactivated successfully');
  }
}

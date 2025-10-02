import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { CompanyRole } from '../constants/permissions';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

interface UpdateProfileDto {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

interface UpdateRoleDto {
  role: CompanyRole;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Find user by ID
   * - Includes company relation
   * - Returns active users only
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
      relations: ['company'],
    });
  }

  /**
   * Update user profile
   * - Username, full name, avatar URL
   * - Cannot change email or role
   */
  async updateProfile(
    userId: string,
    updateDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    // Update allowed fields only
    if (updateDto.username !== undefined) {
      user.username = updateDto.username;
    }
    if (updateDto.full_name !== undefined) {
      user.fullName = updateDto.full_name;
    }
    if (updateDto.avatar_url !== undefined) {
      user.avatarUrl = updateDto.avatar_url;
    }

    await this.userRepository.save(user);
    return this.findById(userId);
  }

  /**
   * Change user password
   * - Validates current password
   * - Hashes new password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findById(userId);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      12,
    );

    await this.userRepository.update(
      { id: userId },
      { password: newPasswordHash },
    );
  }

  /**
   * Update user's company role
   * - Only Owner or Admin can update roles
   * - Cannot change Owner role
   */
  async updateRole(
    targetUserId: string,
    updateRoleDto: UpdateRoleDto,
    requestingUserId: string,
  ): Promise<User> {
    const targetUser = await this.findById(targetUserId);
    const requestingUser = await this.findById(requestingUserId);

    // Ensure both users are in same company
    if (targetUser.companyId !== requestingUser.companyId) {
      throw new ForbiddenException('Cannot modify users from other companies');
    }

    // Cannot change owner role
    if (targetUser.companyRole === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot change company owner role');
    }

    // Cannot promote to owner
    if (updateRoleDto.role === CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Cannot promote user to owner. Transfer ownership instead.',
      );
    }

    await this.userRepository.update(
      { id: targetUserId },
      { companyRole: updateRoleDto.role },
    );

    return this.findById(targetUserId);
  }

  /**
   * Deactivate user account
   * - Sets is_active to false
   * - User cannot login but data is preserved
   */
  async deactivateAccount(userId: string): Promise<void> {
    const user = await this.findById(userId);

    if (user.companyRole === CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Cannot deactivate company owner. Transfer ownership first.',
      );
    }

    await this.userRepository.update({ id: userId }, { isActive: false });
  }

  /**
   * Get all members by company ID
   */
  async getMembersByCompany(companyId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { companyId: companyId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Remove sensitive data from user object
   */
  sanitizeUser(user: User) {
    const { password, failedLoginAttempts, lockedUntil, ...sanitized } = user;
    return sanitized;
  }
}

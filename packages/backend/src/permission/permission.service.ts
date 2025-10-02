import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ThreadParticipant } from '../thread/entities/thread-participant.entity';
import { CompanyRole, ThreadRole, AccessType } from '../constants/permissions';
import {
  hasCompanyRole,
  hasThreadRole,
  COMPANY_PERMISSIONS,
  THREAD_PERMISSIONS,
} from '../constants/permissions';

/**
 * Permission Service
 * Centralized permission validation logic
 */
@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ThreadParticipant)
    private threadParticipantRepository: Repository<ThreadParticipant>,
  ) {}

  /**
   * Check if user has company-level permission
   */
  async hasCompanyPermission(
    userId: string,
    permission: keyof typeof COMPANY_PERMISSIONS,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return false;
    }

    const userRole = user.companyRole;
    const requiredRoles = COMPANY_PERMISSIONS[permission];

    return requiredRoles.some((role) => hasCompanyRole(userRole, role));
  }

  /**
   * Check if user has thread-level permission
   */
  async hasThreadPermission(
    userId: string,
    threadId: string,
    permission: keyof typeof THREAD_PERMISSIONS,
  ): Promise<boolean> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    if (!participant) {
      return false;
    }

    const userRole = participant.threadRole;
    const requiredRoles = THREAD_PERMISSIONS[permission];

    return requiredRoles.some((role) => hasThreadRole(userRole, role));
  }

  /**
   * Check if user can access thread (either as member or shared)
   */
  async canAccessThread(userId: string, threadId: string): Promise<boolean> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    return !!participant;
  }

  /**
   * Get user's thread role
   */
  async getUserThreadRole(
    userId: string,
    threadId: string,
  ): Promise<ThreadRole | null> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    return participant?.threadRole || null;
  }

  /**
   * Get user's access type for thread
   */
  async getUserThreadAccessType(
    userId: string,
    threadId: string,
  ): Promise<AccessType | null> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    return participant?.accessType || null;
  }

  /**
   * Check if user can share thread with others
   */
  async canShareThread(userId: string, threadId: string): Promise<boolean> {
    return this.hasThreadPermission(userId, threadId, 'SEND_MESSAGES');
  }

  /**
   * Check if user can upload files to thread
   */
  async canUploadFiles(userId: string, threadId: string): Promise<boolean> {
    return this.hasThreadPermission(userId, threadId, 'UPLOAD_FILES');
  }

  /**
   * Check if user can view files in thread
   */
  async canViewFiles(userId: string, threadId: string): Promise<boolean> {
    return this.hasThreadPermission(userId, threadId, 'VIEW_FILES');
  }

  /**
   * Check if user can delete files from thread
   */
  async canDeleteFiles(userId: string, threadId: string): Promise<boolean> {
    return this.hasThreadPermission(userId, threadId, 'DELETE_FILES');
  }

  /**
   * Check if user can create chatrooms
   */
  async canCreateChatroom(userId: string): Promise<boolean> {
    return this.hasCompanyPermission(userId, 'CREATE_CHATROOM');
  }

  /**
   * Check if user can manage company users
   */
  async canManageUsers(userId: string): Promise<boolean> {
    return this.hasCompanyPermission(userId, 'MANAGE_USERS');
  }

  /**
   * Check if user can access company settings
   */
  async canAccessCompanySettings(userId: string): Promise<boolean> {
    return this.hasCompanyPermission(userId, 'COMPANY_SETTINGS');
  }
}


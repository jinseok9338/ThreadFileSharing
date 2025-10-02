import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThreadParticipant } from '../thread/entities/thread-participant.entity';
import { AccessType } from '../constants/permissions';
import { isMemberAccess, isSharedAccess } from '../constants/permissions';

/**
 * Access Type Service
 * Manages MEMBER vs SHARED access types for thread participants
 */
@Injectable()
export class AccessTypeService {
  constructor(
    @InjectRepository(ThreadParticipant)
    private threadParticipantRepository: Repository<ThreadParticipant>,
  ) {}

  /**
   * Check if user has member access to thread
   */
  async hasMemberAccess(userId: string, threadId: string): Promise<boolean> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    if (!participant) {
      return false;
    }

    return isMemberAccess(participant.accessType);
  }

  /**
   * Check if user has shared access to thread
   */
  async hasSharedAccess(userId: string, threadId: string): Promise<boolean> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    if (!participant) {
      return false;
    }

    return isSharedAccess(participant.accessType);
  }

  /**
   * Get access type for user in thread
   */
  async getAccessType(
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
   * Check if user can access thread content based on access type
   */
  async canAccessThreadContent(
    userId: string,
    threadId: string,
  ): Promise<boolean> {
    const accessType = await this.getAccessType(userId, threadId);
    return accessType !== null;
  }

  /**
   * Check if user can modify thread based on access type
   */
  async canModifyThread(userId: string, threadId: string): Promise<boolean> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    if (!participant) {
      return false;
    }

    // Only members can modify thread content
    // Shared users have read-only access
    return (
      isMemberAccess(participant.accessType) &&
      (participant.threadRole === 'owner' ||
        participant.threadRole === 'member')
    );
  }

  /**
   * Check if user can share thread with others
   */
  async canShareThread(userId: string, threadId: string): Promise<boolean> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    if (!participant) {
      return false;
    }

    // Only thread members can share the thread
    return (
      isMemberAccess(participant.accessType) &&
      (participant.threadRole === 'owner' ||
        participant.threadRole === 'member')
    );
  }

  /**
   * Check if user can invite others to thread
   */
  async canInviteToThread(userId: string, threadId: string): Promise<boolean> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    if (!participant) {
      return false;
    }

    // Only thread owners can invite others
    return (
      isMemberAccess(participant.accessType) &&
      participant.threadRole === 'owner'
    );
  }

  /**
   * Get all shared participants for a thread
   */
  async getSharedParticipants(threadId: string) {
    return this.threadParticipantRepository.find({
      where: {
        threadId,
        accessType: AccessType.SHARED,
      },
      relations: ['user'],
    });
  }

  /**
   * Get all member participants for a thread
   */
  async getMemberParticipants(threadId: string) {
    return this.threadParticipantRepository.find({
      where: {
        threadId,
        accessType: AccessType.MEMBER,
      },
      relations: ['user'],
    });
  }

  /**
   * Check if user was shared the thread by another user
   */
  async wasSharedBy(
    userId: string,
    threadId: string,
    sharedByUserId: string,
  ): Promise<boolean> {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
        sharedByUserId,
        accessType: AccessType.SHARED,
      },
    });

    return !!participant;
  }

  /**
   * Get sharing information for a shared participant
   */
  async getSharingInfo(userId: string, threadId: string) {
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
        accessType: AccessType.SHARED,
      },
    });

    if (!participant) {
      return null;
    }

    return {
      sharedByUserId: participant.sharedByUserId,
      sharedByUsername: participant.sharedByUsername,
      sharedAt: participant.sharedAt,
      threadRole: participant.threadRole,
    };
  }

  /**
   * Validate access type transition
   */
  validateAccessTypeTransition(
    currentType: AccessType,
    newType: AccessType,
  ): boolean {
    // Can always transition from SHARED to MEMBER (invitation acceptance)
    if (currentType === AccessType.SHARED && newType === AccessType.MEMBER) {
      return true;
    }

    // Cannot transition from MEMBER to SHARED (would lose permissions)
    if (currentType === AccessType.MEMBER && newType === AccessType.SHARED) {
      return false;
    }

    // No change
    return currentType === newType;
  }
}


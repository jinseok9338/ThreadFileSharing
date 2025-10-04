import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { CursorPaginationQueryDto } from '../common/dto';
import { CursorBasedData } from '../common/dto/api-response.dto';
import { Thread } from './entities/thread.entity';
import { ThreadParticipant } from './entities/thread-participant.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ThreadResponseDto } from './dto/thread-response.dto';
import { ChatRoomService } from '../chatroom/chatroom.service';
import { PermissionService } from '../permission/permission.service';
import { AccessType, ThreadRole } from '../constants/permissions';

@Injectable()
export class ThreadService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
    @InjectRepository(ThreadParticipant)
    private readonly threadParticipantRepository: Repository<ThreadParticipant>,
    private readonly chatRoomService: ChatRoomService,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Create a new thread
   */
  async createThread(
    createThreadDto: CreateThreadDto,
    userId: string,
  ): Promise<ThreadResponseDto> {
    // Check if user is member of the chatroom
    const isMember = await this.chatRoomService.isUserMemberOfChatRoom(
      userId,
      createThreadDto.chatroomId,
    );

    if (!isMember) {
      throw new ForbiddenException('User is not a member of this chatroom');
    }

    // Validate required fields
    if (!createThreadDto.title?.trim()) {
      throw new BadRequestException('Thread title is required');
    }

    // Create thread
    const thread = this.threadRepository.create({
      ...createThreadDto,
      createdBy: userId,
      participantCount: 1, // Creator is automatically a participant
    });

    const savedThread = await this.threadRepository.save(thread);

    // Add creator as participant with owner role
    const threadParticipant = this.threadParticipantRepository.create({
      threadId: savedThread.id,
      userId: userId,
      threadRole: ThreadRole.OWNER,
      accessType: AccessType.MEMBER,
    });

    await this.threadParticipantRepository.save(threadParticipant);

    return this.toThreadResponseDto(savedThread);
  }

  /**
   * Get threads for a chatroom with cursor-based pagination
   */
  async getThreadsByChatRoom(
    chatroomId: string,
    query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<ThreadResponseDto>> {
    const { limit = 20, lastIndex } = query;

    // Build where condition for cursor-based pagination
    const whereCondition: { chatroomId: string; createdAt?: any } = {
      chatroomId,
    };
    if (lastIndex) {
      // Parse lastIndex as ISO date string and use it for cursor
      const lastDate = new Date(lastIndex);
      whereCondition.createdAt = MoreThan(lastDate);
    }

    // Fetch one more item than requested to determine hasNext
    const threads = await this.threadRepository.find({
      where: whereCondition,
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
      take: limit + 1,
    });

    const hasNext = threads.length > limit;
    const items = hasNext ? threads.slice(0, limit) : threads;

    // Convert to DTOs
    const threadDtos = items.map((thread) => this.toThreadResponseDto(thread));

    // Get nextIndex from the last item's createdAt if there's a next page
    const nextIndex =
      hasNext && items.length > 0
        ? items[items.length - 1].createdAt.toISOString()
        : undefined;

    return new CursorBasedData(threadDtos, hasNext, limit, nextIndex);
  }

  /**
   * Get thread by ID
   */
  async getThreadById(
    id: string,
    userId?: string,
  ): Promise<ThreadResponseDto | null> {
    const thread = await this.threadRepository.findOne({
      where: { id },
    });

    if (!thread) {
      return null;
    }

    // If userId is provided, check participation
    if (userId) {
      const isParticipant = await this.isUserParticipantInThread(userId, id);
      if (!isParticipant) {
        throw new ForbiddenException('Access denied to thread');
      }
    }

    return this.toThreadResponseDto(thread);
  }

  /**
   * Check if user can access thread
   */
  async canUserAccessThread(
    userId: string,
    threadId: string,
  ): Promise<boolean> {
    return this.permissionService.canAccessThread(userId, threadId);
  }

  /**
   * Check if user is participant in thread
   */
  async isUserParticipantInThread(
    userId: string,
    threadId: string,
  ): Promise<boolean> {
    const participant = await this.threadParticipantRepository.findOne({
      where: { userId, threadId },
    });
    return !!participant;
  }

  /**
   * Delete thread (soft delete)
   */
  async deleteThread(threadId: string, userId: string): Promise<void> {
    const thread = await this.getThreadById(threadId);

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Validate ownership or admin permissions
    const hasPermission =
      thread.createdBy === userId ||
      (await this.permissionService.hasThreadPermission(
        userId,
        threadId,
        'DELETE_THREAD',
      ));

    if (!hasPermission) {
      throw new ForbiddenException(
        'You can only delete threads you created or have admin permissions',
      );
    }

    await this.threadRepository.softDelete(threadId);
  }

  /**
   * Add participant to thread
   */
  async addParticipant(
    threadId: string,
    userId: string,
    requesterId: string,
  ): Promise<void> {
    // Validate access
    await this.getThreadById(threadId, requesterId);

    // Check if participant already exists
    const existingParticipant = await this.threadParticipantRepository.findOne({
      where: { threadId, userId },
    });

    if (existingParticipant) {
      throw new BadRequestException(
        'User is already a participant of this thread',
      );
    }

    // Add participant
    const participant = this.threadParticipantRepository.create({
      threadId,
      userId,
      threadRole: ThreadRole.MEMBER,
    });

    await this.threadParticipantRepository.save(participant);

    // Update participant count
    await this.threadRepository.increment(
      { id: threadId },
      'participantCount',
      1,
    );
  }

  /**
   * Remove participant from thread
   */
  async removeParticipant(
    threadId: string,
    userId: string,
    requesterId: string,
  ): Promise<void> {
    // Validate access
    await this.getThreadById(threadId, requesterId);

    // Remove participant
    await this.threadParticipantRepository.delete({
      threadId,
      userId,
    });

    // Update participant count
    await this.threadRepository.decrement(
      { id: threadId },
      'participantCount',
      1,
    );
  }

  /**
   * Convert Thread entity to ThreadResponseDto
   */
  private toThreadResponseDto(thread: Thread): ThreadResponseDto {
    return {
      id: thread.id,
      chatroomId: thread.chatroomId,
      title: thread.title,
      description: thread.description,
      createdBy: thread.createdBy,
      creator: thread.creator
        ? {
            id: thread.creator.id,
            username: thread.creator.username,
            fullName: thread.creator.fullName,
            avatarUrl: thread.creator.avatarUrl,
          }
        : undefined,
      isArchived: thread.isArchived,
      participantCount: thread.participantCount,
      fileCount: thread.fileCount,
      lastMessageAt: thread.lastMessageAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    };
  }

  /**
   * Add user to thread
   */
  async addUserToThread(
    userId: string,
    threadId: string,
    threadRole: ThreadRole = ThreadRole.MEMBER,
  ): Promise<void> {
    const existingParticipant = await this.threadParticipantRepository.findOne({
      where: {
        userId,
        threadId,
      },
    });

    if (existingParticipant) {
      throw new BadRequestException(
        'User is already a participant of this thread',
      );
    }

    const threadParticipant = this.threadParticipantRepository.create({
      threadId,
      userId,
      role: threadRole,
      accessType: AccessType.MEMBER,
      threadRole: threadRole,
      canUpload: true,
      canComment: true,
      canInvite: threadRole === ThreadRole.OWNER,
    });

    await this.threadParticipantRepository.save(threadParticipant);

    // Update participant count
    await this.threadRepository.increment(
      { id: threadId },
      'participantCount',
      1,
    );
  }

  /**
   * Remove user from thread
   */
  async removeUserFromThread(userId: string, threadId: string): Promise<void> {
    const result = await this.threadParticipantRepository.delete({
      userId,
      threadId,
    });

    if (result.affected === 0) {
      throw new BadRequestException('User is not a participant of this thread');
    }

    // Update participant count
    await this.threadRepository.decrement(
      { id: threadId },
      'participantCount',
      1,
    );
  }

  /**
   * Update thread
   */
  async updateThread(
    threadId: string,
    updateData: UpdateThreadDto,
    userId: string,
  ): Promise<ThreadResponseDto> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Check if user has permission to update thread
    const hasPermission = await this.permissionService.hasThreadPermission(
      userId,
      threadId,
      'UPDATE_METADATA',
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions to update thread');
    }

    // Update thread
    Object.assign(thread, updateData);
    const updatedThread = await this.threadRepository.save(thread);

    return this.toThreadResponseDto(updatedThread);
  }

  /**
   * Archive thread
   */
  async archiveThread(threadId: string, userId: string): Promise<void> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Check if user has permission to archive thread
    const hasPermission = await this.permissionService.hasThreadPermission(
      userId,
      threadId,
      'UPDATE_METADATA',
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions to archive thread',
      );
    }

    await this.threadRepository.update(threadId, { isArchived: true });
  }

  /**
   * Get threads for a user with cursor-based pagination
   */
  async getThreads(
    userId: string,
    query: CursorPaginationQueryDto & { chatroomId?: string },
  ): Promise<CursorBasedData<ThreadResponseDto>> {
    // If chatroomId is provided, get threads for that specific chatroom
    if (query.chatroomId) {
      return this.getThreadsByChatRoom(query.chatroomId, query);
    }

    // Otherwise, get all threads for the user
    return this.getAllThreads(userId, query);
  }

  /**
   * Get all threads for a user with cursor-based pagination
   */
  async getAllThreads(
    userId: string,
    query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<ThreadResponseDto>> {
    const { limit = 20, lastIndex } = query;

    // First get thread IDs for the user
    const threadParticipants = await this.threadParticipantRepository.find({
      where: { userId },
      select: ['threadId'],
    });

    const threadIds = threadParticipants.map(
      (participant) => participant.threadId,
    );

    if (threadIds.length === 0) {
      return new CursorBasedData([], false, limit);
    }

    // Get threads with pagination using IN query
    const whereCondition: { id: any; createdAt?: any } = {
      id: In(threadIds),
    };

    if (lastIndex) {
      const lastDate = new Date(lastIndex);
      whereCondition.createdAt = MoreThan(lastDate);
    }

    const threads = await this.threadRepository.find({
      where: whereCondition,
      relations: ['chatRoom'],
      order: { createdAt: 'DESC' },
      take: limit + 1,
    });

    const hasNext = threads.length > limit;
    const items = hasNext ? threads.slice(0, limit) : threads;

    // Convert to DTOs
    const threadDtos = items.map((thread) => this.toThreadResponseDto(thread));

    // Get nextIndex from the last item's createdAt if there's a next page
    const nextIndex =
      hasNext && items.length > 0
        ? items[items.length - 1].createdAt.toISOString()
        : undefined;

    return new CursorBasedData(threadDtos, hasNext, limit, nextIndex);
  }

  /**
   * Find threads by name/title for thread reference parsing
   */
  async findThreadsByName(
    threadNames: string[],
    companyId: string,
  ): Promise<Map<string, { id: string; title: string }>> {
    if (threadNames.length === 0) {
      return new Map();
    }

    const threads = await this.threadRepository
      .createQueryBuilder('thread')
      .leftJoin('thread.chatRoom', 'chatRoom')
      .where('chatRoom.companyId = :companyId', { companyId })
      .select(['thread.id', 'thread.title'])
      .getMany();

    const result = new Map<string, { id: string; title: string }>();

    for (const thread of threads) {
      // Find the best matching thread name from the input
      const matchedName = threadNames.find((name) =>
        thread.title.toLowerCase().includes(name.toLowerCase()),
      );

      if (matchedName) {
        result.set(matchedName.toLowerCase(), {
          id: thread.id,
          title: thread.title,
        });
      }
    }

    return result;
  }
}

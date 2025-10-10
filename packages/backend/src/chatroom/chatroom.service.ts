import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CursorPaginationQueryDto } from '../common/dto';
import { CursorBasedData } from '../common/dto/api-response.dto';
import { ChatRoom } from './entities/chatroom.entity';
import { ChatRoomMember } from './entities/chatroom-member.entity';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import { ChatroomResponseDto } from './dto/chatroom-response.dto';
import { PermissionService } from '../permission/permission.service';
import { CompanyRole } from '../constants/permissions';
import { Message } from '../message/entities/message.entity';
import { ChatroomRealtimeDataDto } from '../websocket/dto/websocket-events.dto';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatRoomMember)
    private readonly chatRoomMemberRepository: Repository<ChatRoomMember>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Create a new chatroom
   */
  async createChatRoom(
    createChatRoomDto: CreateChatroomDto,
    userId: string,
    companyId: string,
  ): Promise<ChatroomResponseDto> {
    // Check if user has permission to create chatrooms
    const hasPermission = await this.permissionService.hasCompanyPermission(
      userId,
      'CREATE_CHATROOM',
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions to create chatroom',
      );
    }

    // Validate required fields
    if (!createChatRoomDto.name?.trim()) {
      throw new BadRequestException('Chatroom name is required');
    }

    // Create chatroom
    const chatRoom = this.chatRoomRepository.create({
      ...createChatRoomDto,
      companyId,
      createdBy: userId,
      memberCount: 1, // Creator is automatically a member
    });

    const savedChatRoom = await this.chatRoomRepository.save(chatRoom);

    // Add creator as member
    const chatRoomMember = this.chatRoomMemberRepository.create({
      chatroomId: savedChatRoom.id,
      userId: userId,
      joinedAt: new Date(),
    });

    await this.chatRoomMemberRepository.save(chatRoomMember);

    return this.toChatRoomResponseDto(savedChatRoom);
  }

  /**
   * Get chatrooms for a company with cursor-based pagination
   */
  async getChatRoomsByCompany(
    companyId: string,
    query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<ChatroomResponseDto>> {
    const { limit = 20, lastIndex } = query;

    // Build where condition for cursor-based pagination
    const whereCondition: { companyId: string; createdAt?: any } = {
      companyId,
    };
    if (lastIndex) {
      // Parse lastIndex as ISO date string and use it for cursor
      const lastDate = new Date(lastIndex);
      whereCondition.createdAt = MoreThan(lastDate);
    }

    // Fetch one more item than requested to determine hasNext
    const chatRooms = await this.chatRoomRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      take: limit + 1,
    });

    const hasNext = chatRooms.length > limit;
    const items = hasNext ? chatRooms.slice(0, limit) : chatRooms;

    // Convert to DTOs
    const chatRoomDtos = items.map((chatRoom) =>
      this.toChatRoomResponseDto(chatRoom),
    );

    // Get nextIndex from the last item's createdAt if there's a next page
    const nextIndex =
      hasNext && items.length > 0
        ? items[items.length - 1].createdAt.toISOString()
        : undefined;

    return new CursorBasedData(chatRoomDtos, hasNext, limit, nextIndex);
  }

  /**
   * Get chatroom by ID
   */
  async getChatRoomById(
    id: string,
    userId?: string,
  ): Promise<ChatroomResponseDto> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id },
    });

    if (!chatRoom) {
      throw new NotFoundException('Chatroom not found');
    }

    // If userId is provided, check membership
    if (userId) {
      const isMember = await this.isUserMemberOfChatRoom(userId, id);
      if (!isMember) {
        throw new ForbiddenException('Access denied to chatroom');
      }
    }

    return this.toChatRoomResponseDto(chatRoom);
  }

  /**
   * Check if user is member of chatroom
   */
  async isUserMemberOfChatRoom(
    userId: string,
    chatroomId: string,
  ): Promise<boolean> {
    const member = await this.chatRoomMemberRepository.findOne({
      where: {
        userId,
        chatroomId,
      },
    });

    return !!member;
  }

  /**
   * Add user to chatroom
   */
  async addUserToChatRoom(userId: string, chatroomId: string): Promise<void> {
    const existingMember = await this.isUserMemberOfChatRoom(
      userId,
      chatroomId,
    );

    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this chatroom',
      );
    }

    const chatRoomMember = this.chatRoomMemberRepository.create({
      chatroomId,
      userId,
      joinedAt: new Date(),
    });

    await this.chatRoomMemberRepository.save(chatRoomMember);

    // Update member count
    await this.chatRoomRepository.increment(
      { id: chatroomId },
      'memberCount',
      1,
    );
  }

  /**
   * Remove user from chatroom
   */
  async removeUserFromChatRoom(
    userId: string,
    chatroomId: string,
  ): Promise<void> {
    const result = await this.chatRoomMemberRepository.delete({
      userId,
      chatroomId,
    });

    if (result.affected === 0) {
      throw new BadRequestException('User is not a member of this chatroom');
    }

    // Update member count
    await this.chatRoomRepository.decrement(
      { id: chatroomId },
      'memberCount',
      1,
    );
  }

  /**
   * Update a chatroom
   */
  async updateChatRoom(
    chatroomId: string,
    updateDto: UpdateChatroomDto,
    userId: string,
  ): Promise<ChatroomResponseDto> {
    const chatroom = await this.chatRoomRepository.findOne({
      where: { id: chatroomId },
    });

    if (!chatroom) {
      throw new NotFoundException('Chatroom not found');
    }

    // Update fields
    if (updateDto.name !== undefined) chatroom.name = updateDto.name;
    if (updateDto.description !== undefined)
      chatroom.description = updateDto.description;
    if (updateDto.avatarUrl !== undefined)
      chatroom.avatarUrl = updateDto.avatarUrl;
    if (updateDto.isPrivate !== undefined)
      chatroom.isPrivate = updateDto.isPrivate;

    const updatedChatroom = await this.chatRoomRepository.save(chatroom);
    return this.toChatRoomResponseDto(updatedChatroom);
  }

  /**
   * Delete a chatroom (soft delete)
   */
  async deleteChatRoom(chatroomId: string, userId: string): Promise<void> {
    await this.getChatRoomById(chatroomId, userId);
    await this.chatRoomRepository.softDelete(chatroomId);
  }

  /**
   * Add member to chatroom
   */
  async addMember(
    chatroomId: string,
    userId: string,
    requesterId: string,
  ): Promise<void> {
    // Validate access
    await this.getChatRoomById(chatroomId, requesterId);

    // Check if member already exists
    const existingMember = await this.chatRoomMemberRepository.findOne({
      where: { chatroomId: chatroomId, userId: userId },
    });

    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this chatroom',
      );
    }

    // Add member
    const member = this.chatRoomMemberRepository.create({
      chatroomId: chatroomId,
      userId: userId,
    });

    await this.chatRoomMemberRepository.save(member);

    // Update member count
    await this.chatRoomRepository.increment(
      { id: chatroomId },
      'memberCount',
      1,
    );
  }

  /**
   * Remove member from chatroom
   */
  async removeMember(
    chatroomId: string,
    userId: string,
    requesterId: string,
  ): Promise<void> {
    // Validate access
    await this.getChatRoomById(chatroomId, requesterId);

    // Remove member
    await this.chatRoomMemberRepository.delete({
      chatroomId: chatroomId,
      userId: userId,
    });

    // Update member count
    await this.chatRoomRepository.decrement(
      { id: chatroomId },
      'memberCount',
      1,
    );
  }

  /**
   * Convert ChatRoom entity to ChatroomResponseDto
   */
  private toChatRoomResponseDto(chatroom: ChatRoom): ChatroomResponseDto {
    return {
      id: chatroom.id,
      companyId: chatroom.companyId,
      name: chatroom.name,
      description: chatroom.description,
      avatarUrl: chatroom.avatarUrl,
      isPrivate: chatroom.isPrivate,
      createdBy: chatroom.createdBy,
      creator: chatroom.creator
        ? {
            id: chatroom.creator.id,
            username: chatroom.creator.username,
            fullName: chatroom.creator.fullName,
            avatarUrl: chatroom.creator.avatarUrl,
          }
        : undefined,
      memberCount: chatroom.memberCount,
      createdAt: chatroom.createdAt,
      updatedAt: chatroom.updatedAt,
    };
  }

  /**
   * Get bulk chatroom realtime data for multiple chatrooms
   */
  async getBulkChatroomRealtimeData(
    chatroomIds: string[],
    userId: string,
  ): Promise<ChatroomRealtimeDataDto[]> {
    const realtimeDataPromises = chatroomIds.map(async (chatroomId) => {
      // Get chatroom member info for lastReadAt
      const member = await this.chatRoomMemberRepository.findOne({
        where: { chatroomId, userId },
      });

      // Get last message
      const lastMessage = await this.messageRepository.findOne({
        where: { chatroomId },
        order: { createdAt: 'DESC' },
        relations: ['sender'],
      });

      // Calculate unread count
      let unreadCount = 0;
      if (member?.lastReadAt) {
        unreadCount = await this.messageRepository.count({
          where: {
            chatroomId,
            createdAt: MoreThan(member.lastReadAt),
          },
        });
      } else {
        // No lastReadAt means all messages are unread
        unreadCount = await this.messageRepository.count({
          where: { chatroomId },
        });
      }

      return {
        chatroomId,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderName: lastMessage.sender?.username || 'Unknown',
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt.toISOString(),
            }
          : undefined,
        unreadCount,
        updatedAt:
          lastMessage?.createdAt?.toISOString() || new Date().toISOString(),
      };
    });

    return Promise.all(realtimeDataPromises);
  }

  /**
   * Update last read timestamp for a user in a chatroom
   */
  async updateLastReadAt(chatroomId: string, userId: string): Promise<void> {
    await this.chatRoomMemberRepository.update(
      { chatroomId, userId },
      { lastReadAt: new Date() },
    );
  }
}

import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CursorPaginationQueryDto } from '../common/dto';
import { CursorBasedData } from '../common/dto/api-response.dto';
import { ChatRoom } from './entities/chatroom.entity';
import { ChatRoomMember } from './entities/chatroom-member.entity';
import { CreateChatRoomDto } from './dto/create-chatroom.dto';
import { ChatRoomResponseDto } from './dto/chatroom-response.dto';
import { PermissionService } from '../permission/permission.service';
import { CompanyRole } from '../constants/permissions';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatRoomMember)
    private readonly chatRoomMemberRepository: Repository<ChatRoomMember>,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Create a new chatroom
   */
  async createChatRoom(
    createChatRoomDto: CreateChatRoomDto,
    userId: string,
    companyId: string,
  ): Promise<ChatRoomResponseDto> {
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

    return ChatRoomResponseDto.fromEntity(savedChatRoom);
  }

  /**
   * Get chatrooms for a company with cursor-based pagination
   */
  async getChatRoomsByCompany(
    companyId: string,
    query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<ChatRoomResponseDto>> {
    const { limit = 20, lastIndex } = query;

    // Build where condition for cursor-based pagination
    const whereCondition: any = { companyId };
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
      ChatRoomResponseDto.fromEntity(chatRoom),
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
  async getChatRoomById(id: string): Promise<ChatRoomResponseDto | null> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id },
    });

    return chatRoom ? ChatRoomResponseDto.fromEntity(chatRoom) : null;
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
}

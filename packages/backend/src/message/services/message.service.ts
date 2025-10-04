import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { CursorPaginationQueryDto } from '../../common/dto';
import { CursorBasedData } from '../../common/dto/api-response.dto';
import { Message, MessageType } from '../entities/message.entity';
import { SendMessageDto } from '../dto/send-message.dto';
import { EditMessageDto } from '../dto/edit-message.dto';
import {
  MessageResponseDto,
  MessageListResponseDto,
  ThreadReferenceDto,
} from '../dto/message-response.dto';
import { ChatRoomService } from '../../chatroom/chatroom.service';
import { ThreadService } from '../../thread/thread.service';
import { PermissionService } from '../../permission/permission.service';
import { AccessType } from '../../constants/permissions';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly chatRoomService: ChatRoomService,
    private readonly threadService: ThreadService,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Send a new message to a chatroom
   */
  async sendMessage(
    sendMessageDto: SendMessageDto,
    userId: string,
  ): Promise<MessageResponseDto> {
    // Validate chatroom access
    await this.validateChatroomAccess(sendMessageDto.chatroomId, userId);

    // Create message entity
    const message = this.messageRepository.create({
      chatroomId: sendMessageDto.chatroomId,
      senderId: userId,
      content: sendMessageDto.content,
      messageType: sendMessageDto.messageType || MessageType.TEXT,
    });

    // Save message
    const savedMessage = await this.messageRepository.save(message);

    // Load message with relations for response
    const messageWithRelations = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    if (!messageWithRelations) {
      throw new NotFoundException('Message not found after creation');
    }

    // Get chatroom info for company ID
    const chatroom = await this.chatRoomService.getChatRoomById(
      sendMessageDto.chatroomId,
      userId,
    );

    // Parse thread references
    const threadReferences = chatroom
      ? await this.parseThreadReferences(
          sendMessageDto.content,
          chatroom.companyId,
        )
      : [];

    // Convert to response DTO
    const responseDto = this.toMessageResponseDto(messageWithRelations);
    responseDto.threadReferences = threadReferences;

    return responseDto;
  }

  /**
   * Edit an existing message
   */
  async editMessage(
    messageId: string,
    editMessageDto: EditMessageDto,
    userId: string,
  ): Promise<MessageResponseDto> {
    // Find message
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Validate ownership
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Validate chatroom access
    await this.validateChatroomAccess(message.chatroomId, userId);

    // Update message
    message.content = editMessageDto.content;
    message.isEdited = true;
    message.editedAt = new Date();

    const updatedMessage = await this.messageRepository.save(message);

    // Convert to response DTO
    return this.toMessageResponseDto(updatedMessage);
  }

  /**
   * Delete a message (soft delete by setting content to empty)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    // Find message
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Validate ownership or admin permissions
    const hasPermission =
      message.senderId === userId ||
      (await this.permissionService.hasCompanyPermission(
        userId,
        'MANAGE_USERS',
      ));

    if (!hasPermission) {
      throw new ForbiddenException(
        'You can only delete your own messages or need admin permissions',
      );
    }

    // Soft delete by clearing content
    message.content = '[Message deleted]';
    message.isEdited = true;
    message.editedAt = new Date();

    await this.messageRepository.save(message);
  }

  /**
   * Get messages for a chatroom with pagination
   */
  async getChatroomMessages(
    chatroomId: string,
    userId: string,
    query: CursorPaginationQueryDto,
  ): Promise<MessageListResponseDto> {
    // Validate chatroom access
    await this.validateChatroomAccess(chatroomId, userId);

    // Build query
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.chatroomId = :chatroomId', { chatroomId })
      .orderBy('message.createdAt', 'DESC')
      .limit(query.limit || 20);

    // Apply cursor pagination
    if (query.lastIndex) {
      const cursorData = this.parseCursor(query.lastIndex);
      queryBuilder.andWhere(
        '(message.createdAt < :cursorDate OR (message.createdAt = :cursorDate AND message.id < :cursorId))',
        {
          cursorDate: cursorData.createdAt,
          cursorId: cursorData.id,
        },
      );
    }

    // Execute query
    const [messages, total] = await queryBuilder.getManyAndCount();

    // Generate cursors
    const hasMore =
      messages.length === (query.limit || 20) && total > messages.length;
    const nextCursor =
      hasMore && messages.length > 0
        ? this.generateCursor(messages[messages.length - 1])
        : undefined;
    const previousCursor = query.lastIndex
      ? this.generateCursor(messages[0])
      : undefined;

    // Convert to response DTOs
    const messageDtos = messages.map((message) =>
      this.toMessageResponseDto(message),
    );

    return {
      messages: messageDtos,
      total,
      count: messageDtos.length,
      nextCursor,
      previousCursor,
      hasMore,
    };
  }

  /**
   * Get a specific message by ID
   */
  async getMessage(
    messageId: string,
    userId: string,
  ): Promise<MessageResponseDto> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Validate chatroom access
    await this.validateChatroomAccess(message.chatroomId, userId);

    return this.toMessageResponseDto(message);
  }

  /**
   * Get messages by thread ID
   */
  async getThreadMessages(
    threadId: string,
    userId: string,
    query: CursorPaginationQueryDto,
  ): Promise<MessageListResponseDto> {
    // TODO: Implement thread message filtering when thread integration is complete
    // For now, return empty result
    return {
      messages: [],
      total: 0,
      count: 0,
      hasMore: false,
    };
  }

  /**
   * Validate user access to chatroom
   */
  private async validateChatroomAccess(
    chatroomId: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.chatRoomService.getChatRoomById(chatroomId, userId);
    } catch (error) {
      throw new ForbiddenException('Access denied to chatroom');
    }
  }

  /**
   * Convert Message entity to MessageResponseDto
   */
  private toMessageResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      chatroomId: message.chatroomId,
      sender: {
        id: message.sender.id,
        username: message.sender.username,
        fullName: message.sender.fullName,
        avatarUrl: message.sender.avatarUrl,
      },
      content: message.content,
      messageType: message.messageType,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      replyTo: message.replyToId
        ? { messageId: message.replyToId, content: '', senderName: 'Unknown' }
        : undefined,
      threadId: message.threadId,
    };
  }

  /**
   * Parse cursor for pagination
   */
  private parseCursor(cursor: string): { createdAt: Date; id: string } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const data = JSON.parse(decoded);
      return {
        createdAt: new Date(data.createdAt),
        id: data.id,
      };
    } catch (error) {
      throw new BadRequestException('Invalid cursor format');
    }
  }

  /**
   * Generate cursor for pagination
   */
  private generateCursor(message: Message): string {
    const data = {
      createdAt: message.createdAt.toISOString(),
      id: message.id,
    };
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Parse thread references from message content
   */
  async parseThreadReferences(
    content: string,
    companyId: string,
  ): Promise<ThreadReferenceDto[]> {
    // Extract thread names from #threadname patterns
    const threadNamePattern = /#([^\s#]+)/g;
    const matches = [...content.matchAll(threadNamePattern)];

    if (matches.length === 0) {
      return [];
    }

    // Extract unique thread names
    const threadNames = [...new Set(matches.map((match) => match[1].trim()))];

    // Find threads by name
    const threadMap = await this.threadService.findThreadsByName(
      threadNames,
      companyId,
    );

    // Build thread references
    const threadReferences: ThreadReferenceDto[] = [];

    for (const match of matches) {
      const originalText = match[0]; // e.g., "#Feature Discussion"
      const threadName = match[1].trim().toLowerCase();

      const threadInfo = threadMap.get(threadName);
      if (threadInfo) {
        threadReferences.push({
          threadId: threadInfo.id,
          threadName: threadInfo.title,
          originalText,
        });
      }
    }

    return threadReferences;
  }
}

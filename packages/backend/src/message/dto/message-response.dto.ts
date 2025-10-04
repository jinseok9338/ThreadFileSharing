import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../entities/message.entity';

export class UserInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
    required: false,
  })
  fullName?: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl?: string;
}

export class ReplyToDto {
  @ApiProperty({
    description: 'Original message ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  messageId: string;

  @ApiProperty({
    description: 'Original message content',
    example: 'Original message',
  })
  content: string;

  @ApiProperty({ description: 'Original sender name', example: 'Jane Doe' })
  senderName: string;
}

export class ThreadReferenceDto {
  @ApiProperty({
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  threadId: string;

  @ApiProperty({
    description: 'Thread name/title',
    example: 'Feature Discussion',
  })
  threadName: string;

  @ApiProperty({
    description: 'Original reference text in message',
    example: '#Feature Discussion',
  })
  originalText: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  chatroomId: string;

  @ApiProperty({ description: 'Message sender information', type: UserInfoDto })
  sender: UserInfoDto;

  @ApiProperty({ description: 'Message content', example: 'Hello everyone!' })
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  messageType: MessageType;

  @ApiProperty({
    description: 'Whether the message has been edited',
    example: false,
  })
  isEdited: boolean;

  @ApiProperty({
    description: 'Edit timestamp',
    example: '2023-12-01T10:00:00.000Z',
    required: false,
  })
  editedAt?: Date;

  @ApiProperty({
    description: 'Reply information',
    type: ReplyToDto,
    required: false,
  })
  replyTo?: ReplyToDto;

  @ApiProperty({
    description: 'Thread ID if message belongs to a thread',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
  })
  threadId?: string;

  @ApiProperty({
    description: 'Thread references found in message content',
    type: [ThreadReferenceDto],
    required: false,
  })
  threadReferences?: ThreadReferenceDto[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-12-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-12-01T10:00:00.000Z',
  })
  updatedAt: Date;
}

export class MessageListResponseDto {
  @ApiProperty({ description: 'List of messages', type: [MessageResponseDto] })
  messages: MessageResponseDto[];

  @ApiProperty({ description: 'Total number of messages', example: 150 })
  total: number;

  @ApiProperty({
    description: 'Number of messages in current page',
    example: 20,
  })
  count: number;

  @ApiProperty({
    description: 'Cursor for pagination (next page)',
    example:
      'eyJjcmVhdGVkQXQiOiIyMDIzLTEyLTAxVDEwOjAwOjAwLjAwMFoiLCJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCJ9',
    required: false,
  })
  nextCursor?: string;

  @ApiProperty({
    description: 'Cursor for pagination (previous page)',
    example:
      'eyJjcmVhdGVkQXQiOiIyMDIzLTEyLTAxVDA5OjAwOjAwLjAwMFoiLCJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMSJ9',
    required: false,
  })
  previousCursor?: string;

  @ApiProperty({
    description: 'Whether there are more messages',
    example: true,
  })
  hasMore: boolean;
}

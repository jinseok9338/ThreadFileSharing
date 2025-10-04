import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class SendMessageDto {
  @ApiProperty({
    description: 'Chatroom ID where the message will be sent',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Chatroom ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Chatroom ID is required' })
  chatroomId: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello everyone!',
    maxLength: 2000,
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(2000, { message: 'Content cannot exceed 2000 characters' })
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    default: MessageType.TEXT,
    example: MessageType.TEXT,
  })
  @IsEnum(MessageType, { message: 'Message type must be TEXT or SYSTEM' })
  @IsOptional()
  messageType?: MessageType = MessageType.TEXT;

  @ApiProperty({
    description: 'ID of the message being replied to',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsUUID('4', { message: 'Reply to ID must be a valid UUID' })
  @IsOptional()
  replyToId?: string;

  @ApiProperty({
    description: 'ID of the thread this message belongs to',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
  })
  @IsUUID('4', { message: 'Thread ID must be a valid UUID' })
  @IsOptional()
  threadId?: string;
}

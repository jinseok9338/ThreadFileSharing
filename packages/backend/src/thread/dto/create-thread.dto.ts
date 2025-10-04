import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateThreadDto {
  @ApiProperty({
    description: 'Chatroom ID where the thread will be created',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Chatroom ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Chatroom ID is required' })
  chatroomId: string;

  @ApiProperty({
    description: 'Thread title',
    example: 'Discussion about new features',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title: string;

  @ApiProperty({
    description: 'Thread description',
    example:
      'This thread is for discussing the new features we want to implement',
    maxLength: 1000,
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Array of user IDs to add as thread participants',
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
    required: false,
  })
  @IsArray({ message: 'Participant IDs must be an array' })
  @IsUUID('4', {
    each: true,
    message: 'Each participant ID must be a valid UUID',
  })
  @IsOptional()
  participantIds?: string[];
}

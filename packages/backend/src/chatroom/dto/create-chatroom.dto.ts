import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateChatroomDto {
  @ApiProperty({
    description: 'Chatroom name',
    example: 'General Discussion',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Chatroom description',
    example: 'General discussion channel for all team members',
    maxLength: 500,
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Chatroom avatar URL',
    example: 'https://example.com/chatroom-avatar.jpg',
    required: false,
  })
  @IsString({ message: 'Avatar URL must be a string' })
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Whether the chatroom is private',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean({ message: 'isPrivate must be a boolean' })
  @IsOptional()
  isPrivate?: boolean = false;
}

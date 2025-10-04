import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateChatroomDto {
  @ApiProperty({
    description: 'Updated chatroom name',
    example: 'Updated General Discussion',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name?: string;

  @ApiProperty({
    description: 'Updated chatroom description',
    example: 'Updated general discussion channel for all team members',
    maxLength: 500,
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Updated chatroom avatar URL',
    example: 'https://example.com/new-chatroom-avatar.jpg',
    required: false,
  })
  @IsString({ message: 'Avatar URL must be a string' })
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Whether the chatroom is private',
    example: true,
    required: false,
  })
  @IsBoolean({ message: 'isPrivate must be a boolean' })
  @IsOptional()
  isPrivate?: boolean;
}

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatRoomDto {
  @ApiProperty({
    description: 'Chatroom name',
    example: 'Project Discussion',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Chatroom description',
    example: 'Discussion about the new project features',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Whether the chatroom is private',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiProperty({
    description: 'Chatroom avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

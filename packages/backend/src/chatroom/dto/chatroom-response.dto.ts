import { ApiProperty } from '@nestjs/swagger';
import { ChatRoom } from '../entities/chatroom.entity';

export class ChatRoomResponseDto {
  @ApiProperty({
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId: string;

  @ApiProperty({
    description: 'Chatroom name',
    example: 'Project Discussion',
  })
  name: string;

  @ApiProperty({
    description: 'Chatroom description',
    example: 'Discussion about the new project features',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Chatroom avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Whether the chatroom is private',
    example: false,
  })
  isPrivate: boolean;

  @ApiProperty({
    description: 'User ID who created the chatroom',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  createdBy: string;

  @ApiProperty({
    description: 'Number of members in the chatroom',
    example: 5,
  })
  memberCount: number;

  @ApiProperty({
    description: 'Chatroom creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Chatroom last update date',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Chatroom deletion date',
    example: null,
    required: false,
  })
  deletedAt?: Date;

  /**
   * Create ChatRoomResponseDto from entity
   */
  static fromEntity(entity: ChatRoom): ChatRoomResponseDto {
    return {
      id: entity.id,
      companyId: entity.companyId,
      name: entity.name,
      description: entity.description,
      avatarUrl: entity.avatarUrl,
      isPrivate: entity.isPrivate,
      createdBy: entity.createdBy,
      memberCount: entity.memberCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Thread } from '../entities/thread.entity';

export class ThreadResponseDto {
  @ApiProperty({
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  chatroomId: string;

  @ApiProperty({
    description: 'Thread title',
    example: 'Design Review Discussion',
  })
  title: string;

  @ApiProperty({
    description: 'Thread description',
    example: 'Discussion about the new design mockups',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'User ID who created the thread',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  createdBy: string;

  @ApiProperty({
    description: 'Whether the thread is archived',
    example: false,
  })
  isArchived: boolean;

  @ApiProperty({
    description: 'Number of participants in the thread',
    example: 5,
  })
  participantCount: number;

  @ApiProperty({
    description: 'Number of files in the thread',
    example: 3,
  })
  fileCount: number;

  @ApiProperty({
    description: 'Last message timestamp',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  lastMessageAt?: Date;

  @ApiProperty({
    description: 'Thread creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thread last update date',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Thread deletion date',
    example: null,
    required: false,
  })
  deletedAt?: Date;

  /**
   * Create ThreadResponseDto from entity
   */
  static fromEntity(entity: Thread): ThreadResponseDto {
    return {
      id: entity.id,
      chatroomId: entity.chatroomId,
      title: entity.title,
      description: entity.description,
      createdBy: entity.createdBy,
      isArchived: entity.isArchived,
      participantCount: entity.participantCount,
      fileCount: entity.fileCount,
      lastMessageAt: entity.lastMessageAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}

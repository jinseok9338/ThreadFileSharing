import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatRoomMemberDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'john_doe',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'John Doe',
  })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Join timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  joinedAt: string;
}


import { ApiProperty } from '@nestjs/swagger';

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

export class ThreadParticipantDto {
  @ApiProperty({
    description: 'Participant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'User information', type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({ description: 'Role in the thread', example: 'PARTICIPANT' })
  role: string;

  @ApiProperty({
    description: 'Who shared this thread with the participant',
    type: UserInfoDto,
    required: false,
  })
  sharedBy?: UserInfoDto;

  @ApiProperty({
    description: 'When the user joined the thread',
    example: '2023-12-01T10:00:00.000Z',
  })
  joinedAt: Date;
}

export class ThreadResponseDto {
  @ApiProperty({
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  chatroomId: string;

  @ApiProperty({
    description: 'Thread title',
    example: 'Discussion about new features',
  })
  title: string;

  @ApiProperty({
    description: 'Thread description',
    example: 'This thread is for discussing new features',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'ID of the user who created the thread',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  createdBy: string;

  @ApiProperty({
    description: 'User who created the thread',
    type: UserInfoDto,
    required: false,
  })
  creator?: UserInfoDto;

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

  @ApiProperty({ description: 'Number of files in the thread', example: 12 })
  fileCount: number;

  @ApiProperty({
    description: 'Last message timestamp',
    example: '2023-12-01T10:00:00.000Z',
    required: false,
  })
  lastMessageAt?: Date;

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

export class ThreadDetailResponseDto extends ThreadResponseDto {
  @ApiProperty({
    description: 'List of thread participants',
    type: [ThreadParticipantDto],
  })
  participants: ThreadParticipantDto[];
}

export class ThreadListResponseDto {
  @ApiProperty({ description: 'List of threads', type: [ThreadResponseDto] })
  threads: ThreadResponseDto[];

  @ApiProperty({ description: 'Total number of threads', example: 25 })
  total: number;

  @ApiProperty({
    description: 'Number of threads in current page',
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

  @ApiProperty({ description: 'Whether there are more threads', example: true })
  hasMore: boolean;
}

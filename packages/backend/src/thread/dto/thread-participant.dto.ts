import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ThreadRole, AccessType } from '../../constants/permissions';

export class ThreadParticipantDto {
  @ApiProperty({
    description: 'Participant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  threadId: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Thread role',
    enum: ThreadRole,
    example: ThreadRole.MEMBER,
  })
  threadRole: ThreadRole;

  @ApiProperty({
    description: 'Access type',
    enum: AccessType,
    example: AccessType.MEMBER,
  })
  accessType: AccessType;

  @ApiPropertyOptional({
    description: 'User ID who shared the thread',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sharedByUserId?: string;

  @ApiPropertyOptional({
    description: 'Username who shared the thread',
    example: 'john_doe',
  })
  sharedByUsername?: string;

  @ApiPropertyOptional({
    description: 'Thread sharing timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  sharedAt?: string;

  @ApiProperty({
    description: 'Join timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  joinedAt: string;
}

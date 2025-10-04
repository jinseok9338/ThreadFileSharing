import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UploadStatus } from '../../common/enums/upload-status.enum';

export class UploadSessionResponseDto {
  @ApiProperty({
    description: 'Unique session ID',
    example: 'upload_session_123e4567-e89b-12d3-a456-426614174000',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'large-video.mp4',
  })
  fileName: string;

  @ApiProperty({
    description: 'Total file size in bytes',
    example: 10737418240,
  })
  totalSizeBytes: bigint;

  @ApiProperty({
    description: 'Number of chunks uploaded so far',
    example: 5,
  })
  uploadedChunks: number;

  @ApiProperty({
    description: 'Total number of chunks',
    example: 20,
  })
  totalChunks: number;

  @ApiProperty({
    description: 'Bytes uploaded so far',
    example: 2621440000,
  })
  uploadedBytes: bigint;

  @ApiProperty({
    description: 'Upload progress percentage (0-100)',
    example: 24.4,
  })
  progressPercentage: number;

  @ApiProperty({
    description: 'Current upload status',
    enum: UploadStatus,
    example: UploadStatus.IN_PROGRESS,
  })
  status: UploadStatus;

  @ApiProperty({
    description: 'When the upload was created',
    example: '2023-10-03T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the upload was last updated',
    example: '2023-10-03T10:05:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'When the upload was completed',
    example: '2023-10-03T10:10:00Z',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'When the upload session expires',
    example: '2023-10-03T12:00:00Z',
  })
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Chatroom ID if associated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  chatroomId?: string;

  @ApiPropertyOptional({
    description: 'Thread ID if associated',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  threadId?: string;

  @ApiProperty({
    description: 'Estimated time remaining in seconds',
    example: 1800,
  })
  estimatedTimeRemaining?: number;

  @ApiProperty({
    description: 'Upload speed in bytes per second',
    example: 1048576,
  })
  uploadSpeed?: number;
}

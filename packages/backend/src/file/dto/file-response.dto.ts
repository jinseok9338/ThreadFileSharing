import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Thread ID if file belongs to a thread',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  threadId?: string;

  @ApiPropertyOptional({
    description: 'Chatroom ID if file belongs to a chatroom',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  chatroomId?: string;

  @ApiProperty({
    description: 'User ID who uploaded the file',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uploadedBy: string;

  @ApiProperty({
    description: 'Original file name',
    example: '프로젝트 기획서.pdf',
  })
  originalName: string;

  @ApiProperty({
    description: 'Storage key in MinIO/S3',
    example: 'files/2024/12/abc123def456.pdf',
  })
  storageKey: string;

  @ApiProperty({
    description: 'File MIME type',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1048576,
  })
  sizeBytes: number;

  @ApiProperty({
    description: 'File hash for integrity verification',
    example: 'sha256:abc123def456...',
  })
  hash: string;

  @ApiPropertyOptional({
    description: 'Additional file metadata',
    example: { pages: 10, author: 'John Doe' },
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Whether file processing is completed',
    example: true,
  })
  isProcessed: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  updatedAt: string;
}


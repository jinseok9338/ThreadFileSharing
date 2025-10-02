import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileMetadataDto {
  @ApiProperty({
    description: 'Original file name',
    example: '프로젝트 기획서.pdf',
  })
  @IsString()
  originalName: string;

  @ApiProperty({
    description: 'File MIME type',
    example: 'application/pdf',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1048576,
  })
  @IsNumber()
  @IsPositive()
  sizeBytes: number;

  @ApiProperty({
    description: 'File hash for integrity verification',
    example: 'sha256:abc123def456...',
  })
  @IsString()
  hash: string;

  @ApiPropertyOptional({
    description: 'Additional file metadata',
    example: { pages: 10, author: 'John Doe' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FileUploadStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class FileUploadProgressDto {
  @ApiProperty({
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  fileId: string;

  @ApiProperty({
    description: 'Upload progress percentage (0-100)',
    example: 75,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({
    description: 'Upload status',
    enum: FileUploadStatus,
    example: FileUploadStatus.UPLOADING,
  })
  @IsEnum(FileUploadStatus)
  status: FileUploadStatus;

  @ApiPropertyOptional({
    description: 'Status message',
    example: 'Processing file...',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FileUploadAction {
  CREATE_THREAD = 'CREATE_THREAD',
  SHARE_FILE = 'SHARE_FILE',
}

export class FileUploadDto {
  @ApiPropertyOptional({
    description: 'Chatroom ID for file upload context',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  chatroomId?: string;

  @ApiPropertyOptional({
    description: 'Thread ID for file upload context',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  threadId?: string;

  @ApiProperty({
    description: 'Upload action type',
    enum: FileUploadAction,
    example: FileUploadAction.CREATE_THREAD,
  })
  @IsEnum(FileUploadAction)
  action: FileUploadAction;
}


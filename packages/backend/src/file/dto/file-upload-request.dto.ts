import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { AccessType } from '../entities/file-association.entity';

export class FileUploadRequestDto {
  @IsOptional()
  @IsUUID()
  threadId?: string;

  @IsOptional()
  @IsUUID()
  chatroomId?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEnum(AccessType)
  accessType?: AccessType = AccessType.PRIVATE;

  @IsOptional()
  @IsString()
  sessionName?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  metadata?: Record<string, unknown>;
}

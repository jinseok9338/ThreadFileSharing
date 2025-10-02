import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ThreadRole } from '../../constants/permissions';

export class ShareThreadDto {
  @ApiProperty({
    description: 'User ID to share the thread with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Thread role for the shared participant',
    enum: [ThreadRole.MEMBER, ThreadRole.VIEWER],
    example: ThreadRole.VIEWER,
  })
  @IsEnum([ThreadRole.MEMBER, ThreadRole.VIEWER])
  threadRole: ThreadRole.MEMBER | ThreadRole.VIEWER;

  @ApiPropertyOptional({
    description: 'Optional message for sharing',
    example: '이 스레드를 공유합니다. 검토 부탁드립니다.',
  })
  @IsOptional()
  @IsString()
  message?: string;
}


import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChatRoomDto {
  @ApiPropertyOptional({
    description: 'Chatroom name',
    example: '디자인팀 - 업데이트',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Chatroom description',
    example: '디자인팀 전용 채팅방입니다. 업데이트됨.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Chatroom avatar URL',
    example: 'https://example.com/new-design-team-avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

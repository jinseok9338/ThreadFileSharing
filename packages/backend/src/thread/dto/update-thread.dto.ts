import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateThreadDto {
  @ApiPropertyOptional({
    description: 'Thread title',
    example: '프로젝트 기획서 검토 - 업데이트',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Thread description',
    example:
      '프로젝트 기획서에 대한 피드백과 논의를 위한 스레드입니다. 업데이트됨.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

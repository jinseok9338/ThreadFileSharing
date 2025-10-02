import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ThreadRole } from '../../constants/permissions';

export class AddThreadParticipantDto {
  @ApiProperty({
    description: 'User ID to add to the thread',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Thread role for the participant',
    enum: ThreadRole,
    example: ThreadRole.MEMBER,
  })
  @IsEnum(ThreadRole)
  threadRole: ThreadRole;
}

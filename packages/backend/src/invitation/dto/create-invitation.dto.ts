import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvitationRole } from '../entities/company-invitation.entity';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email address to invite',
    example: 'newmember@company.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role to assign to invited user',
    enum: InvitationRole,
    example: InvitationRole.MEMBER,
  })
  @IsEnum(InvitationRole)
  role: InvitationRole;
}

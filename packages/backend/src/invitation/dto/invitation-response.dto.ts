import { ApiProperty } from '@nestjs/swagger';
import {
  CompanyInvitation,
  InvitationRole,
  InvitationStatus,
} from '../entities/company-invitation.entity';

export class InvitationResponseDto {
  @ApiProperty({ description: 'Invitation ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Company ID', example: 'uuid' })
  companyId: string;

  @ApiProperty({ description: 'Inviter user ID', example: 'uuid' })
  invitedByUserId: string;

  @ApiProperty({ description: 'Invitee email', example: 'newuser@company.com' })
  email: string;

  @ApiProperty({
    description: 'Invited role',
    enum: InvitationRole,
    example: InvitationRole.MEMBER,
  })
  role: InvitationRole;

  @ApiProperty({ description: 'Invitation token', example: 'abc123...' })
  token: string;

  @ApiProperty({
    description: 'Expiration timestamp',
    example: '2025-10-08T00:00:00.000Z',
  })
  expiresAt: string;

  @ApiProperty({
    description: 'Invitation status',
    enum: InvitationStatus,
    example: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @ApiProperty({
    description: 'Acceptance timestamp',
    example: '2025-10-01T00:00:00.000Z',
    nullable: true,
  })
  acceptedAt?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-01T00:00:00.000Z',
  })
  createdAt: string;

  static fromEntity(invitation: CompanyInvitation): InvitationResponseDto {
    return {
      id: invitation.id,
      companyId: invitation.companyId,
      invitedByUserId: invitation.invitedByUserId,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      expiresAt: invitation.expiresAt?.toISOString(),
      status: invitation.status,
      acceptedAt: invitation.acceptedAt?.toISOString(),
      createdAt: invitation.createdAt?.toISOString(),
    };
  }
}

import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Invitation token',
    example: 'acme-invitation-token-001',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Password for new account (min 8 characters)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'New Member',
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}

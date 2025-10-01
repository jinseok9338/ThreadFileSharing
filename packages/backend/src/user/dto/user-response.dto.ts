import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole } from '../entities/user.entity';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Company ID', example: 'uuid' })
  companyId: string;

  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ description: 'Username', example: 'johndoe' })
  username?: string;

  @ApiPropertyOptional({ description: 'Full name', example: 'John Doe' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Company role',
    enum: CompanyRole,
    example: CompanyRole.MEMBER,
  })
  companyRole: CompanyRole;

  @ApiProperty({ description: 'Email verified status', example: true })
  emailVerified: boolean;

  @ApiProperty({ description: 'Account active status', example: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2025-10-01T00:00:00.000Z',
  })
  lastLoginAt?: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-10-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-01T00:00:00.000Z',
  })
  updatedAt: string;

  // Exclude sensitive fields
  @Exclude()
  password_hash?: string;

  @Exclude()
  google_id?: string;

  @Exclude()
  azure_id?: string;

  @Exclude()
  failed_login_attempts?: number;

  @Exclude()
  locked_until?: Date;

  @Exclude()
  deleted_at?: Date;

  static fromEntity(user: any): UserResponseDto {
    return {
      id: user.id,
      companyId: user.company_id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      companyRole: user.company_role,
      emailVerified: user.email_verified,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at?.toISOString(),
      createdAt: user.created_at?.toISOString(),
      updatedAt: user.updated_at?.toISOString(),
    };
  }
}

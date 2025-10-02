import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole } from '../../constants/permissions';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'john_doe',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'John Doe',
  })
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

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Account active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Failed login attempts count',
    example: 0,
  })
  failedLoginAttempts: number;

  @ApiPropertyOptional({
    description: 'Account locked until timestamp',
    example: '2024-12-19T12:00:00Z',
  })
  lockedUntil?: Date;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  updatedAt: Date;

  static fromEntity(entity: User): UserResponseDto {
    return {
      id: entity.id,
      companyId: entity.companyId,
      email: entity.email,
      username: entity.username,
      fullName: entity.fullName,
      avatarUrl: entity.avatarUrl,
      companyRole: entity.companyRole,
      emailVerified: entity.emailVerified,
      isActive: entity.isActive,
      failedLoginAttempts: entity.failedLoginAttempts,
      lockedUntil: entity.lockedUntil,
      lastLoginAt: entity.lastLoginAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

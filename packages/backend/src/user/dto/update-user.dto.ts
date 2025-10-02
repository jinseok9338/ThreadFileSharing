import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole } from '../../constants/permissions';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Username',
    example: 'john_doe',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Company role',
    enum: CompanyRole,
    example: CompanyRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(CompanyRole)
  companyRole?: CompanyRole;

  @ApiPropertyOptional({
    description: 'Email verification status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Account active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


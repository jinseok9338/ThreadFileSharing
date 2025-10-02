import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole } from '../../constants/permissions';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

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
    description: 'User password',
    example: 'securePassword123',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'Company role',
    enum: CompanyRole,
    example: CompanyRole.MEMBER,
  })
  @IsOptional()
  @IsEnum(CompanyRole)
  companyRole?: CompanyRole;

  @ApiPropertyOptional({
    description: 'Email verification status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}

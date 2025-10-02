import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'ThreadFileSharing Company',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Company slug (URL-friendly identifier)',
    example: 'threadfile-sharing',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Storage limit in GB',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  storageLimitGb?: number;

  @ApiPropertyOptional({
    description: 'Company-specific settings',
    example: { theme: 'dark', notifications: true },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}


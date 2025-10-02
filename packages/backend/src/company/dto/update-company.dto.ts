import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiPropertyOptional({
    description: 'Company name',
    example: 'ThreadFileSharing Company',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Company slug (URL-friendly identifier)',
    example: 'threadfile-sharing',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Storage limit in GB',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  storageLimitGb?: number;

  @ApiPropertyOptional({
    description: 'Company-specific settings',
    example: { theme: 'light', notifications: false },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

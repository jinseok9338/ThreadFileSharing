import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyPlan } from '../entities/company.entity';

export class UpdateCompanyDto {
  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Updated Company Name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Company subscription plan',
    enum: CompanyPlan,
    example: CompanyPlan.PRO,
  })
  @IsOptional()
  @IsEnum(CompanyPlan)
  plan?: CompanyPlan;

  @ApiPropertyOptional({
    description: 'Maximum number of users allowed',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_users?: number;

  @ApiPropertyOptional({
    description: 'Maximum storage in bytes',
    example: 10737418240,
    minimum: 0,
  })
  @IsOptional()
  @Min(0)
  max_storage_bytes?: bigint;
}

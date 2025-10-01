import { ApiProperty } from '@nestjs/swagger';
import { CompanyPlan } from '../entities/company.entity';

export class CompanyResponseDto {
  @ApiProperty({ description: 'Company ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Company name', example: 'Acme Corporation' })
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'acme-corp' })
  slug: string;

  @ApiProperty({
    description: 'Subscription plan',
    enum: CompanyPlan,
    example: CompanyPlan.FREE,
  })
  plan: CompanyPlan;

  @ApiProperty({ description: 'Maximum users allowed', example: 100 })
  maxUsers: number;

  @ApiProperty({
    description: 'Maximum storage in bytes',
    example: '5368709120',
  })
  maxStorageBytes: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-01T00:00:00.000Z',
  })
  updatedAt: string;

  static fromEntity(company: any): CompanyResponseDto {
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      plan: company.plan,
      maxUsers: company.max_users,
      maxStorageBytes: company.max_storage_bytes?.toString(),
      createdAt: company.created_at?.toISOString(),
      updatedAt: company.updated_at?.toISOString(),
    };
  }
}

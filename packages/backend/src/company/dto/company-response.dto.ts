import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company, CompanyPlan } from '../entities/company.entity';

export class CompanyResponseDto {
  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Company name',
    example: 'ThreadFileSharing Company',
  })
  name: string;

  @ApiProperty({
    description: 'Company slug',
    example: 'threadfile-sharing',
  })
  slug: string;

  @ApiProperty({
    description: 'Company plan',
    example: 'free',
    enum: CompanyPlan,
  })
  plan: CompanyPlan;

  @ApiProperty({
    description: 'Maximum number of users',
    example: 100,
  })
  maxUsers: number;

  @ApiProperty({
    description: 'Maximum storage in bytes',
    example: 5368709120,
  })
  maxStorageBytes: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-12-19T10:00:00Z',
  })
  updatedAt: string;

  /**
   * Create CompanyResponseDto from entity
   */
  static fromEntity(entity: Company): CompanyResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      plan: entity.plan,
      maxUsers: entity.maxUsers,
      maxStorageBytes: Number(entity.maxStorageBytes),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

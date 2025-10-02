import { ApiProperty } from '@nestjs/swagger';

export class StorageQuotaDto {
  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId: string;

  @ApiProperty({
    description: 'Storage limit in bytes',
    example: 53687091200, // 50GB
  })
  storageLimitBytes: number;

  @ApiProperty({
    description: 'Storage used in bytes',
    example: 1073741824, // 1GB
  })
  storageUsedBytes: number;

  @ApiProperty({
    description: 'Storage available in bytes',
    example: 52613349376, // 49GB
  })
  storageAvailableBytes: number;

  @ApiProperty({
    description: 'Storage used percentage',
    example: 2.0,
  })
  storageUsedPercent: number;

  @ApiProperty({
    description: 'Total number of files',
    example: 1250,
  })
  fileCount: number;
}

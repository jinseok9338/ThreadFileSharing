import { StorageQuota } from '../entities/storage-quota.entity';
import { Company } from '../../company/entities/company.entity';
import Big from 'big.js';

export class StorageQuotaResponseDto {
  id: string;
  companyId: string;
  storageLimitBytes: number;
  storageUsedBytes: number;
  storageAvailableBytes: number;
  storageUsedPercent: number;
  fileCount: number;
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  company?: {
    id: string;
    name: string;
    slug: string;
  };

  // Computed properties
  get storageRemainingBytes(): number {
    return Math.max(0, this.storageLimitBytes - this.storageUsedBytes);
  }

  get isNearLimit(): boolean {
    return this.storageUsedPercent >= 80;
  }

  get isOverLimit(): boolean {
    return this.storageUsedPercent >= 100;
  }

  // Helper methods for display
  get storageLimitFormatted(): string {
    return this.formatBytes(this.storageLimitBytes);
  }

  get storageUsedFormatted(): string {
    return this.formatBytes(this.storageUsedBytes);
  }

  get storageRemainingFormatted(): string {
    return this.formatBytes(this.storageRemainingBytes);
  }

  private formatBytes(bytes: bigint | number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = new Big(bytes.toString());
    let unitIndex = 0;

    const KB = new Big(1024);
    while (size.gte(KB) && unitIndex < units.length - 1) {
      size = size.div(KB);
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  static fromEntity(storageQuota: StorageQuota): StorageQuotaResponseDto {
    const dto = new StorageQuotaResponseDto();
    dto.id = storageQuota.id;
    dto.companyId = storageQuota.companyId;
    dto.storageLimitBytes = storageQuota.storageLimitBytes;
    dto.storageUsedBytes = storageQuota.storageUsedBytes;
    dto.fileCount = storageQuota.fileCount;
    dto.lastCalculatedAt = storageQuota.lastCalculatedAt;
    dto.createdAt = storageQuota.createdAt;
    dto.updatedAt = storageQuota.updatedAt;

    // Populate relations if available
    if (storageQuota.company) {
      dto.company = {
        id: storageQuota.company.id,
        name: storageQuota.company.name,
        slug: storageQuota.company.slug,
      };
    }

    return dto;
  }
}

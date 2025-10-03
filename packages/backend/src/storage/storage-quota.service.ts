import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { File } from '../file/entities/file.entity';
import { StorageQuota } from '../file/entities/storage-quota.entity';
import { STORAGE_LIMITS } from '../constants/permissions';
import Big from 'big.js';

/**
 * Storage Quota Service
 * Manages company storage limits and usage tracking
 */
@Injectable()
export class StorageQuotaService {
  private readonly logger = new Logger(StorageQuotaService.name);

  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(StorageQuota)
    private storageQuotaRepository: Repository<StorageQuota>,
  ) {}

  /**
   * Get company storage quota information
   */
  async getStorageQuota(companyId: string) {
    this.logger.log(`getStorageQuota called for company: ${companyId}`);

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException({
        code: 'COMPANY_NOT_FOUND',
        message: 'Company not found',
      });
    }

    const storageLimitBytes = Number(company.maxStorageBytes);

    // Calculate actual storage usage from files
    const result = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(CAST(file.sizeBytes AS BIGINT))', 'totalSize')
      .where('file.companyId = :companyId', { companyId })
      .andWhere('file.deletedAt IS NULL')
      .getRawOne();

    const storageUsedBytes = new Big(result?.totalSize || 0);
    const storageLimitBig = new Big(storageLimitBytes);
    const storageAvailableBytes = storageLimitBig.minus(storageUsedBytes);
    const storageUsedPercent = storageLimitBig.gt(0) 
      ? storageUsedBytes.div(storageLimitBig).times(100) 
      : new Big(0);

    // Get file count
    const fileCount = await this.fileRepository.count({
      where: {
        companyId: companyId,
        deletedAt: IsNull(),
      },
    });

    // Update cached storage quota with real-time calculated values
    await this.updateStorageQuotaCache(companyId, {
      storageUsedBytes: storageUsedBytes.toNumber(),
      fileCount,
      storageLimitBytes,
    });

    return {
      companyId,
      storageLimitBytes: Number(storageLimitBytes),
      storageUsedBytes: storageUsedBytes.toNumber(),
      storageAvailableBytes: storageAvailableBytes.toNumber(),
      storageUsedPercent: Math.round(storageUsedPercent.toNumber() * 100) / 100,
      fileCount,
    };
  }

  /**
   * Check if file upload would exceed quota
   */
  async canUploadFile(
    companyId: string,
    fileSizeBytes: number | bigint,
  ): Promise<boolean> {
    const quota = await this.getStorageQuota(companyId);
    const availableBytes = new Big(quota.storageAvailableBytes);
    const fileSize = new Big(fileSizeBytes.toString());
    return availableBytes.gte(fileSize);
  }

  /**
   * Validate file upload against quota
   */
  async validateFileUpload(
    companyId: string,
    fileSizeBytes: number | bigint,
  ): Promise<void> {
    const canUpload = await this.canUploadFile(companyId, fileSizeBytes);

    if (!canUpload) {
      const quota = await this.getStorageQuota(companyId);
      const currentUsage = new Big(quota.storageUsedBytes);
      const limit = new Big(quota.storageLimitBytes);
      const additionalSize = new Big(fileSizeBytes.toString());
      
      throw new BadRequestException({
        code: 'STORAGE_QUOTA_EXCEEDED',
        message: `Storage quota exceeded. Current usage: ${this.formatBytes(currentUsage)}, Limit: ${this.formatBytes(limit)}, Additional size: ${this.formatBytes(additionalSize)}`,
        data: {
          fileSize: fileSizeBytes,
          availableSpace: quota.storageAvailableBytes,
          quotaUsedPercent: quota.storageUsedPercent,
        },
      });
    }
  }

  /**
   * Update storage usage after file upload
   */
  async addStorageUsage(
    companyId: string,
    fileSizeBytes: number,
  ): Promise<void> {
    // NOTE: Storage usage is now calculated dynamically from File entities
    // in CompanyService.getStats(). This method is kept for future use
    // when real-time storage tracking is needed.
    this.logger.debug(
      `Storage usage added: ${fileSizeBytes} bytes for company ${companyId}`,
    );
  }

  /**
   * Update storage usage after file deletion
   */
  async removeStorageUsage(
    companyId: string,
    fileSizeBytes: number,
  ): Promise<void> {
    // NOTE: Storage usage is now calculated dynamically from File entities
    // in CompanyService.getStats(). This method is kept for future use
    // when real-time storage tracking is needed.
    this.logger.debug(
      `Storage usage removed: ${fileSizeBytes} bytes for company ${companyId}`,
    );
  }

  /**
   * Check if company is approaching quota limit
   */
  async isNearQuotaLimit(
    companyId: string,
    thresholdPercent: number = 90,
  ): Promise<boolean> {
    const quota = await this.getStorageQuota(companyId);
    return quota.storageUsedPercent >= thresholdPercent;
  }

  /**
   * Get quota warning status
   */
  async getQuotaWarningStatus(companyId: string) {
    const quota = await this.getStorageQuota(companyId);

    let status = 'OK';
    let message = 'Storage usage is normal';

    if (quota.storageUsedPercent >= 95) {
      status = 'CRITICAL';
      message = 'Storage quota is critically low';
    } else if (quota.storageUsedPercent >= 85) {
      status = 'WARNING';
      message = 'Storage quota is running low';
    }

    return {
      ...quota,
      status,
      message,
    };
  }

  /**
   * Update company storage limit
   */
  async updateStorageLimit(
    companyId: string,
    newLimitGb: number,
  ): Promise<void> {
    await this.companyRepository.update(
      { id: companyId },
      { maxStorageBytes: BigInt(newLimitGb * 1024 * 1024 * 1024) },
    );
  }

  /**
   * Update storage quota cache with real-time calculated values
   */
  private async updateStorageQuotaCache(
    companyId: string,
    data: {
      storageUsedBytes: number;
      fileCount: number;
      storageLimitBytes: number;
    },
  ): Promise<void> {
    try {
      const existingQuota = await this.storageQuotaRepository.findOne({
        where: { companyId },
      });

      if (existingQuota) {
        // Update existing cache
        await this.storageQuotaRepository.update(existingQuota.id, {
          storageUsedBytes: data.storageUsedBytes,
          fileCount: data.fileCount,
          storageLimitBytes: data.storageLimitBytes,
          lastCalculatedAt: new Date(),
        });
      } else {
        // Create new cache entry
        const newQuota = this.storageQuotaRepository.create({
          companyId,
          storageUsedBytes: data.storageUsedBytes,
          fileCount: data.fileCount,
          storageLimitBytes: data.storageLimitBytes,
          lastCalculatedAt: new Date(),
        });
        await this.storageQuotaRepository.save(newQuota);
      }
    } catch (error) {
      console.error('Failed to update storage quota cache:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Recalculate storage usage from actual files
   */
  async recalculateStorageUsage(companyId: string): Promise<void> {
    const result = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(CAST(file.sizeBytes AS BIGINT))', 'totalSize')
      .where('file.companyId = :companyId', { companyId })
      .andWhere('file.deletedAt IS NULL')
      .getRawOne();

    const totalSize = result?.totalSize ? BigInt(result.totalSize) : BigInt(0);

    console.log(
      `recalculateStorageUsage: Calculated storage usage for company ${companyId}: ${totalSize} bytes`,
    );
  }

  /**
   * Check if file size is within allowed limits
   */
  validateFileSize(fileSizeBytes: number): boolean {
    const maxSizeBytes = STORAGE_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024;
    return fileSizeBytes <= maxSizeBytes;
  }

  /**
   * Validate multiple file upload
   */
  async validateMultipleFileUpload(
    companyId: string,
    files: Array<{ size: number }>,
  ): Promise<void> {
    if (files.length > STORAGE_LIMITS.MAX_FILES_PER_UPLOAD) {
      throw new BadRequestException({
        code: 'TOO_MANY_FILES',
        message: `Cannot upload more than ${STORAGE_LIMITS.MAX_FILES_PER_UPLOAD} files at once`,
      });
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Check individual file sizes
    for (const file of files) {
      if (!this.validateFileSize(file.size)) {
        throw new BadRequestException({
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds ${STORAGE_LIMITS.MAX_FILE_SIZE_MB}MB limit`,
        });
      }
    }

    // Check total size against quota
    await this.validateFileUpload(companyId, totalSize);
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: Big): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = new Big(bytes);
    let unitIndex = 0;

    const KB = new Big(1024);
    while (size.gte(KB) && unitIndex < units.length - 1) {
      size = size.div(KB);
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

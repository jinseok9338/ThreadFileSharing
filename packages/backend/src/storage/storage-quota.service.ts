import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { File } from '../file/entities/file.entity';
import { STORAGE_LIMITS } from '../constants/permissions';

/**
 * Storage Quota Service
 * Manages company storage limits and usage tracking
 */
@Injectable()
export class StorageQuotaService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  /**
   * Get company storage quota information
   */
  async getStorageQuota(companyId: string) {
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
      .select('SUM(file.sizeBytes)', 'totalSize')
      .where('file.companyId = :companyId', { companyId })
      .andWhere('file.deletedAt IS NULL')
      .getRawOne();

    const storageUsedBytes = Number(result?.totalSize || 0);
    const storageAvailableBytes = storageLimitBytes - storageUsedBytes;
    const storageUsedPercent =
      storageLimitBytes > 0 ? (storageUsedBytes / storageLimitBytes) * 100 : 0;

    // Get file count
    const fileCount = await this.fileRepository.count({
      where: {
        chatroomId: companyId,
        deletedAt: IsNull(),
      },
    });

    return {
      companyId,
      storageLimitBytes: Number(storageLimitBytes),
      storageUsedBytes: Number(storageUsedBytes),
      storageAvailableBytes: Number(storageAvailableBytes),
      storageUsedPercent: Math.round(storageUsedPercent * 100) / 100,
      fileCount,
    };
  }

  /**
   * Check if file upload would exceed quota
   */
  async canUploadFile(
    companyId: string,
    fileSizeBytes: number,
  ): Promise<boolean> {
    const quota = await this.getStorageQuota(companyId);
    return quota.storageAvailableBytes >= fileSizeBytes;
  }

  /**
   * Validate file upload against quota
   */
  async validateFileUpload(
    companyId: string,
    fileSizeBytes: number,
  ): Promise<void> {
    const canUpload = await this.canUploadFile(companyId, fileSizeBytes);

    if (!canUpload) {
      const quota = await this.getStorageQuota(companyId);
      throw new BadRequestException({
        code: 'STORAGE_QUOTA_EXCEEDED',
        message: 'File upload would exceed company storage quota',
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
    // TODO: Implement storage usage tracking
    // await this.companyRepository.increment(
    //   { id: companyId },
    //   'storageUsedBytes',
    //   fileSizeBytes,
    // );
  }

  /**
   * Update storage usage after file deletion
   */
  async removeStorageUsage(
    companyId: string,
    fileSizeBytes: number,
  ): Promise<void> {
    // TODO: Implement storage usage tracking
    // await this.companyRepository.decrement(
    //   { id: companyId },
    //   'storageUsedBytes',
    //   fileSizeBytes,
    // );
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
   * Recalculate storage usage from actual files
   */
  async recalculateStorageUsage(companyId: string): Promise<void> {
    const result = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(file.sizeBytes)', 'totalSize')
      .where('file.chatroomId = :companyId', { companyId })
      .andWhere('file.deletedAt IS NULL')
      .getRawOne();

    const totalSize = result?.totalSize ? BigInt(result.totalSize) : BigInt(0);

    // Note: We'll need to add storageUsedBytes field to Company entity if needed
    // For now, this method is disabled as storageUsedBytes doesn't exist in current schema
    console.warn(
      'recalculateStorageUsage: storageUsedBytes field not available in current schema',
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
}

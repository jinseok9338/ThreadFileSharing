import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { StorageQuota } from '../entities/storage-quota.entity';
import { Company } from '../../company/entities/company.entity';
import { File } from '../entities/file.entity';
import { StorageQuotaResponseDto } from '../dto';
import { CompanyPlan } from '../../company/entities/company.entity';

@Injectable()
export class StorageQuotaService {
  private readonly logger = new Logger(StorageQuotaService.name);

  constructor(
    @InjectRepository(StorageQuota)
    private readonly storageQuotaRepository: Repository<StorageQuota>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {}

  async getStorageQuota(companyId: string): Promise<StorageQuotaResponseDto> {
    this.logger.log(`Getting storage quota for company ${companyId}`);

    try {
      let storageQuota = await this.storageQuotaRepository.findOne({
        where: { companyId },
        relations: ['company'],
      });

      if (!storageQuota) {
        // Create storage quota if it doesn't exist
        storageQuota = await this.createStorageQuota(companyId);
      }

      return StorageQuotaResponseDto.fromEntity(storageQuota);
    } catch (error) {
      this.logger.error(`Failed to get storage quota: ${error.message}`);
      throw error;
    }
  }

  async updateStorageUsage(
    companyId: string,
    sizeChange: number,
    fileCountChange: number,
  ): Promise<StorageQuotaResponseDto> {
    this.logger.log(
      `Updating storage usage for company ${companyId}: ${sizeChange} bytes, ${fileCountChange} files`,
    );

    try {
      let storageQuota = await this.storageQuotaRepository.findOne({
        where: { companyId },
        relations: ['company'],
      });

      if (!storageQuota) {
        storageQuota = await this.createStorageQuota(companyId);
      }

      // Update usage
      storageQuota.storageUsedBytes = Math.max(
        0,
        storageQuota.storageUsedBytes + sizeChange,
      );
      storageQuota.fileCount = Math.max(
        0,
        storageQuota.fileCount + fileCountChange,
      );
      storageQuota.lastCalculatedAt = new Date();

      const updatedQuota = await this.storageQuotaRepository.save(storageQuota);

      return StorageQuotaResponseDto.fromEntity(updatedQuota);
    } catch (error) {
      this.logger.error(`Failed to update storage usage: ${error.message}`);
      throw error;
    }
  }

  async checkStorageQuota(
    companyId: string,
    additionalSize: number,
  ): Promise<void> {
    this.logger.log(
      `Checking storage quota for company ${companyId} with additional size ${additionalSize}`,
    );

    try {
      const storageQuota = await this.getStorageQuota(companyId);

      const projectedUsage = storageQuota.storageUsedBytes + additionalSize;

      if (projectedUsage > storageQuota.storageLimitBytes) {
        throw new BadRequestException(
          `Storage quota exceeded. Current usage: ${storageQuota.storageUsedFormatted}, ` +
            `Limit: ${storageQuota.storageLimitFormatted}, ` +
            `Additional size: ${this.formatBytes(additionalSize)}`,
        );
      }

      // Check if approaching limit (80%)
      const usagePercent =
        (projectedUsage / storageQuota.storageLimitBytes) * 100;
      if (usagePercent >= 80) {
        this.logger.warn(
          `Company ${companyId} is approaching storage limit: ${usagePercent.toFixed(2)}%`,
        );
      }
    } catch (error) {
      this.logger.error(`Storage quota check failed: ${error.message}`);
      throw error;
    }
  }

  async recalculateStorageQuota(
    companyId: string,
  ): Promise<StorageQuotaResponseDto> {
    this.logger.log(`Recalculating storage quota for company ${companyId}`);

    try {
      // Get all files for the company
      const files = await this.fileRepository.find({
        where: { companyId, deletedAt: IsNull() },
        select: ['sizeBytes'],
      });

      // Calculate total usage
      const totalSize = files.reduce((sum, file) => sum + file.sizeBytes, 0);
      const fileCount = files.length;

      // Get or create storage quota
      let storageQuota = await this.storageQuotaRepository.findOne({
        where: { companyId },
        relations: ['company'],
      });

      if (!storageQuota) {
        storageQuota = await this.createStorageQuota(companyId);
      }

      // Update with calculated values
      storageQuota.storageUsedBytes = totalSize;
      storageQuota.fileCount = fileCount;
      storageQuota.lastCalculatedAt = new Date();

      const updatedQuota = await this.storageQuotaRepository.save(storageQuota);

      this.logger.log(
        `Storage quota recalculated for company ${companyId}: ` +
          `${this.formatBytes(totalSize)} used, ${fileCount} files`,
      );

      return StorageQuotaResponseDto.fromEntity(updatedQuota);
    } catch (error) {
      this.logger.error(
        `Failed to recalculate storage quota: ${error.message}`,
      );
      throw error;
    }
  }

  async updateStorageLimit(
    companyId: string,
    newLimitBytes: number,
  ): Promise<StorageQuotaResponseDto> {
    this.logger.log(
      `Updating storage limit for company ${companyId} to ${this.formatBytes(newLimitBytes)}`,
    );

    try {
      let storageQuota = await this.storageQuotaRepository.findOne({
        where: { companyId },
        relations: ['company'],
      });

      if (!storageQuota) {
        storageQuota = await this.createStorageQuota(companyId);
      }

      storageQuota.storageLimitBytes = newLimitBytes;
      storageQuota.lastCalculatedAt = new Date();

      const updatedQuota = await this.storageQuotaRepository.save(storageQuota);

      return StorageQuotaResponseDto.fromEntity(updatedQuota);
    } catch (error) {
      this.logger.error(`Failed to update storage limit: ${error.message}`);
      throw error;
    }
  }

  async getStorageQuotaByPlan(plan: CompanyPlan): Promise<number> {
    // Storage limits by plan (in bytes)
    const planLimits: Record<CompanyPlan, number> = {
      [CompanyPlan.FREE]: 1 * 1024 * 1024 * 1024, // 1GB
      [CompanyPlan.PRO]: 100 * 1024 * 1024 * 1024, // 100GB
      [CompanyPlan.ENTERPRISE]: 1024 * 1024 * 1024 * 1024, // 1TB
    };

    return planLimits[plan] || planLimits[CompanyPlan.FREE];
  }

  async createStorageQuota(companyId: string): Promise<StorageQuota> {
    this.logger.log(`Creating storage quota for company ${companyId}`);

    try {
      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const storageLimitBytes = await this.getStorageQuotaByPlan(company.plan);

      const storageQuota = this.storageQuotaRepository.create({
        companyId,
        storageLimitBytes,
        storageUsedBytes: 0,
        fileCount: 0,
        lastCalculatedAt: new Date(),
      });

      const savedQuota = await this.storageQuotaRepository.save(storageQuota);

      this.logger.log(
        `Storage quota created for company ${companyId}: ${this.formatBytes(storageLimitBytes)}`,
      );

      return savedQuota;
    } catch (error) {
      this.logger.error(`Failed to create storage quota: ${error.message}`);
      throw error;
    }
  }

  async cleanupExpiredFiles(): Promise<void> {
    this.logger.log('Starting cleanup of expired files');

    try {
      const expiredFiles = await this.fileRepository
        .createQueryBuilder('file')
        .leftJoin('file.associations', 'association')
        .where('association.expiresAt < :now', { now: new Date() })
        .andWhere('file.deletedAt IS NULL')
        .getMany();

      for (const file of expiredFiles) {
        // Soft delete the file
        await this.fileRepository.softDelete(file.id);

        // Update storage quota
        await this.updateStorageUsage(file.companyId, -file.sizeBytes, -1);

        this.logger.log(`Cleaned up expired file: ${file.id}`);
      }

      this.logger.log(`Cleaned up ${expiredFiles.length} expired files`);
    } catch (error) {
      this.logger.error(`Failed to cleanup expired files: ${error.message}`);
    }
  }

  async getStorageUsageReport(companyId: string): Promise<{
    quota: StorageQuotaResponseDto;
    topFiles: Array<{
      id: string;
      name: string;
      size: number;
      sizeFormatted: string;
    }>;
    usageByType: Record<
      string,
      { count: number; size: number; sizeFormatted: string }
    >;
  }> {
    this.logger.log(`Generating storage usage report for company ${companyId}`);

    try {
      const quota = await this.getStorageQuota(companyId);

      // Get top 10 largest files
      const topFiles = await this.fileRepository
        .createQueryBuilder('file')
        .where('file.companyId = :companyId', { companyId })
        .andWhere('file.deletedAt IS NULL')
        .orderBy('file.sizeBytes', 'DESC')
        .limit(10)
        .getMany();

      // Get usage by file type
      const usageByType = await this.fileRepository
        .createQueryBuilder('file')
        .select('file.mimeType', 'mimeType')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(file.sizeBytes)', 'totalSize')
        .where('file.companyId = :companyId', { companyId })
        .andWhere('file.deletedAt IS NULL')
        .groupBy('file.mimeType')
        .orderBy('totalSize', 'DESC')
        .getRawMany();

      const formattedTopFiles = topFiles.map((file) => ({
        id: file.id,
        name: file.originalName,
        size: file.sizeBytes,
        sizeFormatted: this.formatBytes(file.sizeBytes),
      }));

      const formattedUsageByType = usageByType.reduce(
        (acc, item) => {
          acc[item.mimeType] = {
            count: parseInt(item.count),
            size: parseInt(item.totalSize),
            sizeFormatted: this.formatBytes(parseInt(item.totalSize)),
          };
          return acc;
        },
        {} as Record<
          string,
          { count: number; size: number; sizeFormatted: string }
        >,
      );

      return {
        quota,
        topFiles: formattedTopFiles,
        usageByType: formattedUsageByType,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate storage usage report: ${error.message}`,
      );
      throw error;
    }
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

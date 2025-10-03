import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import {
  FileAssociation,
  AccessType,
} from '../entities/file-association.entity';
import { DownloadToken } from '../entities/download-token.entity';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { S3ClientService } from './s3-client.service';
import { StorageQuotaService } from './storage-quota.service';
import {
  FileQueryDto,
  FileResponseDto,
  FileListResponseDto,
  DownloadTokenResponseDto,
} from '../dto';
import { CompanyRole } from '../../constants/permissions';

@Injectable()
export class FileManagementService {
  private readonly logger = new Logger(FileManagementService.name);

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(FileAssociation)
    private readonly fileAssociationRepository: Repository<FileAssociation>,
    @InjectRepository(DownloadToken)
    private readonly downloadTokenRepository: Repository<DownloadToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly s3ClientService: S3ClientService,
    private readonly storageQuotaService: StorageQuotaService,
  ) {}

  async getFiles(
    query: FileQueryDto,
    userId: string,
  ): Promise<FileListResponseDto> {
    this.logger.log(`Getting files with query for user ${userId}`);

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['company'],
      });

      if (!user || !user.company) {
        throw new NotFoundException('User or company not found');
      }

      const queryBuilder = this.fileRepository
        .createQueryBuilder('file')
        .leftJoinAndSelect('file.uploader', 'uploader')
        .leftJoinAndSelect('file.company', 'company')
        .leftJoinAndSelect('file.thread', 'thread')
        .leftJoinAndSelect('file.chatRoom', 'chatRoom')
        .leftJoinAndSelect('file.associations', 'associations')
        .where('file.companyId = :companyId', { companyId: user.company.id });

      // Apply filters
      if (query.threadId) {
        queryBuilder.andWhere('file.threadId = :threadId', {
          threadId: query.threadId,
        });
      }

      if (query.chatroomId) {
        queryBuilder.andWhere('file.chatroomId = :chatroomId', {
          chatroomId: query.chatroomId,
        });
      }

      if (query.uploadedBy) {
        queryBuilder.andWhere('file.uploadedBy = :uploadedBy', {
          uploadedBy: query.uploadedBy,
        });
      }

      if (query.processingStatus) {
        queryBuilder.andWhere('file.processingStatus = :processingStatus', {
          processingStatus: query.processingStatus,
        });
      }

      if (query.mimeType) {
        queryBuilder.andWhere('file.mimeType = :mimeType', {
          mimeType: query.mimeType,
        });
      }

      if (query.search) {
        queryBuilder.andWhere(
          '(file.originalName ILIKE :search OR file.displayName ILIKE :search)',
          { search: `%${query.search}%` },
        );
      }

      if (!query.includeDeleted) {
        queryBuilder.andWhere('file.deletedAt IS NULL');
      }

      // Apply cursor pagination
      if (query.lastIndex) {
        queryBuilder.andWhere('file.id > :lastIndex', {
          lastIndex: query.lastIndex,
        });
      }

      queryBuilder.orderBy('file.createdAt', 'DESC').limit(query.limit || 20);

      const [files, total] = await queryBuilder.getManyAndCount();

      // Check for next page
      const hasNext = files.length === query.limit;
      const nextIndex = hasNext ? files[files.length - 1].id : undefined;

      return FileListResponseDto.fromFiles(
        files.map((file) => FileResponseDto.fromEntity(file)),
        total,
        hasNext,
        nextIndex,
      );
    } catch (error) {
      this.logger.error(`Failed to get files: ${error.message}`);
      throw error;
    }
  }

  async getFileById(fileId: string, userId: string): Promise<FileResponseDto> {
    this.logger.log(`Getting file ${fileId} for user ${userId}`);

    try {
      const file = await this.fileRepository.findOne({
        where: { id: fileId },
        relations: [
          'uploader',
          'company',
          'thread',
          'chatRoom',
          'associations',
        ],
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Check access permissions
      await this.checkFileAccess(file, userId);

      return FileResponseDto.fromEntity(file);
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    this.logger.log(`Deleting file ${fileId} by user ${userId}`);

    try {
      const file = await this.fileRepository.findOne({
        where: { id: fileId },
        relations: ['uploader', 'company'],
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Check permissions
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['company'],
      });

      if (!user || !user.company) {
        throw new NotFoundException('User or company not found');
      }

      // Only file uploader, company admin, or owner can delete
      const canDelete =
        file.uploadedBy === userId ||
        user.companyRole === CompanyRole.ADMIN ||
        user.companyRole === CompanyRole.OWNER;

      if (!canDelete) {
        throw new ForbiddenException(
          'You do not have permission to delete this file',
        );
      }

      // Soft delete the file
      await this.fileRepository.softDelete(fileId);

      // Update storage quota
      await this.storageQuotaService.updateStorageUsage(
        user.company.id,
        -file.sizeBytes,
        -1,
      );

      this.logger.log(`File ${fileId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw error;
    }
  }

  async updateFileMetadata(
    fileId: string,
    metadata: Record<string, unknown>,
    userId: string,
  ): Promise<FileResponseDto> {
    this.logger.log(`Updating file metadata ${fileId} by user ${userId}`);

    try {
      const file = await this.fileRepository.findOne({
        where: { id: fileId },
        relations: ['uploader', 'company', 'thread', 'chatRoom'],
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Check permissions
      await this.checkFileAccess(file, userId);

      // Update metadata
      file.metadata = { ...file.metadata, ...metadata };
      const updatedFile = await this.fileRepository.save(file);

      return FileResponseDto.fromEntity(updatedFile);
    } catch (error) {
      this.logger.error(`Failed to update file metadata: ${error.message}`);
      throw error;
    }
  }

  async createDownloadToken(
    fileId: string,
    maxDownloads: number = 1,
    expiresIn: string = '1h',
    userId: string,
  ): Promise<DownloadTokenResponseDto> {
    this.logger.log(
      `Creating download token for file ${fileId} by user ${userId}`,
    );

    try {
      const file = await this.fileRepository.findOne({
        where: { id: fileId },
        relations: ['uploader', 'company'],
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Check access permissions
      await this.checkFileAccess(file, userId);

      // Generate unique token
      const token = this.generateDownloadToken();

      // Parse expires in
      const expiresAt = this.parseExpiresIn(expiresIn);

      // Create download token
      const downloadToken = this.downloadTokenRepository.create({
        fileId,
        userId,
        token,
        expiresAt,
        maxDownloads,
      });

      const savedToken = await this.downloadTokenRepository.save(downloadToken);

      return DownloadTokenResponseDto.fromEntity(savedToken);
    } catch (error) {
      this.logger.error(`Failed to create download token: ${error.message}`);
      throw error;
    }
  }

  async downloadFileByToken(
    token: string,
  ): Promise<{ stream: any; file: File }> {
    this.logger.log(`Downloading file by token: ${token}`);

    try {
      const downloadToken = await this.downloadTokenRepository.findOne({
        where: { token },
        relations: ['file', 'user'],
      });

      if (!downloadToken) {
        throw new NotFoundException('Download token not found');
      }

      if (downloadToken.isExpired) {
        throw new BadRequestException('Download token has expired');
      }

      if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
        throw new BadRequestException('Download limit exceeded');
      }

      // Update download count
      downloadToken.downloadCount += 1;
      downloadToken.lastUsedAt = new Date();
      await this.downloadTokenRepository.save(downloadToken);

      // Get file stream from S3/MinIO
      const stream = await this.s3ClientService.downloadFile(
        downloadToken.file.storageKey,
      );

      return {
        stream,
        file: downloadToken.file,
      };
    } catch (error) {
      this.logger.error(`Failed to download file by token: ${error.message}`);
      throw error;
    }
  }

  async searchFiles(
    searchTerm: string,
    userId: string,
    limit: number = 20,
  ): Promise<FileResponseDto[]> {
    this.logger.log(
      `Searching files with term "${searchTerm}" for user ${userId}`,
    );

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['company'],
      });

      if (!user || !user.company) {
        throw new NotFoundException('User or company not found');
      }

      const files = await this.fileRepository
        .createQueryBuilder('file')
        .leftJoinAndSelect('file.uploader', 'uploader')
        .leftJoinAndSelect('file.company', 'company')
        .leftJoinAndSelect('file.thread', 'thread')
        .leftJoinAndSelect('file.chatRoom', 'chatRoom')
        .where('file.companyId = :companyId', { companyId: user.company.id })
        .andWhere('file.deletedAt IS NULL')
        .andWhere(
          '(file.originalName ILIKE :search OR file.displayName ILIKE :search OR file.mimeType ILIKE :search)',
          { search: `%${searchTerm}%` },
        )
        .orderBy('file.createdAt', 'DESC')
        .limit(limit)
        .getMany();

      return files.map((file) => FileResponseDto.fromEntity(file));
    } catch (error) {
      this.logger.error(`Failed to search files: ${error.message}`);
      throw error;
    }
  }

  private async checkFileAccess(file: File, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });

    if (!user || !user.company) {
      throw new NotFoundException('User or company not found');
    }

    // Check company access
    if (file.companyId !== user.company.id) {
      throw new ForbiddenException('You do not have access to this file');
    }

    // Check if user has access through file associations
    const hasAssociation = await this.fileAssociationRepository.findOne({
      where: {
        fileId: file.id,
        sharedBy: userId,
      },
    });

    // If user is not the uploader and has no association, check company role
    if (file.uploadedBy !== userId && !hasAssociation) {
      if (user.companyRole === CompanyRole.MEMBER) {
        throw new ForbiddenException('You do not have access to this file');
      }
    }
  }

  private generateDownloadToken(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  private parseExpiresIn(expiresIn: string): Date {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([hmd])$/);

    if (!match) {
      throw new BadRequestException(
        'Invalid expires in format. Use format like "1h", "30m", "1d"',
      );
    }

    const num = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h':
        return new Date(now.getTime() + num * 60 * 60 * 1000);
      case 'm':
        return new Date(now.getTime() + num * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + num * 24 * 60 * 60 * 1000);
      default:
        throw new BadRequestException('Invalid time unit. Use h, m, or d');
    }
  }
}

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { File } from '../entities/file.entity';
import {
  UploadSession,
  SessionStatus,
} from '../entities/upload-session.entity';
import {
  UploadProgress,
  UploadStatus,
} from '../entities/upload-progress.entity';
import {
  FileAssociation,
  AccessType,
} from '../entities/file-association.entity';
import { StorageQuota } from '../entities/storage-quota.entity';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { S3ClientService } from './s3-client.service';
import { StorageQuotaService } from './storage-quota.service';
import {
  FileUploadRequestDto,
  FileUploadResponseDto,
  FileResponseDto,
  UploadSessionResponseDto,
} from '../dto';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(UploadSession)
    private readonly uploadSessionRepository: Repository<UploadSession>,
    @InjectRepository(UploadProgress)
    private readonly uploadProgressRepository: Repository<UploadProgress>,
    @InjectRepository(FileAssociation)
    private readonly fileAssociationRepository: Repository<FileAssociation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly s3ClientService: S3ClientService,
    private readonly storageQuotaService: StorageQuotaService,
    private readonly configService: ConfigService,
  ) {}

  async uploadSingleFile(
    file: Express.Multer.File,
    uploadRequest: FileUploadRequestDto,
    userId: string,
  ): Promise<FileUploadResponseDto> {
    this.logger.log(
      `Starting single file upload: ${file.originalname} by user ${userId}`,
    );

    try {
      // Get user and company
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['company'],
      });

      if (!user || !user.company) {
        throw new NotFoundException('User or company not found');
      }

      // Check storage quota
      await this.storageQuotaService.checkStorageQuota(
        user.company.id,
        file.size,
      );

      // Generate file hash
      const hash = this.generateFileHash(file.buffer);

      // Check for duplicate files
      const existingFile = await this.fileRepository.findOne({
        where: {
          hash,
          companyId: user.company.id,
          deletedAt: IsNull(),
        },
      });

      if (existingFile) {
        // Create file association for existing file
        await this.createFileAssociation(
          existingFile.id,
          uploadRequest,
          userId,
        );
        return FileUploadResponseDto.singleFile(
          FileResponseDto.fromEntity(existingFile),
          'File already exists, association created',
        );
      }

      // Generate storage key
      const storageKey = this.s3ClientService.generateStorageKey(
        user.company.id,
        userId,
        file.originalname,
      );

      // Upload to S3/MinIO
      await this.s3ClientService.uploadFile(
        storageKey,
        file.buffer,
        file.mimetype,
        {
          originalName: file.originalname,
          uploadedBy: userId,
          companyId: user.company.id,
        },
      );

      // Create file record
      const fileEntity = this.fileRepository.create({
        companyId: user.company.id,
        threadId: uploadRequest.threadId,
        chatroomId: uploadRequest.chatroomId,
        uploadedBy: userId,
        originalName: file.originalname,
        displayName: uploadRequest.displayName,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        hash,
        storageKey,
        storageBucket: this.s3ClientService['bucketName'],
        metadata: uploadRequest.metadata,
      });

      const savedFile = await this.fileRepository.save(fileEntity);

      // Create file association
      await this.createFileAssociation(savedFile.id, uploadRequest, userId);

      // Update storage quota
      await this.storageQuotaService.updateStorageUsage(
        user.company.id,
        file.size,
        1,
      );

      // Generate download URL
      const downloadUrl =
        await this.s3ClientService.getSignedDownloadUrl(storageKey);

      // Update file with download URL
      savedFile.downloadUrl = downloadUrl;
      await this.fileRepository.save(savedFile);

      this.logger.log(`Single file upload completed: ${savedFile.id}`);

      return FileUploadResponseDto.singleFile(
        FileResponseDto.fromEntity(savedFile),
        'File uploaded successfully',
      );
    } catch (error) {
      this.logger.error(`Single file upload failed: ${error.message}`);
      throw error;
    }
  }

  async createUploadSession(
    files: Express.Multer.File[],
    uploadRequest: FileUploadRequestDto,
    userId: string,
  ): Promise<FileUploadResponseDto> {
    this.logger.log(
      `Creating upload session for ${files.length} files by user ${userId}`,
    );

    try {
      // Get user and company
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['company'],
      });

      if (!user || !user.company) {
        throw new NotFoundException('User or company not found');
      }

      // Check total storage quota
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      await this.storageQuotaService.checkStorageQuota(
        user.company.id,
        totalSize,
      );

      // Create upload session
      const uploadSession = this.uploadSessionRepository.create({
        userId,
        companyId: user.company.id,
        sessionName:
          uploadRequest.sessionName ||
          `Upload Session ${new Date().toISOString()}`,
        totalFiles: files.length,
        totalSize,
        status: SessionStatus.ACTIVE,
      });

      const savedSession =
        await this.uploadSessionRepository.save(uploadSession);

      // Create upload progress records
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadProgress = this.uploadProgressRepository.create({
          uploadSessionId: savedSession.id,
          userId,
          totalBytes: file.size,
          status: UploadStatus.PENDING,
          currentChunk: 0,
          totalChunks: Math.ceil(file.size / this.getChunkSize()),
        });

        await this.uploadProgressRepository.save(uploadProgress);
      }

      this.logger.log(`Upload session created: ${savedSession.id}`);

      return FileUploadResponseDto.multiFileSession(
        UploadSessionResponseDto.fromEntity(savedSession),
        'Upload session created successfully',
      );
    } catch (error) {
      this.logger.error(`Upload session creation failed: ${error.message}`);
      throw error;
    }
  }

  async uploadFileToSession(
    file: Express.Multer.File,
    uploadSessionId: string,
    uploadRequest: FileUploadRequestDto,
    userId: string,
  ): Promise<FileUploadResponseDto> {
    this.logger.log(
      `Uploading file to session ${uploadSessionId}: ${file.originalname}`,
    );

    try {
      // Get upload session
      const uploadSession = await this.uploadSessionRepository.findOne({
        where: { id: uploadSessionId, userId },
        relations: ['company'],
      });

      if (!uploadSession) {
        throw new NotFoundException('Upload session not found');
      }

      if (uploadSession.status !== SessionStatus.ACTIVE) {
        throw new BadRequestException('Upload session is not active');
      }

      // Get or create upload progress
      let uploadProgress = await this.uploadProgressRepository.findOne({
        where: {
          uploadSessionId,
          userId,
          fileId: IsNull(),
        },
        order: { id: 'ASC' },
      });

      if (!uploadProgress) {
        throw new BadRequestException('No available upload progress slots');
      }

      // Get user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generate file hash
      const hash = this.generateFileHash(file.buffer);

      // Check for duplicate files
      const existingFile = await this.fileRepository.findOne({
        where: {
          hash,
          companyId: uploadSession.companyId,
          deletedAt: IsNull(),
        },
      });

      let savedFile: File;

      if (existingFile) {
        // Use existing file
        savedFile = existingFile;
      } else {
        // Generate storage key
        const storageKey = this.s3ClientService.generateStorageKey(
          uploadSession.companyId,
          userId,
          file.originalname,
        );

        // Upload to S3/MinIO
        await this.s3ClientService.uploadFile(
          storageKey,
          file.buffer,
          file.mimetype,
          {
            originalName: file.originalname,
            uploadedBy: userId,
            companyId: uploadSession.companyId,
            uploadSessionId,
          },
        );

        // Create file record
        const fileEntity = this.fileRepository.create({
          companyId: uploadSession.companyId,
          threadId: uploadRequest.threadId,
          chatroomId: uploadRequest.chatroomId,
          uploadedBy: userId,
          originalName: file.originalname,
          displayName: uploadRequest.displayName,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          hash,
          storageKey,
          storageBucket: this.s3ClientService['bucketName'],
          metadata: uploadRequest.metadata,
        });

        savedFile = await this.fileRepository.save(fileEntity);

        // Update storage quota
        await this.storageQuotaService.updateStorageUsage(
          uploadSession.companyId,
          file.size,
          1,
        );
      }

      // Update upload progress
      uploadProgress.fileId = savedFile.id;
      uploadProgress.status = UploadStatus.COMPLETED;
      uploadProgress.bytesUploaded = file.size;
      uploadProgress.progressPercentage = 100;
      uploadProgress.completedAt = new Date();
      await this.uploadProgressRepository.save(uploadProgress);

      // Create file association
      await this.createFileAssociation(savedFile.id, uploadRequest, userId);

      // Update upload session
      uploadSession.completedFiles += 1;
      uploadSession.uploadedSize += file.size;

      if (uploadSession.completedFiles >= uploadSession.totalFiles) {
        uploadSession.status = SessionStatus.COMPLETED;
        uploadSession.completedAt = new Date();
      }

      await this.uploadSessionRepository.save(uploadSession);

      // Generate download URL
      if (!savedFile.downloadUrl) {
        const downloadUrl = await this.s3ClientService.getSignedDownloadUrl(
          savedFile.storageKey,
        );
        savedFile.downloadUrl = downloadUrl;
        await this.fileRepository.save(savedFile);
      }

      this.logger.log(`File uploaded to session: ${savedFile.id}`);

      return FileUploadResponseDto.singleFile(
        FileResponseDto.fromEntity(savedFile),
        'File uploaded to session successfully',
      );
    } catch (error) {
      this.logger.error(`File upload to session failed: ${error.message}`);
      throw error;
    }
  }

  private async createFileAssociation(
    fileId: string,
    uploadRequest: FileUploadRequestDto,
    userId: string,
  ): Promise<void> {
    const fileAssociation = this.fileAssociationRepository.create({
      fileId,
      chatroomId: uploadRequest.chatroomId,
      threadId: uploadRequest.threadId,
      sharedBy: userId,
      accessType: uploadRequest.accessType || AccessType.PRIVATE,
    });

    await this.fileAssociationRepository.save(fileAssociation);
  }

  private generateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private getChunkSize(): number {
    return this.configService.get<number>(
      'FILE_UPLOAD_CHUNK_SIZE',
      5 * 1024 * 1024,
    ); // 5MB default
  }
}

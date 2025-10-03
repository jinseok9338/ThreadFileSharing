import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
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
import { MinIOService } from '../../storage/minio.service';
import { StorageQuotaService } from '../../storage/storage-quota.service';
import { WebSocketGateway } from '../../websocket/gateway/websocket.gateway';
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
    private readonly minioService: MinIOService,
    private readonly storageQuotaService: StorageQuotaService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => WebSocketGateway))
    private readonly webSocketGateway: WebSocketGateway,
  ) {}

  /**
   * Get the appropriate storage service based on environment
   */
  private getStorageService() {
    const isLocal = this.configService.get<string>('NODE_ENV') === 'local';
    this.logger.debug(`Environment check: NODE_ENV=${this.configService.get<string>('NODE_ENV')}, isLocal=${isLocal}`);
    this.logger.debug(`Returning service: ${isLocal ? 'MinIOService' : 'S3ClientService'}`);
    return isLocal ? this.minioService : this.s3ClientService;
  }

  /**
   * Generate storage key for file
   */
  private generateStorageKey(
    companyId: string,
    userId: string,
    originalName: string,
  ): string {
    const isLocal = this.configService.get<string>('NODE_ENV') === 'local';

    if (isLocal) {
      // MinIO storage key generation
      const extension = originalName.split('.').pop();
      const filename = originalName.replace(/\.[^/.]+$/, '');
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
      const timestamp = Date.now();
      return `companies/${companyId}/users/${userId}/${timestamp}_${sanitizedFilename}.${extension}`;
    } else {
      // AWS S3 storage key generation
      return this.s3ClientService.generateStorageKey(
        companyId,
        userId,
        originalName,
      );
    }
  }

  /**
   * Get storage bucket name based on environment
   */
  private getStorageBucketName(): string {
    const isLocal = this.configService.get<string>('NODE_ENV') === 'local';
    
    if (isLocal) {
      return this.configService.get<string>('MINIO_BUCKET_NAME', 'threadfilesharing-local');
    } else {
      return this.configService.get<string>('AWS_S3_BUCKET_NAME', 'threadfilesharing-prod');
    }
  }

  async uploadSingleFile(
    file: any, // Fastify multipart file object
    uploadRequest: FileUploadRequestDto,
    userId: string,
  ): Promise<FileUploadResponseDto> {
    this.logger.log(
      `Starting single file upload: ${file.filename} by user ${userId}`,
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

      // Generate file buffer first - Fastify multipart file object
      const fileBuffer = await file.toBuffer();

      // Check storage quota
      await this.storageQuotaService.validateFileUpload(
        user.company.id,
        BigInt(fileBuffer.length),
      );

      // Generate file hash
      const hash = this.generateFileHash(fileBuffer);

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
      const storageKey = this.generateStorageKey(
        user.company.id,
        userId,
        file.filename,
      );

      // Upload to storage (MinIO or AWS S3)
      const storageService = this.getStorageService();
      await storageService.uploadFile(storageKey, fileBuffer, file.mimetype, {
        originalName: file.filename,
        uploadedBy: userId,
        companyId: user.company.id,
      });

      // Create file record
      const fileEntity = this.fileRepository.create({
        companyId: user.company.id,
        threadId: uploadRequest.threadId,
        chatroomId: uploadRequest.chatroomId,
        uploadedBy: userId,
        originalName: file.filename,
        displayName: uploadRequest.displayName,
        mimeType: file.mimetype,
        sizeBytes: file._buf?.length || 0,
        hash,
        storageKey,
        storageBucket: this.getStorageBucketName(),
        metadata: uploadRequest.metadata,
      });

      const savedFile = await this.fileRepository.save(fileEntity);

      // Create file association
      await this.createFileAssociation(savedFile.id, uploadRequest, userId);

      // Update storage quota
      await this.storageQuotaService.addStorageUsage(
        user.company.id,
        fileBuffer.length,
      );

      // Generate download URL
      const downloadUrl =
        await this.s3ClientService.getSignedDownloadUrl(storageKey);

      // Update file with download URL
      savedFile.downloadUrl = downloadUrl;
      await this.fileRepository.save(savedFile);

      this.logger.log(`Single file upload completed: ${savedFile.id}`);

      // Broadcast upload completion via WebSocket
      await this.broadcastSingleFileUploadCompleted(
        savedFile,
        uploadRequest,
        userId,
      );

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

      // Check total storage quota - calculate total size from files
      let totalSize = 0;
      for (const file of files) {
        const fileBuffer = file.buffer;
        totalSize += fileBuffer.length;
      }
      await this.storageQuotaService.validateFileUpload(
        user.company.id,
        totalSize,
      );

      // Create upload session with context metadata
      const uploadSession = this.uploadSessionRepository.create({
        userId,
        companyId: user.company.id,
        sessionName:
          uploadRequest.sessionName ||
          `Upload Session ${new Date().toISOString()}`,
        totalFiles: files.length,
        totalSize,
        status: SessionStatus.ACTIVE,
        metadata: {
          chatroomId: uploadRequest.chatroomId,
          threadId: uploadRequest.threadId,
          action: uploadRequest.createThread ? 'CREATE_THREAD' : 'SHARE_FILE',
          createThread: uploadRequest.createThread,
          threadTitle: uploadRequest.threadTitle,
          threadDescription: uploadRequest.threadDescription,
          accessType: uploadRequest.accessType,
        },
      });

      const savedSession =
        await this.uploadSessionRepository.save(uploadSession);

      // Create upload progress records
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileBuffer = file.buffer;
        const uploadProgress = this.uploadProgressRepository.create({
          uploadSessionId: savedSession.id,
          userId,
          totalBytes: fileBuffer.length,
          status: UploadStatus.PENDING,
          currentChunk: 0,
          totalChunks: Math.ceil(fileBuffer.length / this.getChunkSize()),
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
      `Uploading file to session ${uploadSessionId}: ${file.filename}`,
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

      // Generate file buffer first - Fastify multipart file object
      const fileBuffer = file.buffer;

      // Generate file hash
      const hash = this.generateFileHash(fileBuffer);

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
        const storageKey = this.generateStorageKey(
          uploadSession.companyId,
          userId,
          file.filename,
        );

        // Upload to storage (MinIO or AWS S3)
        const storageService = this.getStorageService();
        await storageService.uploadFile(storageKey, fileBuffer, file.mimetype, {
          originalName: file.filename,
          uploadedBy: userId,
          companyId: uploadSession.companyId,
          uploadSessionId: uploadSessionId.toString(),
        });

        // Create file record
        const fileEntity = this.fileRepository.create({
          companyId: uploadSession.companyId,
          threadId: uploadRequest.threadId,
          chatroomId: uploadRequest.chatroomId,
          uploadedBy: userId,
          originalName: file.filename,
          displayName: uploadRequest.displayName,
          mimeType: file.mimetype,
          sizeBytes: fileBuffer.length,
          hash,
          storageKey,
          storageBucket: this.getStorageBucketName(),
          metadata: uploadRequest.metadata,
        });

        savedFile = await this.fileRepository.save(fileEntity);

        // Update storage quota
        await this.storageQuotaService.addStorageUsage(
          uploadSession.companyId,
          fileBuffer.length,
        );
      }

      // Update upload progress
      uploadProgress.fileId = savedFile.id;
      uploadProgress.status = UploadStatus.COMPLETED;
      uploadProgress.bytesUploaded = fileBuffer.length;
      uploadProgress.progressPercentage = 100;
      uploadProgress.completedAt = new Date();
      await this.uploadProgressRepository.save(uploadProgress);

      // Create file association
      await this.createFileAssociation(savedFile.id, uploadRequest, userId);

      // Update upload session
      uploadSession.completedFiles += 1;
      uploadSession.uploadedSize += fileBuffer.length;

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

      // Broadcast file upload completion via WebSocket
      await this.broadcastMultiFileUploadCompleted(
        savedFile,
        uploadRequest,
        userId,
        uploadSession.id,
      );

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

  // ===== WebSocket Broadcasting Methods =====

  private async broadcastSingleFileUploadCompleted(
    file: File,
    uploadRequest: FileUploadRequestDto,
    userId: string,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        this.logger.warn(`User not found for WebSocket broadcast: ${userId}`);
        return;
      }

      // Get user's company role (default to member for now)
      // TODO: Implement proper company role lookup when CompanyMember entity is available
      const companyRole = 'member';

      const completionData = {
        sessionId: null, // Single file upload doesn't have session
        fileId: file.id,
        originalName: file.originalName,
        size: file.sizeBytes,
        mimeType: file.mimeType,
        downloadUrl: file.downloadUrl,
        uploadedBy: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          status: 'online' as const,
          lastSeenAt: new Date(),
          companyRole: companyRole as 'owner' | 'admin' | 'member',
        },
        context: {
          chatroomId: uploadRequest.chatroomId,
          threadId: uploadRequest.threadId,
          action: uploadRequest.createThread ? 'CREATE_THREAD' : 'SHARE_FILE',
        },
        autoActions: await this.generateAutoActions(
          file,
          uploadRequest,
          userId,
        ),
        completedAt: new Date(),
      };

      // Broadcast to relevant rooms based on context
      if (uploadRequest.chatroomId) {
        this.webSocketGateway.broadcastFileUploadCompleted(completionData);
      } else if (uploadRequest.threadId) {
        this.webSocketGateway.broadcastFileUploadCompleted(completionData);
      }

      this.logger.debug(
        `Broadcasted single file upload completion for file ${file.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to broadcast single file upload completion: ${error.message}`,
      );
    }
  }

  private async broadcastMultiFileUploadCompleted(
    file: File,
    uploadRequest: FileUploadRequestDto,
    userId: string,
    sessionId: string,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        this.logger.warn(`User not found for WebSocket broadcast: ${userId}`);
        return;
      }

      // Get user's company role (default to member for now)
      // TODO: Implement proper company role lookup when CompanyMember entity is available
      const companyRole = 'member';

      const completionData = {
        sessionId,
        fileId: file.id,
        originalName: file.originalName,
        size: file.sizeBytes,
        mimeType: file.mimeType,
        downloadUrl: file.downloadUrl,
        uploadedBy: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          status: 'online' as const,
          lastSeenAt: new Date(),
          companyRole: companyRole as 'owner' | 'admin' | 'member',
        },
        context: {
          chatroomId: uploadRequest.chatroomId,
          threadId: uploadRequest.threadId,
          action: uploadRequest.createThread ? 'CREATE_THREAD' : 'SHARE_FILE',
        },
        autoActions: await this.generateAutoActions(
          file,
          uploadRequest,
          userId,
        ),
        completedAt: new Date(),
      };

      // Broadcast to upload session room and context rooms
      this.webSocketGateway.broadcastFileUploadCompleted(completionData);

      this.logger.debug(
        `Broadcasted multi-file upload completion for file ${file.id} in session ${sessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to broadcast multi-file upload completion: ${error.message}`,
      );
    }
  }

  private async generateAutoActions(
    file: File,
    uploadRequest: FileUploadRequestDto,
    userId: string,
  ): Promise<any> {
    const autoActions: any = {};

    try {
      // Auto-generate chatroom message if sharing to chatroom (not creating thread)
      if (uploadRequest.chatroomId && !uploadRequest.createThread) {
        // TODO: Create actual chatroom message via MessageService
        autoActions.chatroomMessage = {
          messageId: 'temp-message-id', // TODO: Use actual message ID
          content: `파일이 업로드되었습니다: ${file.originalName}`,
          messageType: 'FILE_SHARE',
        };
      }

      // Auto-create thread if requested
      if (uploadRequest.createThread) {
        // TODO: Create actual thread via ThreadService
        autoActions.threadCreated = {
          threadId: 'temp-thread-id', // TODO: Use actual thread ID
          title: uploadRequest.threadTitle || file.originalName,
          description:
            uploadRequest.threadDescription ||
            `${file.originalName}에 대한 논의`,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to generate auto actions: ${error.message}`);
    }

    return Object.keys(autoActions).length > 0 ? autoActions : undefined;
  }
}

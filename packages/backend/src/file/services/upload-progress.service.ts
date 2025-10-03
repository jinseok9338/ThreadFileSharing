import {
  Injectable,
  Logger,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  UploadProgress,
  UploadStatus,
} from '../entities/upload-progress.entity';
import {
  UploadSession,
  SessionStatus,
} from '../entities/upload-session.entity';
import { UploadProgressDto } from '../dto/upload-progress.dto';
import { WebSocketGateway } from '../../websocket/gateway/websocket.gateway';

@Injectable()
export class UploadProgressService {
  private readonly logger = new Logger(UploadProgressService.name);

  constructor(
    @InjectRepository(UploadProgress)
    private readonly uploadProgressRepository: Repository<UploadProgress>,
    @InjectRepository(UploadSession)
    private readonly uploadSessionRepository: Repository<UploadSession>,
    @Inject(forwardRef(() => WebSocketGateway))
    private readonly webSocketGateway: WebSocketGateway,
  ) {}

  async updateProgress(
    uploadProgressId: string,
    progressData: {
      bytesUploaded: number;
      uploadSpeed?: number;
      estimatedTimeRemaining?: number;
      currentChunk?: number;
    },
    userId: string,
  ): Promise<UploadProgressDto> {
    this.logger.log(`Updating upload progress: ${uploadProgressId}`);

    try {
      const uploadProgress = await this.uploadProgressRepository.findOne({
        where: { id: uploadProgressId, userId },
        relations: ['uploadSession'],
      });

      if (!uploadProgress) {
        throw new NotFoundException('Upload progress not found');
      }

      // Update progress data
      uploadProgress.bytesUploaded = progressData.bytesUploaded;
      uploadProgress.progressPercentage = Math.round(
        (progressData.bytesUploaded / uploadProgress.totalBytes) * 100,
      );

      if (progressData.uploadSpeed !== undefined) {
        uploadProgress.uploadSpeed = progressData.uploadSpeed;
      }

      if (progressData.estimatedTimeRemaining !== undefined) {
        uploadProgress.estimatedTimeRemaining =
          progressData.estimatedTimeRemaining;
      }

      if (progressData.currentChunk !== undefined) {
        uploadProgress.currentChunk = progressData.currentChunk;
      }

      // Update status based on progress
      if (uploadProgress.progressPercentage >= 100) {
        uploadProgress.status = UploadStatus.COMPLETED;
        uploadProgress.completedAt = new Date();
      } else if (uploadProgress.status === UploadStatus.PENDING) {
        uploadProgress.status = UploadStatus.UPLOADING;
        if (!uploadProgress.startedAt) {
          uploadProgress.startedAt = new Date();
        }
      }

      uploadProgress.lastUpdatedAt = new Date();

      const savedProgress =
        await this.uploadProgressRepository.save(uploadProgress);

      // Update session progress
      await this.updateSessionProgress(uploadProgress.uploadSessionId);

      // Broadcast progress update via WebSocket
      await this.broadcastProgressUpdate(savedProgress);

      return UploadProgressDto.fromEntity(savedProgress);
    } catch (error) {
      this.logger.error(`Failed to update upload progress: ${error.message}`);
      throw error;
    }
  }

  async markAsFailed(
    uploadProgressId: string,
    errorMessage: string,
    userId: string,
  ): Promise<UploadProgressDto> {
    this.logger.log(`Marking upload progress as failed: ${uploadProgressId}`);

    try {
      const uploadProgress = await this.uploadProgressRepository.findOne({
        where: { id: uploadProgressId, userId },
      });

      if (!uploadProgress) {
        throw new NotFoundException('Upload progress not found');
      }

      uploadProgress.status = UploadStatus.FAILED;
      uploadProgress.errorMessage = errorMessage;
      uploadProgress.lastUpdatedAt = new Date();

      const savedProgress =
        await this.uploadProgressRepository.save(uploadProgress);

      // Update session progress
      await this.updateSessionProgress(uploadProgress.uploadSessionId);

      // Broadcast failure update via WebSocket
      await this.broadcastFailureUpdate(savedProgress, errorMessage);

      return UploadProgressDto.fromEntity(savedProgress);
    } catch (error) {
      this.logger.error(
        `Failed to mark upload progress as failed: ${error.message}`,
      );
      throw error;
    }
  }

  async markAsCancelled(
    uploadProgressId: string,
    userId: string,
  ): Promise<UploadProgressDto> {
    this.logger.log(
      `Marking upload progress as cancelled: ${uploadProgressId}`,
    );

    try {
      const uploadProgress = await this.uploadProgressRepository.findOne({
        where: { id: uploadProgressId, userId },
      });

      if (!uploadProgress) {
        throw new NotFoundException('Upload progress not found');
      }

      uploadProgress.status = UploadStatus.CANCELLED;
      uploadProgress.lastUpdatedAt = new Date();

      const savedProgress =
        await this.uploadProgressRepository.save(uploadProgress);

      // Update session progress
      await this.updateSessionProgress(uploadProgress.uploadSessionId);

      // Broadcast cancellation update via WebSocket
      await this.broadcastCancellationUpdate(savedProgress);

      return UploadProgressDto.fromEntity(savedProgress);
    } catch (error) {
      this.logger.error(
        `Failed to mark upload progress as cancelled: ${error.message}`,
      );
      throw error;
    }
  }

  async getUploadProgress(
    uploadProgressId: string,
    userId: string,
  ): Promise<UploadProgressDto> {
    try {
      const uploadProgress = await this.uploadProgressRepository.findOne({
        where: { id: uploadProgressId, userId },
        relations: ['file', 'uploadSession', 'user'],
      });

      if (!uploadProgress) {
        throw new NotFoundException('Upload progress not found');
      }

      return UploadProgressDto.fromEntity(uploadProgress);
    } catch (error) {
      this.logger.error(`Failed to get upload progress: ${error.message}`);
      throw error;
    }
  }

  async getSessionProgress(
    uploadSessionId: string,
    userId: string,
  ): Promise<UploadProgressDto[]> {
    try {
      const uploadProgresses = await this.uploadProgressRepository.find({
        where: { uploadSessionId, userId },
        relations: ['file', 'uploadSession', 'user'],
        order: { id: 'ASC' },
      });

      return uploadProgresses.map((progress) =>
        UploadProgressDto.fromEntity(progress),
      );
    } catch (error) {
      this.logger.error(`Failed to get session progress: ${error.message}`);
      throw error;
    }
  }

  async getUserActiveUploads(userId: string): Promise<UploadProgressDto[]> {
    try {
      const activeUploads = await this.uploadProgressRepository.find({
        where: {
          userId,
          status: UploadStatus.UPLOADING,
        },
        relations: ['file', 'uploadSession'],
        order: { lastUpdatedAt: 'DESC' },
      });

      return activeUploads.map((progress) =>
        UploadProgressDto.fromEntity(progress),
      );
    } catch (error) {
      this.logger.error(`Failed to get user active uploads: ${error.message}`);
      throw error;
    }
  }

  private async updateSessionProgress(uploadSessionId: string): Promise<void> {
    try {
      const uploadSession = await this.uploadSessionRepository.findOne({
        where: { id: uploadSessionId },
        relations: ['uploadProgresses'],
      });

      if (!uploadSession) {
        return;
      }

      const progressCounts = uploadSession.uploadProgresses.reduce(
        (acc, progress) => {
          switch (progress.status) {
            case UploadStatus.COMPLETED:
              acc.completed++;
              break;
            case UploadStatus.FAILED:
              acc.failed++;
              break;
          }
          return acc;
        },
        { completed: 0, failed: 0 },
      );

      uploadSession.completedFiles = progressCounts.completed;
      uploadSession.failedFiles = progressCounts.failed;

      // Update session status
      if (uploadSession.completedFiles >= uploadSession.totalFiles) {
        uploadSession.status = SessionStatus.COMPLETED;
        uploadSession.completedAt = new Date();
      } else if (
        uploadSession.failedFiles > 0 &&
        uploadSession.completedFiles === 0
      ) {
        uploadSession.status = SessionStatus.FAILED;
      }

      await this.uploadSessionRepository.save(uploadSession);
    } catch (error) {
      this.logger.error(`Failed to update session progress: ${error.message}`);
    }
  }

  async cleanupStaleProgress(): Promise<void> {
    try {
      const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      const staleProgresses = await this.uploadProgressRepository.find({
        where: {
          status: UploadStatus.UPLOADING,
          lastUpdatedAt: LessThan(staleThreshold),
        },
      });

      for (const progress of staleProgresses) {
        progress.status = UploadStatus.FAILED;
        progress.errorMessage = 'Upload timed out';
        await this.uploadProgressRepository.save(progress);
      }

      this.logger.log(
        `Cleaned up ${staleProgresses.length} stale upload progress records`,
      );
    } catch (error) {
      this.logger.error(`Failed to cleanup stale progress: ${error.message}`);
    }
  }

  // ===== WebSocket Broadcasting Methods =====

  private async broadcastProgressUpdate(
    uploadProgress: UploadProgress,
  ): Promise<void> {
    try {
      // Get upload session with context
      const uploadSession = await this.uploadSessionRepository.findOne({
        where: { id: uploadProgress.uploadSessionId },
        relations: ['uploadProgresses', 'file'],
      });

      // Extract context from upload session metadata or file associations
      let context: any = {
        chatroomId: undefined,
        threadId: undefined,
        action: 'SHARE_FILE' as const,
      };

      if (uploadSession?.metadata) {
        context = {
          chatroomId: uploadSession.metadata.chatroomId,
          threadId: uploadSession.metadata.threadId,
          action: uploadSession.metadata.action || 'SHARE_FILE',
        };
      } else if (uploadProgress.file) {
        // Fallback: get context from file associations
        context = {
          chatroomId: uploadProgress.file.chatroomId,
          threadId: uploadProgress.file.threadId,
          action: 'SHARE_FILE' as const,
        };
      }

      const progressData = {
        sessionId: uploadProgress.uploadSessionId,
        fileId: uploadProgress.fileId,
        originalName: uploadProgress.file?.originalName || 'Unknown',
        status: uploadProgress.status,
        progressPercentage: uploadProgress.progressPercentage,
        bytesUploaded: uploadProgress.bytesUploaded,
        totalBytes: uploadProgress.totalBytes,
        uploadSpeed: uploadProgress.uploadSpeed || 0,
        estimatedTimeRemaining: uploadProgress.estimatedTimeRemaining || 0,
        context,
        timestamp: new Date(),
      };

      this.webSocketGateway.broadcastFileUploadProgress(
        uploadProgress.uploadSessionId,
        progressData,
      );

      this.logger.debug(
        `Broadcasted progress update for file ${uploadProgress.fileId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to broadcast progress update: ${error.message}`,
      );
    }
  }

  private async broadcastFailureUpdate(
    uploadProgress: UploadProgress,
    errorMessage: string,
  ): Promise<void> {
    try {
      // Get upload session with context
      const uploadSession = await this.uploadSessionRepository.findOne({
        where: { id: uploadProgress.uploadSessionId },
      });

      // Extract context from upload session metadata or file associations
      let context: any = {
        chatroomId: undefined,
        threadId: undefined,
        action: 'SHARE_FILE' as const,
      };

      if (uploadSession?.metadata) {
        context = {
          chatroomId: uploadSession.metadata.chatroomId,
          threadId: uploadSession.metadata.threadId,
          action: uploadSession.metadata.action || 'SHARE_FILE',
        };
      } else if (uploadProgress.file) {
        context = {
          chatroomId: uploadProgress.file.chatroomId,
          threadId: uploadProgress.file.threadId,
          action: 'SHARE_FILE' as const,
        };
      }

      const failureData = {
        sessionId: uploadProgress.uploadSessionId,
        fileId: uploadProgress.fileId,
        originalName: uploadProgress.file?.originalName || 'Unknown',
        errorCode: 'UPLOAD_FAILED',
        errorMessage,
        retryable: true,
        context,
        failedAt: new Date(),
      };

      this.webSocketGateway.broadcastFileUploadFailed(
        uploadProgress.uploadSessionId,
        failureData,
      );

      this.logger.debug(
        `Broadcasted failure update for file ${uploadProgress.fileId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to broadcast failure update: ${error.message}`);
    }
  }

  private async broadcastCancellationUpdate(
    uploadProgress: UploadProgress,
  ): Promise<void> {
    try {
      // Get upload session with context
      const uploadSession = await this.uploadSessionRepository.findOne({
        where: { id: uploadProgress.uploadSessionId },
      });

      // Extract context from upload session metadata or file associations
      let context: any = {
        chatroomId: undefined,
        threadId: undefined,
        action: 'SHARE_FILE' as const,
      };

      if (uploadSession?.metadata) {
        context = {
          chatroomId: uploadSession.metadata.chatroomId,
          threadId: uploadSession.metadata.threadId,
          action: uploadSession.metadata.action || 'SHARE_FILE',
        };
      } else if (uploadProgress.file) {
        context = {
          chatroomId: uploadProgress.file.chatroomId,
          threadId: uploadProgress.file.threadId,
          action: 'SHARE_FILE' as const,
        };
      }

      const cancellationData = {
        sessionId: uploadProgress.uploadSessionId,
        fileId: uploadProgress.fileId,
        originalName: uploadProgress.file?.originalName || 'Unknown',
        errorCode: 'UPLOAD_CANCELLED',
        errorMessage: 'Upload cancelled by user',
        retryable: false,
        context,
        failedAt: new Date(),
      };

      this.webSocketGateway.broadcastFileUploadFailed(
        uploadProgress.uploadSessionId,
        cancellationData,
      );

      this.logger.debug(
        `Broadcasted cancellation update for file ${uploadProgress.fileId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to broadcast cancellation update: ${error.message}`,
      );
    }
  }
}

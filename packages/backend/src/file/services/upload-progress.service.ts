import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class UploadProgressService {
  private readonly logger = new Logger(UploadProgressService.name);

  constructor(
    @InjectRepository(UploadProgress)
    private readonly uploadProgressRepository: Repository<UploadProgress>,
    @InjectRepository(UploadSession)
    private readonly uploadSessionRepository: Repository<UploadSession>,
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
}

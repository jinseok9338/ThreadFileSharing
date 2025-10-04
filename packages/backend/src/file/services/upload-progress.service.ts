import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { FileUploadSession } from '../entities/file-upload-session.entity';
import { UploadStatus } from '../../common/enums/upload-status.enum';

@Injectable()
export class UploadProgressService {
  private readonly logger = new Logger(UploadProgressService.name);

  constructor(
    @InjectRepository(FileUploadSession)
    private readonly uploadSessionRepository: Repository<FileUploadSession>,
  ) {}

  async updateProgress(uploadSession: FileUploadSession): Promise<void> {
    try {
      // Update progress tracking in database
      await this.uploadSessionRepository.update(uploadSession.id, {
        uploadedChunks: uploadSession.uploadedChunks,
        uploadedBytes: uploadSession.uploadedBytes,
        status: uploadSession.status,
        updatedAt: new Date(),
      });

      this.logger.debug(
        `Progress updated for session ${uploadSession.sessionId}: ${uploadSession.uploadedChunks}/${uploadSession.totalChunks} chunks`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update progress for session ${uploadSession.sessionId}:`,
        error,
      );
      throw error;
    }
  }

  async broadcastProgress(uploadSession: FileUploadSession): Promise<void> {
    try {
      // TODO: Implement WebSocket broadcasting
      // This would typically emit events to connected clients
      // await this.webSocketGateway.server
      //   .to(`upload_session_${uploadSession.sessionId}`)
      //   .emit('upload_progress', {
      //     sessionId: uploadSession.sessionId,
      //     progress: uploadSession.progressPercentage,
      //     status: uploadSession.status,
      //     uploadedBytes: uploadSession.uploadedBytes,
      //     totalBytes: uploadSession.totalSizeBytes,
      //   });

      this.logger.debug(
        `Broadcasting progress for session ${uploadSession.sessionId}: ${uploadSession.progressPercentage}%`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to broadcast progress for session ${uploadSession.sessionId}:`,
        error,
      );
    }
  }

  async getProgress(sessionId: string): Promise<{
    sessionId: string;
    progress: number;
    status: UploadStatus;
    uploadedBytes: bigint;
    totalBytes: bigint;
    estimatedTimeRemaining?: number;
    uploadSpeed?: number;
  }> {
    const uploadSession = await this.uploadSessionRepository.findOne({
      where: { sessionId },
    });

    if (!uploadSession) {
      throw new Error(`Upload session ${sessionId} not found`);
    }

    const progress = uploadSession.progressPercentage;
    const estimatedTimeRemaining =
      this.calculateEstimatedTimeRemaining(uploadSession);
    const uploadSpeed = this.calculateUploadSpeed(uploadSession);

    return {
      sessionId: uploadSession.sessionId,
      progress,
      status: uploadSession.status,
      uploadedBytes: uploadSession.uploadedBytes,
      totalBytes: uploadSession.totalSizeBytes,
      estimatedTimeRemaining,
      uploadSpeed,
    };
  }

  async cleanupStaleProgress(): Promise<number> {
    try {
      // Find sessions that are older than 7 days and not completed
      const staleDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const staleSessions = await this.uploadSessionRepository.find({
        where: {
          createdAt: LessThan(staleDate),
          status: In([
            UploadStatus.PENDING,
            UploadStatus.IN_PROGRESS,
            UploadStatus.FAILED,
          ]),
        },
      });

      if (staleSessions.length > 0) {
        // Update status to cancelled
        await this.uploadSessionRepository.update(
          { id: In(staleSessions.map((s) => s.id)) },
          { status: UploadStatus.CANCELLED },
        );

        this.logger.log(
          `Cleaned up ${staleSessions.length} stale upload sessions`,
        );
      }

      return staleSessions.length;
    } catch (error) {
      this.logger.error('Failed to cleanup stale progress:', error);
      throw error;
    }
  }

  private calculateEstimatedTimeRemaining(
    uploadSession: FileUploadSession,
  ): number | undefined {
    if (uploadSession.status !== UploadStatus.IN_PROGRESS) {
      return undefined;
    }

    if (uploadSession.uploadedBytes === 0n) {
      return undefined;
    }

    // Calculate average upload speed based on time elapsed
    const timeElapsed = Date.now() - uploadSession.createdAt.getTime();
    const timeElapsedSeconds = timeElapsed / 1000;
    const averageSpeed =
      Number(uploadSession.uploadedBytes) / timeElapsedSeconds;

    if (averageSpeed <= 0) {
      return undefined;
    }

    const remainingBytes = uploadSession.remainingBytes;
    const estimatedSeconds = Number(remainingBytes) / averageSpeed;

    return Math.round(estimatedSeconds);
  }

  private calculateUploadSpeed(
    uploadSession: FileUploadSession,
  ): number | undefined {
    if (uploadSession.status !== UploadStatus.IN_PROGRESS) {
      return undefined;
    }

    if (uploadSession.uploadedBytes === 0n) {
      return undefined;
    }

    // Calculate average upload speed based on time elapsed
    const timeElapsed = Date.now() - uploadSession.createdAt.getTime();
    const timeElapsedSeconds = timeElapsed / 1000;

    if (timeElapsedSeconds <= 0) {
      return undefined;
    }

    const averageSpeed =
      Number(uploadSession.uploadedBytes) / timeElapsedSeconds;
    return Math.round(averageSpeed);
  }

  async getActiveUploads(userId: string): Promise<FileUploadSession[]> {
    return this.uploadSessionRepository.find({
      where: {
        uploadedById: userId,
        status: In([UploadStatus.PENDING, UploadStatus.IN_PROGRESS]),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getUploadHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ uploads: FileUploadSession[]; total: number }> {
    const [uploads, total] = await this.uploadSessionRepository.findAndCount({
      where: { uploadedById: userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { uploads, total };
  }
}

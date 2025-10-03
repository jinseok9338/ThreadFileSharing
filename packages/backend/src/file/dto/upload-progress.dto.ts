import {
  UploadProgress,
  UploadStatus,
} from '../entities/upload-progress.entity';
import { File } from '../entities/file.entity';
import { UploadSession } from '../entities/upload-session.entity';
import { User } from '../../user/entities/user.entity';

export class UploadProgressDto {
  id: string;
  uploadSessionId: string;
  fileId?: string;
  userId: string;
  status: UploadStatus;
  progressPercentage: number;
  bytesUploaded: number;
  totalBytes: number;
  uploadSpeed: number;
  estimatedTimeRemaining: number;
  currentChunk: number;
  totalChunks: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  lastUpdatedAt: Date;

  // Relations
  file?: {
    id: string;
    originalName: string;
    displayName?: string;
    sizeBytes: number;
    mimeType: string;
  };

  uploadSession?: {
    id: string;
    sessionName?: string;
    status: string;
    totalFiles: number;
    completedFiles: number;
  };

  user?: {
    id: string;
    email: string;
    fullName: string;
  };

  // Computed properties
  get isCompleted(): boolean {
    return this.status === UploadStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === UploadStatus.FAILED;
  }

  get isUploading(): boolean {
    return this.status === UploadStatus.UPLOADING;
  }

  get remainingBytes(): number {
    return this.totalBytes - this.bytesUploaded;
  }

  get uploadSpeedFormatted(): string {
    return this.formatBytes(this.uploadSpeed) + '/s';
  }

  get totalBytesFormatted(): string {
    return this.formatBytes(this.totalBytes);
  }

  get bytesUploadedFormatted(): string {
    return this.formatBytes(this.bytesUploaded);
  }

  get remainingBytesFormatted(): string {
    return this.formatBytes(this.remainingBytes);
  }

  get estimatedTimeFormatted(): string {
    if (this.estimatedTimeRemaining <= 0) return 'Unknown';

    const seconds = this.estimatedTimeRemaining;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
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

  static fromEntity(uploadProgress: UploadProgress): UploadProgressDto {
    const dto = new UploadProgressDto();
    dto.id = uploadProgress.id;
    dto.uploadSessionId = uploadProgress.uploadSessionId;
    dto.fileId = uploadProgress.fileId;
    dto.userId = uploadProgress.userId;
    dto.status = uploadProgress.status;
    dto.progressPercentage = uploadProgress.progressPercentage;
    dto.bytesUploaded = uploadProgress.bytesUploaded;
    dto.totalBytes = uploadProgress.totalBytes;
    dto.uploadSpeed = uploadProgress.uploadSpeed;
    dto.estimatedTimeRemaining = uploadProgress.estimatedTimeRemaining;
    dto.currentChunk = uploadProgress.currentChunk;
    dto.totalChunks = uploadProgress.totalChunks;
    dto.errorMessage = uploadProgress.errorMessage;
    dto.startedAt = uploadProgress.startedAt;
    dto.completedAt = uploadProgress.completedAt;
    dto.lastUpdatedAt = uploadProgress.lastUpdatedAt;

    // Populate relations if available
    if (uploadProgress.file) {
      dto.file = {
        id: uploadProgress.file.id,
        originalName: uploadProgress.file.originalName,
        displayName: uploadProgress.file.displayName,
        sizeBytes: uploadProgress.file.sizeBytes,
        mimeType: uploadProgress.file.mimeType,
      };
    }

    if (uploadProgress.uploadSession) {
      dto.uploadSession = {
        id: uploadProgress.uploadSession.id,
        sessionName: uploadProgress.uploadSession.sessionName,
        status: uploadProgress.uploadSession.status,
        totalFiles: uploadProgress.uploadSession.totalFiles,
        completedFiles: uploadProgress.uploadSession.completedFiles,
      };
    }

    if (uploadProgress.user) {
      dto.user = {
        id: uploadProgress.user.id,
        email: uploadProgress.user.email,
        fullName: uploadProgress.user.fullName,
      };
    }

    return dto;
  }
}

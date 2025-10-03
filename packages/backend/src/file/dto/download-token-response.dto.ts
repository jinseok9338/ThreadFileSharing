import { DownloadToken } from '../entities/download-token.entity';
import { File } from '../entities/file.entity';
import { User } from '../../user/entities/user.entity';

export class DownloadTokenResponseDto {
  id: string;
  fileId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  downloadCount: number;
  maxDownloads: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastUsedAt?: Date;

  // Relations
  file?: {
    id: string;
    originalName: string;
    sizeBytes: number;
    mimeType: string;
  };

  user?: {
    id: string;
    email: string;
    fullName: string;
  };

  // Computed properties
  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get downloadUrl(): string {
    return `/api/v1/files/download/${this.token}`;
  }

  get remainingDownloads(): number {
    return this.maxDownloads - this.downloadCount;
  }

  static fromEntity(downloadToken: DownloadToken): DownloadTokenResponseDto {
    const dto = new DownloadTokenResponseDto();
    dto.id = downloadToken.id;
    dto.fileId = downloadToken.fileId;
    dto.userId = downloadToken.userId;
    dto.token = downloadToken.token;
    dto.expiresAt = downloadToken.expiresAt;
    dto.downloadCount = downloadToken.downloadCount;
    dto.maxDownloads = downloadToken.maxDownloads;
    dto.ipAddress = downloadToken.ipAddress;
    dto.userAgent = downloadToken.userAgent;
    dto.createdAt = downloadToken.createdAt;
    dto.lastUsedAt = downloadToken.lastUsedAt;

    // Populate relations if available
    if (downloadToken.file) {
      dto.file = {
        id: downloadToken.file.id,
        originalName: downloadToken.file.originalName,
        sizeBytes: downloadToken.file.sizeBytes,
        mimeType: downloadToken.file.mimeType,
      };
    }

    if (downloadToken.user) {
      dto.user = {
        id: downloadToken.user.id,
        email: downloadToken.user.email,
        fullName: downloadToken.user.fullName,
      };
    }

    return dto;
  }
}

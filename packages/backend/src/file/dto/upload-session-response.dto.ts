import {
  UploadSession,
  SessionStatus,
} from '../entities/upload-session.entity';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

export class UploadSessionResponseDto {
  id: string;
  userId: string;
  companyId: string;
  sessionName?: string;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  totalSize: number;
  uploadedSize: number;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Relations
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  company?: {
    id: string;
    name: string;
    slug: string;
  };

  // Computed properties
  get progressPercentage(): number {
    if (this.totalFiles === 0) return 0;
    return (this.completedFiles / this.totalFiles) * 100;
  }

  get uploadProgressPercentage(): number {
    if (this.totalSize === 0) return 0;
    return (this.uploadedSize / this.totalSize) * 100;
  }

  static fromEntity(uploadSession: UploadSession): UploadSessionResponseDto {
    const dto = new UploadSessionResponseDto();
    dto.id = uploadSession.id;
    dto.userId = uploadSession.userId;
    dto.companyId = uploadSession.companyId;
    dto.sessionName = uploadSession.sessionName;
    dto.totalFiles = uploadSession.totalFiles;
    dto.completedFiles = uploadSession.completedFiles;
    dto.failedFiles = uploadSession.failedFiles;
    dto.totalSize = uploadSession.totalSize;
    dto.uploadedSize = uploadSession.uploadedSize;
    dto.status = uploadSession.status;
    dto.createdAt = uploadSession.createdAt;
    dto.updatedAt = uploadSession.updatedAt;
    dto.completedAt = uploadSession.completedAt;

    // Populate relations if available
    if (uploadSession.user) {
      dto.user = {
        id: uploadSession.user.id,
        email: uploadSession.user.email,
        firstName: uploadSession.user.firstName,
        lastName: uploadSession.user.lastName,
      };
    }

    if (uploadSession.company) {
      dto.company = {
        id: uploadSession.company.id,
        name: uploadSession.company.name,
        slug: uploadSession.company.slug,
      };
    }

    return dto;
  }
}

import { File, ProcessingStatus } from '../entities/file.entity';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { Thread } from '../../thread/entities/thread.entity';
import { ChatRoom } from '../../chatroom/entities/chatroom.entity';

export class FileResponseDto {
  id: string;
  companyId: string;
  threadId?: string;
  chatroomId?: string;
  uploadedBy: string;
  originalName: string;
  displayName?: string;
  mimeType: string;
  sizeBytes: number;
  hash: string;
  storageKey: string;
  storageBucket: string;
  downloadUrl?: string;
  metadata?: Record<string, unknown>;
  isProcessed: boolean;
  processingStatus: ProcessingStatus;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  uploader?: {
    id: string;
    email: string;
    fullName: string;
  };

  company?: {
    id: string;
    name: string;
    slug: string;
  };

  thread?: {
    id: string;
    title: string;
  };

  chatRoom?: {
    id: string;
    name: string;
  };

  static fromEntity(file: File): FileResponseDto {
    const dto = new FileResponseDto();
    dto.id = file.id;
    dto.companyId = file.companyId;
    dto.threadId = file.threadId;
    dto.chatroomId = file.chatroomId;
    dto.uploadedBy = file.uploadedBy;
    dto.originalName = file.originalName;
    dto.displayName = file.displayName;
    dto.mimeType = file.mimeType;
    dto.sizeBytes = file.sizeBytes;
    dto.hash = file.hash;
    dto.storageKey = file.storageKey;
    dto.storageBucket = file.storageBucket;
    dto.downloadUrl = file.downloadUrl;
    dto.metadata = file.metadata;
    dto.isProcessed = file.isProcessed;
    dto.processingStatus = file.processingStatus;
    dto.createdAt = file.createdAt;
    dto.updatedAt = file.updatedAt;

    // Populate relations if available
    if (file.uploader) {
      dto.uploader = {
        id: file.uploader.id,
        email: file.uploader.email,
        fullName: file.uploader.fullName,
      };
    }

    if (file.company) {
      dto.company = {
        id: file.company.id,
        name: file.company.name,
        slug: file.company.slug,
      };
    }

    if (file.thread) {
      dto.thread = {
        id: file.thread.id,
        title: file.thread.title,
      };
    }

    if (file.chatRoom) {
      dto.chatRoom = {
        id: file.chatRoom.id,
        name: file.chatRoom.name,
      };
    }

    return dto;
  }
}

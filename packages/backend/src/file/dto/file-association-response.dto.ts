import {
  FileAssociation,
  AccessType,
} from '../entities/file-association.entity';
import { File } from '../entities/file.entity';
import { ChatRoom } from '../../chatroom/entities/chatroom.entity';
import { Thread } from '../../thread/entities/thread.entity';
import { User } from '../../user/entities/user.entity';

export class FileAssociationResponseDto {
  id: string;
  fileId: string;
  chatroomId?: string;
  threadId?: string;
  sharedBy: string;
  accessType: AccessType;
  permissions?: Record<string, unknown>;
  expiresAt?: Date;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  file?: {
    id: string;
    originalName: string;
    displayName?: string;
    sizeBytes: number;
    mimeType: string;
    downloadUrl?: string;
  };

  chatRoom?: {
    id: string;
    name: string;
  };

  thread?: {
    id: string;
    title: string;
  };

  sharer?: {
    id: string;
    email: string;
    fullName: string;
  };

  // Computed properties
  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  get isActive(): boolean {
    return !this.isExpired;
  }

  static fromEntity(
    fileAssociation: FileAssociation,
  ): FileAssociationResponseDto {
    const dto = new FileAssociationResponseDto();
    dto.id = fileAssociation.id;
    dto.fileId = fileAssociation.fileId;
    dto.chatroomId = fileAssociation.chatroomId;
    dto.threadId = fileAssociation.threadId;
    dto.sharedBy = fileAssociation.sharedBy;
    dto.accessType = fileAssociation.accessType;
    dto.permissions = fileAssociation.permissions;
    dto.expiresAt = fileAssociation.expiresAt;
    dto.isPinned = fileAssociation.isPinned;
    dto.createdAt = fileAssociation.createdAt;
    dto.updatedAt = fileAssociation.updatedAt;

    // Populate relations if available
    if (fileAssociation.file) {
      dto.file = {
        id: fileAssociation.file.id,
        originalName: fileAssociation.file.originalName,
        displayName: fileAssociation.file.displayName,
        sizeBytes: fileAssociation.file.sizeBytes,
        mimeType: fileAssociation.file.mimeType,
        downloadUrl: fileAssociation.file.downloadUrl,
      };
    }

    if (fileAssociation.chatRoom) {
      dto.chatRoom = {
        id: fileAssociation.chatRoom.id,
        name: fileAssociation.chatRoom.name,
      };
    }

    if (fileAssociation.thread) {
      dto.thread = {
        id: fileAssociation.thread.id,
        title: fileAssociation.thread.title,
      };
    }

    if (fileAssociation.sharer) {
      dto.sharer = {
        id: fileAssociation.sharer.id,
        email: fileAssociation.sharer.email,
        fullName: fileAssociation.sharer.fullName,
      };
    }

    return dto;
  }
}

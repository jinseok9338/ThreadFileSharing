import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsNumber,
  IsDateString,
} from 'class-validator';

// ===== Client to Server Events =====

export class JoinCompanyDto {
  @ApiProperty({ description: 'Company ID to join' })
  @IsUUID()
  companyId: string;
}

export class JoinChatroomDto {
  @ApiProperty({ description: 'Chatroom ID to join' })
  @IsUUID()
  chatroomId: string;
}

export class JoinThreadDto {
  @ApiProperty({ description: 'Thread ID to join' })
  @IsUUID()
  threadId: string;
}

export class UploadContextDto {
  @ApiProperty({
    description: 'Chatroom ID if uploading to chatroom',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  chatroomId?: string;

  @ApiProperty({
    description: 'Thread ID if uploading to thread',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  threadId?: string;

  @ApiProperty({
    description: 'Upload action type',
    enum: ['SHARE_FILE', 'CREATE_THREAD'],
  })
  @IsEnum(['SHARE_FILE', 'CREATE_THREAD'])
  action: 'SHARE_FILE' | 'CREATE_THREAD';
}

export class JoinUploadSessionDto {
  @ApiProperty({ description: 'Upload session ID to join' })
  @IsUUID()
  sessionId: string;

  @ApiProperty({
    description: 'Upload context information',
    type: UploadContextDto,
  })
  @IsObject()
  context: UploadContextDto;
}

export class LeaveRoomDto {
  @ApiProperty({ description: 'Room ID to leave' })
  @IsUUID()
  roomId: string;
}

export class SendChatroomMessageDto {
  @ApiProperty({ description: 'Chatroom ID' })
  @IsUUID()
  chatroomId: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: ['TEXT', 'SYSTEM'],
    default: 'TEXT',
  })
  @IsOptional()
  @IsEnum(['TEXT', 'SYSTEM'])
  messageType?: 'TEXT' | 'SYSTEM' = 'TEXT';

  @ApiProperty({ description: 'Message being replied to', required: false })
  @IsOptional()
  @IsUUID()
  replyToId?: string;
}

export class SendThreadMessageDto {
  @ApiProperty({ description: 'Thread ID' })
  @IsUUID()
  threadId: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: ['TEXT', 'SYSTEM'],
    default: 'TEXT',
  })
  @IsOptional()
  @IsEnum(['TEXT', 'SYSTEM'])
  messageType?: 'TEXT' | 'SYSTEM' = 'TEXT';

  @ApiProperty({ description: 'Message being replied to', required: false })
  @IsOptional()
  @IsUUID()
  replyToId?: string;
}

export class EditMessageDto {
  @ApiProperty({ description: 'Message ID to edit' })
  @IsUUID()
  messageId: string;

  @ApiProperty({ description: 'New message content' })
  @IsString()
  content: string;
}

export class DeleteMessageDto {
  @ApiProperty({ description: 'Message ID to delete' })
  @IsUUID()
  messageId: string;
}

export class TypingIndicatorDto {
  @ApiProperty({ description: 'Room ID where user is typing' })
  @IsUUID()
  roomId: string;
}

export class ShareThreadDto {
  @ApiProperty({ description: 'Thread ID to share' })
  @IsUUID()
  threadId: string;

  @ApiProperty({ description: 'User ID to share with' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Thread role for shared user',
    enum: ['MEMBER', 'VIEWER'],
  })
  @IsEnum(['MEMBER', 'VIEWER'])
  threadRole: 'MEMBER' | 'VIEWER';

  @ApiProperty({ description: 'Optional sharing message', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class AddThreadParticipantDto {
  @ApiProperty({ description: 'Thread ID' })
  @IsUUID()
  threadId: string;

  @ApiProperty({ description: 'User ID to add' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Thread role',
    enum: ['OWNER', 'MEMBER', 'VIEWER'],
  })
  @IsEnum(['OWNER', 'MEMBER', 'VIEWER'])
  threadRole: 'OWNER' | 'MEMBER' | 'VIEWER';
}

export class UpdateThreadParticipantDto {
  @ApiProperty({ description: 'Thread ID' })
  @IsUUID()
  threadId: string;

  @ApiProperty({ description: 'User ID to update' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'New thread role',
    enum: ['OWNER', 'MEMBER', 'VIEWER'],
  })
  @IsEnum(['OWNER', 'MEMBER', 'VIEWER'])
  threadRole: 'OWNER' | 'MEMBER' | 'VIEWER';
}

export class RemoveThreadParticipantDto {
  @ApiProperty({ description: 'Thread ID' })
  @IsUUID()
  threadId: string;

  @ApiProperty({ description: 'User ID to remove' })
  @IsUUID()
  userId: string;
}

export class CancelUploadDto {
  @ApiProperty({ description: 'Upload session ID' })
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Specific file ID to cancel', required: false })
  @IsOptional()
  @IsUUID()
  fileId?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'User status',
    enum: ['online', 'away', 'busy', 'offline'],
  })
  @IsEnum(['online', 'away', 'busy', 'offline'])
  status: 'online' | 'away' | 'busy' | 'offline';

  @ApiProperty({ description: 'Custom status message', required: false })
  @IsOptional()
  @IsString()
  customMessage?: string;
}

// ===== Server to Client Events =====

export class UserInfoDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Full name', required: false })
  fullName?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  avatarUrl?: string;

  @ApiProperty({
    description: 'User status',
    enum: ['online', 'away', 'busy', 'offline'],
  })
  status: 'online' | 'away' | 'busy' | 'offline';

  @ApiProperty({ description: 'Last seen timestamp' })
  lastSeenAt: Date;

  @ApiProperty({
    description: 'Company role',
    enum: ['owner', 'admin', 'member'],
  })
  companyRole: 'owner' | 'admin' | 'member';
}

export class ThreadInfoDto {
  @ApiProperty({ description: 'Thread ID' })
  id: string;

  @ApiProperty({ description: 'Thread title' })
  title: string;

  @ApiProperty({ description: 'Thread description', required: false })
  description?: string;

  @ApiProperty({ description: 'Chatroom ID' })
  chatroomId: string;

  @ApiProperty({ description: 'Thread creator', type: UserInfoDto })
  createdBy: UserInfoDto;

  @ApiProperty({ description: 'Number of participants' })
  participantCount: number;

  @ApiProperty({ description: 'Number of files' })
  fileCount: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class ReplyToDto {
  @ApiProperty({ description: 'Message ID being replied to' })
  messageId: string;

  @ApiProperty({ description: 'Original message content' })
  content: string;

  @ApiProperty({ description: 'Original sender name' })
  senderName: string;
}

export class CompanyNotificationDto {
  @ApiProperty({ description: 'Notification ID' })
  notificationId: string;

  @ApiProperty({
    description: 'Notification type',
    enum: [
      'storage_quota_warning',
      'storage_quota_exceeded',
      'system_message',
      'company_update',
    ],
  })
  type:
    | 'storage_quota_warning'
    | 'storage_quota_exceeded'
    | 'system_message'
    | 'company_update';

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  message: string;

  @ApiProperty({
    description: 'Priority level',
    enum: ['low', 'normal', 'high', 'urgent'],
  })
  priority: 'low' | 'normal' | 'high' | 'urgent';

  @ApiProperty({ description: 'Additional notification data', required: false })
  data?: any;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class ChatroomMessageReceivedDto {
  @ApiProperty({ description: 'Message ID' })
  messageId: string;

  @ApiProperty({ description: 'Chatroom ID' })
  chatroomId: string;

  @ApiProperty({ description: 'Message sender', type: UserInfoDto })
  sender: UserInfoDto;

  @ApiProperty({ description: 'Message content' })
  content: string;

  @ApiProperty({ description: 'Message type', enum: ['TEXT', 'SYSTEM'] })
  messageType: 'TEXT' | 'SYSTEM';

  @ApiProperty({
    description: 'Reply information',
    type: ReplyToDto,
    required: false,
  })
  replyTo?: ReplyToDto;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class ThreadMessageReceivedDto {
  @ApiProperty({ description: 'Message ID' })
  messageId: string;

  @ApiProperty({ description: 'Thread ID' })
  threadId: string;

  @ApiProperty({ description: 'Message sender', type: UserInfoDto })
  sender: UserInfoDto;

  @ApiProperty({ description: 'Message content' })
  content: string;

  @ApiProperty({ description: 'Message type', enum: ['TEXT', 'SYSTEM'] })
  messageType: 'TEXT' | 'SYSTEM';

  @ApiProperty({
    description: 'Reply information',
    type: ReplyToDto,
    required: false,
  })
  replyTo?: ReplyToDto;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class MessageEditedDto {
  @ApiProperty({ description: 'Message ID' })
  messageId: string;

  @ApiProperty({ description: 'Context type', enum: ['chatroom', 'thread'] })
  contextType: 'chatroom' | 'thread';

  @ApiProperty({ description: 'Context ID' })
  contextId: string;

  @ApiProperty({ description: 'Message sender', type: UserInfoDto })
  sender: UserInfoDto;

  @ApiProperty({ description: 'Updated content' })
  content: string;

  @ApiProperty({ description: 'Edit timestamp' })
  editedAt: Date;
}

export class MessageDeletedDto {
  @ApiProperty({ description: 'Message ID' })
  messageId: string;

  @ApiProperty({ description: 'Context type', enum: ['chatroom', 'thread'] })
  contextType: 'chatroom' | 'thread';

  @ApiProperty({ description: 'Context ID' })
  contextId: string;

  @ApiProperty({ description: 'User who deleted', type: UserInfoDto })
  deletedBy: UserInfoDto;

  @ApiProperty({ description: 'Deletion timestamp' })
  deletedAt: Date;
}

export class TypingDto {
  @ApiProperty({ description: 'Room ID' })
  roomId: string;

  @ApiProperty({ description: 'Typing user', type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({ description: 'Is currently typing' })
  isTyping: boolean;
}

export class UserJoinedRoomDto {
  @ApiProperty({ description: 'Room ID' })
  roomId: string;

  @ApiProperty({ description: 'Joined user', type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({ description: 'Join timestamp' })
  joinedAt: Date;
}

export class UserLeftRoomDto {
  @ApiProperty({ description: 'Room ID' })
  roomId: string;

  @ApiProperty({ description: 'User who left', type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({ description: 'Leave timestamp' })
  leftAt: Date;
}

export class ThreadSharedDto {
  @ApiProperty({ description: 'Thread ID' })
  threadId: string;

  @ApiProperty({ description: 'Thread information', type: ThreadInfoDto })
  thread: ThreadInfoDto;

  @ApiProperty({ description: 'User who shared', type: UserInfoDto })
  sharedBy: UserInfoDto;

  @ApiProperty({ description: 'User shared with', type: UserInfoDto })
  sharedWith: UserInfoDto;

  @ApiProperty({
    description: 'Thread role for shared user',
    enum: ['MEMBER', 'VIEWER'],
  })
  threadRole: 'MEMBER' | 'VIEWER';

  @ApiProperty({ description: 'Sharing message', required: false })
  message?: string;

  @ApiProperty({ description: 'Share timestamp' })
  sharedAt: Date;
}

export class ThreadParticipantAddedDto {
  @ApiProperty({ description: 'Thread ID' })
  threadId: string;

  @ApiProperty({ description: 'Added participant', type: UserInfoDto })
  participant: UserInfoDto;

  @ApiProperty({
    description: 'Thread role',
    enum: ['OWNER', 'MEMBER', 'VIEWER'],
  })
  threadRole: 'OWNER' | 'MEMBER' | 'VIEWER';

  @ApiProperty({ description: 'User who added', type: UserInfoDto })
  addedBy: UserInfoDto;

  @ApiProperty({ description: 'Addition timestamp' })
  addedAt: Date;
}

export class ThreadParticipantUpdatedDto {
  @ApiProperty({ description: 'Thread ID' })
  threadId: string;

  @ApiProperty({ description: 'Updated participant', type: UserInfoDto })
  participant: UserInfoDto;

  @ApiProperty({ description: 'Old role', enum: ['OWNER', 'MEMBER', 'VIEWER'] })
  oldRole: 'OWNER' | 'MEMBER' | 'VIEWER';

  @ApiProperty({ description: 'New role', enum: ['OWNER', 'MEMBER', 'VIEWER'] })
  newRole: 'OWNER' | 'MEMBER' | 'VIEWER';

  @ApiProperty({ description: 'User who updated', type: UserInfoDto })
  updatedBy: UserInfoDto;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;
}

export class ThreadParticipantRemovedDto {
  @ApiProperty({ description: 'Thread ID' })
  threadId: string;

  @ApiProperty({ description: 'Removed participant', type: UserInfoDto })
  participant: UserInfoDto;

  @ApiProperty({ description: 'User who removed', type: UserInfoDto })
  removedBy: UserInfoDto;

  @ApiProperty({ description: 'Removal timestamp' })
  removedAt: Date;
}

export class FileUploadProgressDto {
  @ApiProperty({ description: 'Upload session ID' })
  sessionId: string;

  @ApiProperty({ description: 'File ID' })
  fileId: string;

  @ApiProperty({ description: 'Original file name' })
  originalName: string;

  @ApiProperty({
    description: 'Upload status',
    enum: ['PENDING', 'UPLOADING', 'COMPLETED', 'FAILED', 'CANCELLED'],
  })
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  progressPercentage: number;

  @ApiProperty({ description: 'Bytes uploaded' })
  bytesUploaded: number;

  @ApiProperty({ description: 'Total bytes' })
  totalBytes: number;

  @ApiProperty({ description: 'Upload speed in bytes/second' })
  uploadSpeed: number;

  @ApiProperty({ description: 'Estimated time remaining in seconds' })
  estimatedTimeRemaining: number;

  @ApiProperty({ description: 'Upload context', type: UploadContextDto })
  context: UploadContextDto;

  @ApiProperty({ description: 'Progress timestamp' })
  timestamp: Date;
}

export class FileUploadCompletedDto {
  @ApiProperty({ description: 'Upload session ID' })
  sessionId: string;

  @ApiProperty({ description: 'File ID' })
  fileId: string;

  @ApiProperty({ description: 'Original file name' })
  originalName: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'File MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'Download URL' })
  downloadUrl: string;

  @ApiProperty({ description: 'Uploader', type: UserInfoDto })
  uploadedBy: UserInfoDto;

  @ApiProperty({ description: 'Upload context', type: UploadContextDto })
  context: UploadContextDto;

  @ApiProperty({ description: 'Auto-generated actions', required: false })
  autoActions?: {
    chatroomMessage?: {
      messageId: string;
      content: string;
      messageType: 'FILE_SHARE';
    };
    threadCreated?: {
      threadId: string;
      title: string;
      description: string;
    };
  };

  @ApiProperty({ description: 'Completion timestamp' })
  completedAt: Date;
}

export class FileUploadFailedDto {
  @ApiProperty({ description: 'Upload session ID' })
  sessionId: string;

  @ApiProperty({ description: 'File ID' })
  fileId: string;

  @ApiProperty({ description: 'Original file name' })
  originalName: string;

  @ApiProperty({ description: 'Error code' })
  errorCode: string;

  @ApiProperty({ description: 'Error message' })
  errorMessage: string;

  @ApiProperty({ description: 'Is error retryable' })
  retryable: boolean;

  @ApiProperty({ description: 'Upload context', type: UploadContextDto })
  context: UploadContextDto;

  @ApiProperty({ description: 'Failure timestamp' })
  failedAt: Date;
}

export class FileProcessedDto {
  @ApiProperty({ description: 'File ID' })
  fileId: string;

  @ApiProperty({ description: 'Original file name' })
  originalName: string;

  @ApiProperty({
    description: 'Processing status',
    enum: ['COMPLETED', 'FAILED'],
  })
  processingStatus: 'COMPLETED' | 'FAILED';

  @ApiProperty({ description: 'Processing results', required: false })
  processingResults?: {
    thumbnails?: string[];
    previewUrl?: string;
    extractedText?: string;
    metadata?: any;
  };

  @ApiProperty({ description: 'Processing completion timestamp' })
  processedAt: Date;
}

export class UserStatusChangedDto {
  @ApiProperty({ description: 'User information', type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({
    description: 'New status',
    enum: ['online', 'away', 'busy', 'offline'],
  })
  status: 'online' | 'away' | 'busy' | 'offline';

  @ApiProperty({ description: 'Custom status message', required: false })
  customMessage?: string;

  @ApiProperty({ description: 'Last seen timestamp' })
  lastSeenAt: Date;
}

export class PermissionChangedDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({
    description: 'Change type',
    enum: ['role_changed', 'access_revoked', 'access_granted'],
  })
  changeType: 'role_changed' | 'access_revoked' | 'access_granted';

  @ApiProperty({ description: 'Context information' })
  context: {
    type: 'company' | 'chatroom' | 'thread';
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Old role', required: false })
  oldRole?: string;

  @ApiProperty({ description: 'New role', required: false })
  newRole?: string;

  @ApiProperty({ description: 'User who made the change', type: UserInfoDto })
  changedBy: UserInfoDto;

  @ApiProperty({ description: 'Change timestamp' })
  changedAt: Date;
}

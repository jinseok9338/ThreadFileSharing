/**
 * Chat Room API Contracts
 * Generated from functional requirements for UI-focused implementation
 */

// =============================================================================
// Chat Room Management
// =============================================================================

export interface GetChatRoomsRequest {
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
}

export interface GetChatRoomsResponse {
  chatRooms: ChatRoomSummary[];
  total: number;
  hasMore: boolean;
}

export interface ChatRoomSummary {
  id: string;
  name: string;
  type: "direct" | "group" | "channel";
  lastMessage?: {
    id: string;
    content: string;
    senderName: string;
    createdAt: string;
  };
  participantCount: number;
  unreadCount: number;
  isArchived: boolean;
}

export interface GetChatRoomRequest {
  chatRoomId: string;
}

export interface GetChatRoomResponse {
  chatRoom: ChatRoomDetail;
}

export interface ChatRoomDetail {
  id: string;
  name: string;
  description?: string;
  type: "direct" | "group" | "channel";
  participants: ParticipantInfo[];
  createdAt: string;
  updatedAt: string;
  createdBy: UserInfo;
}

// =============================================================================
// Message Management
// =============================================================================

export interface GetMessagesRequest {
  chatRoomId: string;
  limit?: number;
  before?: string; // message ID for pagination
  after?: string; // message ID for pagination
}

export interface GetMessagesResponse {
  messages: MessageDetail[];
  hasMore: boolean;
  total: number;
}

export interface MessageDetail {
  id: string;
  content: string;
  type: "text" | "file" | "system";
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  isEdited: boolean;
  sender: UserInfo;
  replyTo?: MessageSummary;
  thread?: ThreadSummary;
  attachments?: FileAttachmentSummary[];
}

export interface MessageSummary {
  id: string;
  content: string;
  senderName: string;
  createdAt: string;
}

export interface SendMessageRequest {
  chatRoomId: string;
  content: string;
  replyToId?: string;
  threadId?: string;
}

export interface SendMessageResponse {
  message: MessageDetail;
}

export interface EditMessageRequest {
  messageId: string;
  content: string;
}

export interface EditMessageResponse {
  message: MessageDetail;
}

export interface DeleteMessageRequest {
  messageId: string;
}

export interface DeleteMessageResponse {
  success: boolean;
}

// =============================================================================
// File Upload & Thread Creation
// =============================================================================

export interface UploadFileRequest {
  chatRoomId: string;
  file: File;
  description?: string;
}

export interface UploadFileResponse {
  attachment: FileAttachmentDetail;
  thread?: ThreadDetail;
  message: MessageDetail;
}

export interface FileAttachmentDetail {
  id: string;
  filename: string;
  displayName: string;
  mimeType: string;
  size: number;
  uploadStatus: "uploading" | "completed" | "failed";
  downloadUrl: string;
  createdAt: string;
  uploadedBy: UserInfo;
}

export interface FileAttachmentSummary {
  id: string;
  filename: string;
  displayName: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
}

export interface CreateThreadRequest {
  chatRoomId: string;
  title: string;
  description?: string;
  rootFileId?: string;
}

export interface CreateThreadResponse {
  thread: ThreadDetail;
}

export interface ThreadDetail {
  id: string;
  title: string;
  description?: string;
  chatRoomId: string;
  createdBy: UserInfo;
  rootFile?: FileAttachmentSummary;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface ThreadSummary {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
}

export interface GetThreadMessagesRequest {
  threadId: string;
  limit?: number;
  before?: string;
  after?: string;
}

export interface GetThreadMessagesResponse {
  messages: MessageDetail[];
  hasMore: boolean;
  total: number;
}

// =============================================================================
// Real-time Communication (Socket.io Events)
// =============================================================================

export interface SocketEvents {
  // Client to Server
  "join-chat-room": (chatRoomId: string) => void;
  "leave-chat-room": (chatRoomId: string) => void;
  "typing-start": (chatRoomId: string) => void;
  "typing-stop": (chatRoomId: string) => void;
  "send-message": (data: SendMessageRequest) => void;
  "edit-message": (data: EditMessageRequest) => void;
  "delete-message": (data: DeleteMessageRequest) => void;

  // Server to Client
  "message-received": (message: MessageDetail) => void;
  "message-edited": (message: MessageDetail) => void;
  "message-deleted": (data: { messageId: string; chatRoomId: string }) => void;
  "user-typing": (data: {
    userId: string;
    userName: string;
    chatRoomId: string;
  }) => void;
  "user-stopped-typing": (data: { userId: string; chatRoomId: string }) => void;
  "user-joined": (data: { user: UserInfo; chatRoomId: string }) => void;
  "user-left": (data: { user: UserInfo; chatRoomId: string }) => void;
  "file-upload-progress": (data: {
    attachmentId: string;
    progress: number;
    chatRoomId: string;
  }) => void;
  "file-upload-complete": (data: {
    attachment: FileAttachmentDetail;
    chatRoomId: string;
  }) => void;
  "file-upload-failed": (data: {
    attachmentId: string;
    error: string;
    chatRoomId: string;
  }) => void;
  "thread-created": (data: {
    thread: ThreadDetail;
    chatRoomId: string;
  }) => void;
}

// =============================================================================
// User & Settings
// =============================================================================

export interface UserInfo {
  id: string;
  displayName: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeenAt?: string;
}

export interface ParticipantInfo {
  user: UserInfo;
  role: "admin" | "member" | "readonly";
  joinedAt: string;
  lastReadAt?: string;
  isActive: boolean;
  isMuted: boolean;
  notificationsEnabled: boolean;
}

export interface GetUserSettingsRequest {
  userId: string;
}

export interface GetUserSettingsResponse {
  settings: UserSettings;
}

export interface UserSettings {
  theme: "light" | "dark";
  language: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  chat: {
    enterToSend: boolean;
    showTimestamps: boolean;
    showReadReceipts: boolean;
  };
}

export interface UpdateUserSettingsRequest {
  theme?: "light" | "dark";
  language?: string;
  notifications?: Partial<UserSettings["notifications"]>;
  chat?: Partial<UserSettings["chat"]>;
}

export interface UpdateUserSettingsResponse {
  settings: UserSettings;
}

// =============================================================================
// Error Responses
// =============================================================================

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

// Common error codes
export type ChatErrorCode =
  | "CHAT_ROOM_NOT_FOUND"
  | "MESSAGE_NOT_FOUND"
  | "INSUFFICIENT_PERMISSIONS"
  | "FILE_UPLOAD_FAILED"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "THREAD_NOT_FOUND"
  | "USER_NOT_PARTICIPANT"
  | "MESSAGE_TOO_LONG"
  | "INVALID_MESSAGE_TYPE";

// =============================================================================
// Request/Response Wrappers
// =============================================================================

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorResponse["error"];
  timestamp: string;
  path?: string;
}

// =============================================================================
// Validation Schemas (Zod)
// =============================================================================

import { z } from "zod";

export const ChatRoomTypeSchema = z.enum(["direct", "group", "channel"]);
export const MessageTypeSchema = z.enum(["text", "file", "system"]);
export const UserStatusSchema = z.enum(["online", "away", "busy", "offline"]);
export const ParticipantRoleSchema = z.enum(["admin", "member", "readonly"]);
export const UploadStatusSchema = z.enum(["uploading", "completed", "failed"]);
export const ThemeSchema = z.enum(["light", "dark"]);

export const SendMessageRequestSchema = z.object({
  chatRoomId: z.string().uuid(),
  content: z.string().min(1).max(4000),
  replyToId: z.string().uuid().optional(),
  threadId: z.string().uuid().optional(),
});

export const EditMessageRequestSchema = z.object({
  messageId: z.string().uuid(),
  content: z.string().min(1).max(4000),
});

export const UploadFileRequestSchema = z.object({
  chatRoomId: z.string().uuid(),
  description: z.string().max(500).optional(),
});

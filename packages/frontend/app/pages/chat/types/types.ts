/**
 * Chat page types
 * Types specific to the chat page functionality
 */

export type ChatRoomType = "direct" | "group" | "channel";

export type MessageType = "text" | "file" | "system";

export type UserStatus = "online" | "away" | "busy" | "offline";

export type ParticipantRole = "admin" | "member" | "readonly";

export type UploadStatus = "uploading" | "completed" | "failed";

export type Theme = "light" | "dark";

// User types
export interface User {
  id: string;
  displayName: string;
  avatar?: string;
  status: UserStatus;
  lastSeenAt?: string;
}

// Chat room types
export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: ChatRoomType;
  createdAt: string;
  updatedAt: string;
  lastMessageId?: string;
  participantCount: number;
  unreadCount: number;
  isArchived: boolean;
  createdBy: User;
}

export interface ChatRoomSummary {
  id: string;
  name: string;
  type: ChatRoomType;
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

// Message types
export interface Message {
  id: string;
  content: string;
  type: MessageType;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  isEdited: boolean;
  sender: User;
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

// Thread types
export interface Thread {
  id: string;
  title: string;
  description?: string;
  chatRoomId: string;
  createdBy: User;
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

// File attachment types
export interface FileAttachment {
  id: string;
  filename: string;
  displayName: string;
  mimeType: string;
  size: number;
  uploadStatus: UploadStatus;
  downloadUrl: string;
  createdAt: string;
  uploadedBy: User;
}

export interface FileAttachmentSummary {
  id: string;
  filename: string;
  displayName: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
}

// Participant types
export interface ChatRoomParticipant {
  user: User;
  role: ParticipantRole;
  joinedAt: string;
  lastReadAt?: string;
  isActive: boolean;
  isMuted: boolean;
  notificationsEnabled: boolean;
}

// UI State types
export interface ChatState {
  selectedChatRoomId?: string;
  selectedThreadId?: string;
  isMiddleColumnCollapsed: boolean;
  isThreadColumnCollapsed: boolean;
}

export interface TypingState {
  userId: string;
  userName: string;
  chatRoomId: string;
  isTyping: boolean;
}

// Settings types
export interface UserSettings {
  theme: Theme;
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

// Mock data types for UI development
export interface MockChatData {
  chatRooms: ChatRoomSummary[];
  messages: Record<string, Message[]>; // chatRoomId -> messages
  threads: Record<string, Thread[]>; // chatRoomId -> threads
  threadMessages: Record<string, Message[]>; // threadId -> messages
  currentUser: User;
  settings: UserSettings;
}

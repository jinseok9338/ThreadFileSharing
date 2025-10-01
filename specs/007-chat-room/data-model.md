# Data Model: Chat Room Layout

**Feature**: Chat Room Layout  
**Date**: 2025-10-01  
**Scope**: UI-focused implementation with real-time messaging and file upload capabilities

## Entities

### ChatRoom

Represents a conversation space with participants, messages, and metadata.

**Fields**:

- `id: string` - Unique identifier
- `name: string` - Display name for the chat room
- `description?: string` - Optional description
- `type: 'direct' | 'group' | 'channel'` - Room type classification
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last update timestamp
- `lastMessageId?: string` - Reference to most recent message
- `participantCount: number` - Number of active participants
- `isArchived: boolean` - Archive status
- `createdById: string` - User who created the room

**Relationships**:

- `messages: Message[]` - One-to-many with messages
- `participants: ChatRoomParticipant[]` - One-to-many with participants
- `threads: Thread[]` - One-to-many with threads
- `creator: User` - Many-to-one with user (createdBy)

**Validation Rules**:

- Name must be 1-100 characters
- Description must be 0-500 characters
- Type must be one of the defined enum values

### Message

Represents individual communication with sender, content, timestamp, and type.

**Fields**:

- `id: string` - Unique identifier
- `content: string` - Message text content
- `type: 'text' | 'file' | 'system'` - Message type
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last update timestamp
- `editedAt?: Date` - Edit timestamp if modified
- `chatRoomId: string` - Reference to chat room
- `senderId: string` - Reference to sender user
- `replyToId?: string` - Reference to replied message
- `threadId?: string` - Reference to associated thread
- `isEdited: boolean` - Edit status flag
- `isDeleted: boolean` - Deletion status flag

**Relationships**:

- `chatRoom: ChatRoom` - Many-to-one with chat room
- `sender: User` - Many-to-one with user
- `attachments: FileAttachment[]` - One-to-many with attachments
- `replyTo?: Message` - Self-referential for replies
- `thread?: Thread` - Many-to-one with thread

**Validation Rules**:

- Content must be 1-4000 characters for text messages
- Content can be empty for file/system messages
- Sender must be a participant in the chat room

### Thread

Represents a focused discussion space created from file uploads with associated files and messages.

**Fields**:

- `id: string` - Unique identifier
- `title: string` - Thread title (usually filename)
- `description?: string` - Optional thread description
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last update timestamp
- `chatRoomId: string` - Reference to parent chat room
- `createdById: string` - User who created the thread
- `rootFileId?: string` - Reference to initial file that created thread
- `messageCount: number` - Number of messages in thread
- `isArchived: boolean` - Archive status

**Relationships**:

- `chatRoom: ChatRoom` - Many-to-one with chat room
- `creator: User` - Many-to-one with user
- `messages: Message[]` - One-to-many with messages
- `files: FileAttachment[]` - One-to-many with file attachments
- `rootFile?: FileAttachment` - Many-to-one with file attachment

**Validation Rules**:

- Title must be 1-200 characters
- Description must be 0-1000 characters
- Must be associated with a chat room

### FileAttachment

Represents uploaded files with metadata (name, size, type, upload status).

**Fields**:

- `id: string` - Unique identifier
- `filename: string` - Original filename
- `displayName: string` - Display name for UI
- `mimeType: string` - File MIME type
- `size: number` - File size in bytes
- `storagePath: string` - File storage location
- `uploadStatus: 'uploading' | 'completed' | 'failed'` - Upload status
- `createdAt: Date` - Creation timestamp
- `uploadedById: string` - User who uploaded the file
- `messageId?: string` - Reference to associated message
- `threadId?: string` - Reference to associated thread
- `downloadCount: number` - Number of downloads
- `isPublic: boolean` - Public access flag

**Relationships**:

- `uploader: User` - Many-to-one with user
- `message?: Message` - Many-to-one with message
- `thread?: Thread` - Many-to-one with thread

**Validation Rules**:

- Filename must be 1-255 characters
- Display name must be 1-255 characters
- File size must be within limits (e.g., 100MB max)
- MIME type must be in allowed list

### ChatRoomParticipant

Represents user participation in chat rooms with roles and permissions.

**Fields**:

- `id: string` - Unique identifier
- `chatRoomId: string` - Reference to chat room
- `userId: string` - Reference to user
- `role: 'admin' | 'member' | 'readonly'` - Participant role
- `joinedAt: Date` - Join timestamp
- `lastReadAt?: Date` - Last read message timestamp
- `isActive: boolean` - Active participation status
- `isMuted: boolean` - Mute status
- `notificationsEnabled: boolean` - Notification preference

**Relationships**:

- `chatRoom: ChatRoom` - Many-to-one with chat room
- `user: User` - Many-to-one with user

**Validation Rules**:

- Role must be one of the defined enum values
- User can only have one role per chat room
- LastReadAt cannot be in the future

### User

Represents a participant with profile information, avatar, and typing status.

**Fields**:

- `id: string` - Unique identifier (inherited from auth system)
- `displayName: string` - Display name for chat
- `avatar?: string` - Avatar image URL
- `status: 'online' | 'away' | 'busy' | 'offline'` - User status
- `lastSeenAt?: Date` - Last seen timestamp
- `typingIn?: string` - Chat room ID where user is currently typing
- `theme: 'light' | 'dark'` - User theme preference
- `language: string` - User language preference

**Validation Rules**:

- Display name must be 1-100 characters
- Status must be one of the defined enum values
- Theme must be 'light' or 'dark'

## State Transitions

### Message States

```
draft → sending → sent → [edited] → [deleted]
```

### File Upload States

```
pending → uploading → completed
pending → uploading → failed → retry → completed
```

### Chat Room Participation

```
invited → joined → active → [muted] → [left] → archived
```

### Thread Lifecycle

```
created → active → archived
```

## Database Constraints

### Primary Keys

- All entities have UUID primary keys
- Composite primary keys for junction tables (ChatRoomParticipant)

### Foreign Key Constraints

- Messages must reference valid chat rooms and users
- File attachments must reference valid users
- Threads must reference valid chat rooms and users
- Participants must reference valid chat rooms and users

### Unique Constraints

- User can only participate once per chat room
- Filename + user combination must be unique within context

### Check Constraints

- File size must be positive
- Message content length must be within limits
- Timestamps cannot be in the future
- Enum values must match defined sets

## Indexes

### Performance Indexes

- `messages_chatroom_created_idx` - Chat room messages by creation time
- `messages_sender_created_idx` - User messages by creation time
- `files_uploader_created_idx` - User files by upload time
- `participants_user_active_idx` - Active user participations
- `threads_chatroom_updated_idx` - Chat room threads by update time

### Query Optimization

- Composite indexes for common query patterns
- Partial indexes for active/archived records
- Covering indexes for list queries

## Data Relationships Summary

```
User (1) ←→ (N) ChatRoomParticipant (N) ←→ (1) ChatRoom
ChatRoom (1) ←→ (N) Message (N) ←→ (1) User
ChatRoom (1) ←→ (N) Thread (N) ←→ (1) User
Message (1) ←→ (N) FileAttachment (N) ←→ (1) User
Thread (1) ←→ (N) FileAttachment
Message (1) ←→ (0..1) Thread
```

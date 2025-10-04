# Data Model: 대용량 처리 및 코어 비지니스 로직 완성

## Core Entities

### Chatroom Entity

```typescript
@Entity("chatrooms")
export class Chatroom {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "enum", enum: ChatroomType, default: ChatroomType.PUBLIC })
  type: ChatroomType;

  @Column({
    type: "enum",
    enum: ChatroomStatus,
    default: ChatroomStatus.ACTIVE,
  })
  status: ChatroomStatus;

  @Column({ type: "jsonb", nullable: true })
  settings: ChatroomSettings;

  @ManyToOne(() => Company, (company) => company.chatrooms)
  @JoinColumn({ name: "companyId" })
  company: Company;

  @Column({ name: "companyId" })
  companyId: string;

  @OneToMany(() => ChatroomMember, (member) => member.chatroom)
  members: ChatroomMember[];

  @OneToMany(() => Message, (message) => message.chatroom)
  messages: Message[];

  @OneToMany(() => Thread, (thread) => thread.chatroom)
  threads: Thread[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Message Entity

```typescript
@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "enum", enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ type: "jsonb", nullable: true })
  metadata: MessageMetadata;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: "senderId" })
  sender: User;

  @Column({ name: "senderId" })
  senderId: string;

  @ManyToOne(() => Chatroom, (chatroom) => chatroom.messages)
  @JoinColumn({ name: "chatroomId" })
  chatroom: Chatroom;

  @Column({ name: "chatroomId" })
  chatroomId: string;

  @ManyToOne(() => Thread, (thread) => thread.messages, { nullable: true })
  @JoinColumn({ name: "threadId" })
  thread: Thread;

  @Column({ name: "threadId", nullable: true })
  threadId: string;

  @OneToMany(() => MessageReaction, (reaction) => reaction.message)
  reactions: MessageReaction[];

  @OneToMany(() => MessageAttachment, (attachment) => attachment.message)
  attachments: MessageAttachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  editedAt: Date;
}
```

### Thread Entity

```typescript
@Entity("threads")
export class Thread {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: ThreadStatus, default: ThreadStatus.ACTIVE })
  status: ThreadStatus;

  @Column({ type: "enum", enum: ThreadType, default: ThreadType.DISCUSSION })
  type: ThreadType;

  @Column({ type: "jsonb", nullable: true })
  settings: ThreadSettings;

  @ManyToOne(() => User, (user) => user.createdThreads)
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @Column({ name: "createdById" })
  createdById: string;

  @ManyToOne(() => Chatroom, (chatroom) => chatroom.threads)
  @JoinColumn({ name: "chatroomId" })
  chatroom: Chatroom;

  @Column({ name: "chatroomId" })
  chatroomId: string;

  @OneToMany(() => ThreadMember, (member) => member.thread)
  members: ThreadMember[];

  @OneToMany(() => Message, (message) => message.thread)
  messages: Message[];

  @OneToMany(() => File, (file) => file.thread)
  files: File[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  archivedAt: Date;
}
```

### File Upload Session Entity

```typescript
@Entity("file_upload_sessions")
export class FileUploadSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  originalFileName: string;

  @Column({ type: "bigint" })
  totalSizeBytes: bigint;

  @Column({ type: "int", default: 0 })
  uploadedChunks: number;

  @Column({ type: "int" })
  totalChunks: number;

  @Column({ type: "bigint", default: 0 })
  uploadedBytes: bigint;

  @Column({ type: "enum", enum: UploadStatus, default: UploadStatus.PENDING })
  status: UploadStatus;

  @Column({ type: "jsonb" })
  chunkMetadata: ChunkMetadata[];

  @Column({ type: "jsonb", nullable: true })
  metadata: FileMetadata;

  @ManyToOne(() => User, (user) => user.uploadSessions)
  @JoinColumn({ name: "uploadedById" })
  uploadedBy: User;

  @Column({ name: "uploadedById" })
  uploadedById: string;

  @ManyToOne(() => Chatroom, (chatroom) => chatroom.uploadSessions, {
    nullable: true,
  })
  @JoinColumn({ name: "chatroomId" })
  chatroom: Chatroom;

  @Column({ name: "chatroomId", nullable: true })
  chatroomId: string;

  @ManyToOne(() => Thread, (thread) => thread.uploadSessions, {
    nullable: true,
  })
  @JoinColumn({ name: "threadId" })
  thread: Thread;

  @Column({ name: "threadId", nullable: true })
  threadId: string;

  @OneToOne(() => File, (file) => file.uploadSession, { nullable: true })
  file: File;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;
}
```

## Supporting Entities

### ChatroomMember Entity

```typescript
@Entity("chatroom_members")
export class ChatroomMember {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: ChatroomRole, default: ChatroomRole.MEMBER })
  role: ChatroomRole;

  @Column({ type: "enum", enum: AccessType, default: AccessType.FULL })
  accessType: AccessType;

  @Column({ type: "jsonb", nullable: true })
  preferences: MemberPreferences;

  @ManyToOne(() => User, (user) => user.chatroomMemberships)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ name: "userId" })
  userId: string;

  @ManyToOne(() => Chatroom, (chatroom) => chatroom.members)
  @JoinColumn({ name: "chatroomId" })
  chatroom: Chatroom;

  @Column({ name: "chatroomId" })
  chatroomId: string;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### ThreadMember Entity

```typescript
@Entity("thread_members")
export class ThreadMember {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: ThreadRole, default: ThreadRole.PARTICIPANT })
  role: ThreadRole;

  @Column({ type: "enum", enum: AccessType, default: AccessType.FULL })
  accessType: AccessType;

  @Column({ type: "jsonb", nullable: true })
  preferences: MemberPreferences;

  @ManyToOne(() => User, (user) => user.threadMemberships)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ name: "userId" })
  userId: string;

  @ManyToOne(() => Thread, (thread) => thread.members)
  @JoinColumn({ name: "threadId" })
  thread: Thread;

  @Column({ name: "threadId" })
  threadId: string;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### MessageReaction Entity

```typescript
@Entity("message_reactions")
export class MessageReaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  emoji: string;

  @ManyToOne(() => User, (user) => user.messageReactions)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ name: "userId" })
  userId: string;

  @ManyToOne(() => Message, (message) => message.reactions)
  @JoinColumn({ name: "messageId" })
  message: Message;

  @Column({ name: "messageId" })
  messageId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Index(["userId", "messageId", "emoji"], { unique: true })
  static uniqueReactionConstraint;
}
```

## Enums and Types

### ChatroomType

```typescript
export enum ChatroomType {
  PUBLIC = "public",
  PRIVATE = "private",
  DIRECT = "direct",
}
```

### ChatroomStatus

```typescript
export enum ChatroomStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  DELETED = "deleted",
}
```

### MessageType

```typescript
export enum MessageType {
  TEXT = "text",
  FILE = "file",
  SYSTEM = "system",
  THREAD_CREATED = "thread_created",
  MEMBER_JOINED = "member_joined",
  MEMBER_LEFT = "member_left",
}
```

### ThreadStatus

```typescript
export enum ThreadStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  RESOLVED = "resolved",
  DELETED = "deleted",
}
```

### ThreadType

```typescript
export enum ThreadType {
  DISCUSSION = "discussion",
  FILE_SHARING = "file_sharing",
  ANNOUNCEMENT = "announcement",
  QUESTION = "question",
}
```

### UploadStatus

```typescript
export enum UploadStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}
```

### ChatroomRole

```typescript
export enum ChatroomRole {
  CREATOR = "creator",
  ADMIN = "admin",
  MODERATOR = "moderator",
  MEMBER = "member",
}
```

### ThreadRole

```typescript
export enum ThreadRole {
  CREATOR = "creator",
  MODERATOR = "moderator",
  PARTICIPANT = "participant",
  OBSERVER = "observer",
}
```

## Indexes and Performance

### Message Indexes

```typescript
@Entity("messages")
@Index(["chatroomId", "createdAt"]) // For chatroom message queries
@Index(["threadId", "createdAt"]) // For thread message queries
@Index(["senderId", "createdAt"]) // For user message history
export class Message {
  // ... entity definition
}
```

### File Upload Session Indexes

```typescript
@Entity("file_upload_sessions")
@Index(["uploadedById", "status"]) // For user upload sessions
@Index(["chatroomId", "status"]) // For chatroom uploads
@Index(["threadId", "status"]) // For thread uploads
@Index(["expiresAt"]) // For cleanup queries
export class FileUploadSession {
  // ... entity definition
}
```

## Validation Rules

### Chatroom Validation

- Name: Required, 3-100 characters
- Description: Optional, max 500 characters
- Company membership required for creation
- Type must be valid enum value

### Message Validation

- Content: Required for text messages, max 4000 characters
- Sender must be member of chatroom
- Thread messages must reference valid thread
- File attachments must reference valid files

### Thread Validation

- Title: Required, 3-200 characters
- Description: Optional, max 1000 characters
- Creator must be member of chatroom
- Type must be valid enum value

### File Upload Session Validation

- Original filename: Required, max 255 characters
- Total size: Must be > 0 and < max allowed
- Chunk size: Must be consistent across chunks
- Expiration: Must be set for security

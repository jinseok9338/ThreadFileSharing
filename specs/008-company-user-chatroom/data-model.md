# Data Model: Company User Chatroom Structure

**Feature**: 008-company-user-chatroom  
**Date**: 2024-12-19  
**Focus**: Entity relationships and permission modeling

## Entity Overview

### Core Entities

1. **Company** - Organization with users and storage limits
2. **User** - Individual with company membership and roles
3. **ChatRoom** - Communication space within company
4. **Thread** - File-centric conversation space
5. **File** - Shared documents with metadata and permissions
6. **Message** - Chat messages in chatrooms
7. **ThreadMessage** - Messages within threads
8. **ThreadParticipant** - Junction entity for thread access control

### Supporting Entities

9. **CompanyInvitation** - User invitation management
10. **RefreshToken** - Authentication token management

## Entity Definitions

### Company

**Purpose**: Represents an organization with users, storage limits, and settings

**Attributes**:

- `id` (UUID, Primary Key)
- `name` (String, Required) - Company display name
- `slug` (String, Unique) - URL-friendly identifier
- `storage_limit_gb` (Integer, Default: 50) - Storage quota in GB
- `storage_used_bytes` (BigInt, Default: 0) - Current storage usage
- `settings` (JSON) - Company-specific configuration
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Soft Delete)

**Relationships**:

- One-to-Many: `Company` → `User` (users)
- One-to-Many: `Company` → `ChatRoom` (chatrooms)
- One-to-Many: `Company` → `CompanyInvitation` (invitations)

**Business Rules**:

- Storage usage cannot exceed storage_limit_gb
- Company slug must be unique across all companies
- Soft delete preserves data integrity

### User

**Purpose**: Individual person with company membership and authentication

**Attributes**:

- `id` (UUID, Primary Key)
- `company_id` (UUID, Foreign Key → Company)
- `email` (String, Unique) - Authentication email
- `username` (String, Optional) - Display username
- `full_name` (String, Optional) - Full display name
- `avatar_url` (String, Optional) - Profile image URL
- `password_hash` (String, Optional) - Hashed password
- `google_id` (String, Unique, Optional) - Google OAuth ID
- `azure_id` (String, Unique, Optional) - Azure OAuth ID
- `company_role` (Enum: OWNER, ADMIN, MEMBER, Default: MEMBER)
- `email_verified` (Boolean, Default: false)
- `is_active` (Boolean, Default: true)
- `failed_login_attempts` (Integer, Default: 0)
- `locked_until` (Timestamp, Optional)
- `last_login_at` (Timestamp, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Soft Delete)

**Relationships**:

- Many-to-One: `User` → `Company` (company)
- One-to-Many: `User` → `RefreshToken` (refresh_tokens)
- One-to-Many: `User` → `CompanyInvitation` (created_invitations)
- Many-to-Many: `User` → `ChatRoom` (via membership)
- One-to-Many: `User` → `ThreadParticipant` (thread_participations)
- One-to-Many: `User` → `Message` (messages)
- One-to-Many: `User` → `ThreadMessage` (thread_messages)

**Business Rules**:

- Company role hierarchy: OWNER > ADMIN > MEMBER
- Email must be unique across all users
- Failed login attempts trigger account lockout
- OAuth providers are mutually exclusive

### ChatRoom

**Purpose**: Communication space within a company for group discussions

**Attributes**:

- `id` (UUID, Primary Key)
- `company_id` (UUID, Foreign Key → Company)
- `name` (String, Required) - Chatroom display name
- `description` (String, Optional) - Chatroom description
- `avatar_url` (String, Optional) - Chatroom image
- `is_private` (Boolean, Default: false) - Private vs public
- `created_by` (UUID, Foreign Key → User) - Creator user
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Soft Delete)

**Relationships**:

- Many-to-One: `ChatRoom` → `Company` (company)
- Many-to-One: `ChatRoom` → `User` (creator)
- One-to-Many: `ChatRoom` → `Thread` (threads)
- One-to-Many: `ChatRoom` → `Message` (messages)
- Many-to-Many: `ChatRoom` → `User` (members via ChatRoomMember)

**Business Rules**:

- Only company members can create chatrooms
- Private chatrooms require explicit invitation
- Chatroom creator has admin privileges

### Thread

**Purpose**: File-centric conversation space within a chatroom

**Attributes**:

- `id` (UUID, Primary Key)
- `chatroom_id` (UUID, Foreign Key → ChatRoom)
- `title` (String, Required) - Thread title
- `description` (String, Optional) - Thread description
- `created_by` (UUID, Foreign Key → User) - Thread creator
- `is_archived` (Boolean, Default: false)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Soft Delete)

**Relationships**:

- Many-to-One: `Thread` → `ChatRoom` (chatroom)
- Many-to-One: `Thread` → `User` (creator)
- One-to-Many: `Thread` → `File` (files)
- One-to-Many: `Thread` → `ThreadMessage` (messages)
- Many-to-Many: `Thread` → `User` (participants via ThreadParticipant)

**Business Rules**:

- Threads are automatically created on file upload
- Thread creator becomes thread owner
- Thread title defaults to file name if not specified

### File

**Purpose**: Shared documents with metadata, storage, and access control

**Attributes**:

- `id` (UUID, Primary Key)
- `thread_id` (UUID, Foreign Key → Thread, Optional)
- `chatroom_id` (UUID, Foreign Key → ChatRoom, Optional)
- `uploaded_by` (UUID, Foreign Key → User)
- `original_name` (String, Required) - Original filename
- `storage_key` (String, Required) - MinIO/S3 storage key
- `mime_type` (String, Required) - File MIME type
- `size_bytes` (BigInt, Required) - File size
- `hash` (String, Required) - File content hash
- `metadata` (JSON, Optional) - Additional file metadata
- `is_processed` (Boolean, Default: false) - Processing status
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Soft Delete)

**Relationships**:

- Many-to-One: `File` → `Thread` (thread)
- Many-to-One: `File` → `ChatRoom` (chatroom)
- Many-to-One: `File` → `User` (uploader)

**Business Rules**:

- File must belong to either thread or chatroom (not both)
- File size contributes to company storage quota
- File hash enables deduplication
- Storage key is immutable

### Message

**Purpose**: Individual communication in chatrooms

**Attributes**:

- `id` (UUID, Primary Key)
- `chatroom_id` (UUID, Foreign Key → ChatRoom)
- `sender_id` (UUID, Foreign Key → User)
- `content` (Text, Required) - Message content
- `message_type` (Enum: TEXT, SYSTEM, Default: TEXT)
- `is_edited` (Boolean, Default: false)
- `edited_at` (Timestamp, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Soft Delete)

**Relationships**:

- Many-to-One: `Message` → `ChatRoom` (chatroom)
- Many-to-One: `Message` → `User` (sender)

**Business Rules**:

- Only chatroom members can send messages
- Edited messages show edit timestamp
- System messages cannot be edited

### ThreadMessage

**Purpose**: Messages within specific threads

**Attributes**:

- `id` (UUID, Primary Key)
- `thread_id` (UUID, Foreign Key → Thread)
- `sender_id` (UUID, Foreign Key → User)
- `content` (Text, Required) - Message content
- `message_type` (Enum: TEXT, SYSTEM, Default: TEXT)
- `is_edited` (Boolean, Default: false)
- `edited_at` (Timestamp, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Soft Delete)

**Relationships**:

- Many-to-One: `ThreadMessage` → `Thread` (thread)
- Many-to-One: `ThreadMessage` → `User` (sender)

**Business Rules**:

- Only thread participants can send thread messages
- Thread messages are separate from chatroom messages
- Same editing rules as regular messages

### ThreadParticipant

**Purpose**: Junction entity for thread access control with roles and sharing

**Attributes**:

- `id` (UUID, Primary Key)
- `thread_id` (UUID, Foreign Key → Thread)
- `user_id` (UUID, Foreign Key → User)
- `thread_role` (Enum: OWNER, MEMBER, VIEWER, Default: MEMBER)
- `access_type` (Enum: MEMBER, SHARED, Default: MEMBER)
- `shared_by_user_id` (UUID, Foreign Key → User, Optional)
- `shared_at` (Timestamp, Optional)
- `joined_at` (Timestamp, Default: now)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**:

- Many-to-One: `ThreadParticipant` → `Thread` (thread)
- Many-to-One: `ThreadParticipant` → `User` (user)
- Many-to-One: `ThreadParticipant` → `User` (shared_by_user)

**Business Rules**:

- Unique constraint on (thread_id, user_id)
- Thread creator automatically becomes OWNER with MEMBER access_type
- Role hierarchy: OWNER > MEMBER > VIEWER
- SHARED access_type users can only access the specific thread, not the parent chatroom
- shared_by_user_id and shared_at are required when access_type is SHARED

## Permission Matrix

### Company-Level Permissions

| Role   | Create ChatRoom | Manage Users | Company Settings | Storage Management |
| ------ | --------------- | ------------ | ---------------- | ------------------ |
| OWNER  | ✅              | ✅           | ✅               | ✅                 |
| ADMIN  | ✅              | ✅           | ❌               | ❌                 |
| MEMBER | ✅              | ❌           | ❌               | ❌                 |

### Thread-Level Permissions

| Role   | Create Thread | Add Participants | Remove Participants | Delete Thread | Send Messages | View Files |
| ------ | ------------- | ---------------- | ------------------- | ------------- | ------------- | ---------- |
| OWNER  | ✅            | ✅               | ✅                  | ✅            | ✅            | ✅         |
| MEMBER | ✅            | ✅               | ❌                  | ❌            | ✅            | ✅         |
| VIEWER | ❌            | ❌               | ❌                  | ❌            | ❌            | ✅         |

### File Access Permissions

| Context         | Upload | Download | Delete | View Metadata |
| --------------- | ------ | -------- | ------ | ------------- |
| Thread Owner    | ✅     | ✅       | ✅     | ✅            |
| Thread Member   | ✅     | ✅       | ❌     | ✅            |
| Thread Viewer   | ❌     | ✅       | ❌     | ✅            |
| ChatRoom Member | ✅     | ✅       | ❌     | ✅            |

## Database Constraints

### Unique Constraints

- `users.email` - Unique across all users
- `users.google_id` - Unique across all users (when not null)
- `users.azure_id` - Unique across all users (when not null)
- `companies.slug` - Unique across all companies
- `thread_participants(thread_id, user_id)` - Unique participant per thread

### Check Constraints

- `users.company_role` IN ('OWNER', 'ADMIN', 'MEMBER')
- `thread_participants.thread_role` IN ('OWNER', 'MEMBER', 'VIEWER')
- `files.size_bytes` > 0
- `companies.storage_limit_gb` > 0
- `companies.storage_used_bytes` >= 0

### Foreign Key Constraints

- All foreign keys have proper CASCADE/SET NULL behavior
- Soft delete preserves referential integrity
- Orphaned records are prevented by database constraints

## Indexes

### Performance Indexes

- `users(company_id, company_role)` - Role-based queries
- `users(email)` - Authentication lookups
- `thread_participants(user_id, thread_role)` - Permission checks
- `files(thread_id)` - Thread file listings
- `messages(chatroom_id, created_at)` - Message history
- `thread_messages(thread_id, created_at)` - Thread message history

### Unique Indexes

- `users(email)` - Authentication uniqueness
- `companies(slug)` - Company slug uniqueness
- `thread_participants(thread_id, user_id)` - Participant uniqueness

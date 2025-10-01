# Chat System Business Logic

**Feature**: Chat Room Layout  
**Date**: 2025-10-01  
**Scope**: Business rules and domain logic for chat system

## Core Business Rules

### Chat Room Management

**Rule 1: Chat Room Creation**

- Users can create chat rooms with appropriate permissions
- Chat room names must be unique within the user's scope
- Chat room creators automatically become administrators
- New chat rooms start with the creator as the only participant

**Rule 2: Chat Room Access Control**

- Users can only access chat rooms they are participants of
- Administrators can add/remove participants
- Members can invite other users (if allowed by room settings)
- Read-only users can view but not send messages

**Rule 3: Chat Room Archival**

- Administrators can archive chat rooms
- Archived rooms are hidden from active lists
- Archived rooms retain all message history
- Archived rooms can be restored by administrators

### Message Management

**Rule 4: Message Content Validation**

- Text messages must be 1-4000 characters
- File messages can have empty content
- System messages are generated automatically
- Messages cannot be empty or contain only whitespace

**Rule 5: Message Editing and Deletion**

- Users can edit their own messages within 24 hours
- Edited messages must maintain the same content length limits
- Deleted messages are soft-deleted (marked as deleted)
- System administrators can delete any message

**Rule 6: Message Threading**

- Messages can be replies to other messages
- Reply chains maintain proper threading
- Thread depth is limited to prevent excessive nesting
- Thread context is preserved when messages are edited

### File Upload and Thread Creation

**Rule 7: File Upload Limits**

- Maximum file size: 100MB per file
- Allowed file types: Documents, images, videos, archives
- Prohibited file types: Executables, scripts, potentially malicious files
- File names must be sanitized for security

**Rule 8: Automatic Thread Creation**

- File uploads automatically create new threads
- Thread title defaults to the uploaded filename
- Thread creator is the file uploader
- Thread is immediately accessible to all chat room participants

**Rule 9: File Access Control**

- Files inherit permissions from their chat room
- File download links expire after 24 hours
- File access is logged for audit purposes
- Deleted files are permanently removed after 30 days

### User Presence and Activity

**Rule 10: User Status Management**

- User status is automatically updated based on activity
- Status changes are broadcast to relevant chat rooms
- "Away" status is set after 15 minutes of inactivity
- "Offline" status is set when user disconnects

**Rule 11: Typing Indicators**

- Typing indicators show when users are actively typing
- Typing indicators disappear after 3 seconds of inactivity
- Multiple users typing are displayed in order of activity
- Typing indicators are only shown to other participants

**Rule 12: Read Receipts**

- Last read timestamp is updated when user views messages
- Unread message counts are calculated per chat room
- Read receipts are visible to message senders
- Read status is preserved across sessions

## Domain Constraints

### Performance Constraints

**Message History Limits**

- Chat rooms retain last 10,000 messages by default
- Older messages are archived but remain accessible
- Message search is limited to last 30 days for performance
- File attachments are limited to 1GB total per chat room

**Concurrent User Limits**

- Maximum 100 concurrent users per chat room
- Maximum 10,000 total users across all chat rooms
- Rate limiting: 10 messages per minute per user
- File upload rate limiting: 5 uploads per minute per user

### Security Constraints

**Content Moderation**

- All message content is scanned for inappropriate material
- File uploads are scanned for malware
- Suspicious activity triggers automated moderation
- Human moderation is available for escalated cases

**Data Privacy**

- Messages are encrypted in transit and at rest
- User data is retained according to privacy policy
- Users can request data deletion
- Audit logs are maintained for compliance

### Business Logic Constraints

**Thread Management**

- Maximum 100 threads per chat room
- Thread titles must be unique within a chat room
- Threads are automatically archived after 90 days of inactivity
- Thread participants inherit chat room permissions

**Notification Management**

- Users can customize notification preferences per chat room
- Notifications are sent for mentions, direct messages, and thread updates
- Notification frequency is limited to prevent spam
- Users can temporarily mute notifications

## State Transitions

### Chat Room States

```
active → archived → deleted
active → muted → active
```

### Message States

```
draft → sending → sent → [edited] → [deleted]
draft → sending → failed → retry → sent
```

### User Participation States

```
invited → joined → active → [muted] → [left] → archived
```

### File Upload States

```
pending → uploading → completed
pending → uploading → failed → retry → completed
pending → cancelled
```

## Business Events

### Chat Room Events

- `ChatRoomCreated`: When a new chat room is created
- `ChatRoomArchived`: When a chat room is archived
- `ChatRoomRestored`: When an archived chat room is restored
- `ParticipantAdded`: When a user joins a chat room
- `ParticipantRemoved`: When a user leaves a chat room

### Message Events

- `MessageSent`: When a message is successfully sent
- `MessageEdited`: When a message is edited
- `MessageDeleted`: When a message is deleted
- `MessageRead`: When a message is marked as read

### File Events

- `FileUploaded`: When a file is successfully uploaded
- `FileDownloaded`: When a file is downloaded
- `FileDeleted`: When a file is deleted
- `ThreadCreated`: When a thread is created from file upload

### User Events

- `UserJoined`: When a user joins the system
- `UserLeft`: When a user leaves the system
- `UserTyping`: When a user starts typing
- `UserStoppedTyping`: When a user stops typing
- `UserStatusChanged`: When a user's status changes

## Integration Points

### Authentication System

- User authentication is handled by the main auth system
- Chat system receives user context from JWT tokens
- User permissions are validated against auth system
- Session management is coordinated with auth system

### File Storage System

- Files are stored in the main file storage system
- File URLs are generated by the storage service
- File metadata is stored in the chat database
- File cleanup is coordinated with storage system

### Notification System

- Real-time notifications use WebSocket connections
- Email notifications are sent via the notification service
- Push notifications are handled by the mobile app service
- Notification preferences are managed by the user service

## Compliance and Audit

### Data Retention

- Message history is retained for 7 years for business purposes
- User data is retained according to privacy policy
- Audit logs are retained for 3 years
- Deleted data is purged according to retention schedule

### Audit Requirements

- All user actions are logged with timestamps
- File access is logged with user and IP information
- Administrative actions are logged with justification
- Audit logs are tamper-proof and regularly backed up

### Privacy Compliance

- User consent is required for data processing
- Data portability is supported through export features
- Right to be forgotten is implemented through deletion
- Data processing is documented and auditable

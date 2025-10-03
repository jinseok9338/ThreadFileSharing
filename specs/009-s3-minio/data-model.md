# Data Model: S3/MinIO File Upload System

**Feature**: 009-s3-minio  
**Date**: 2024-12-19  
**Status**: Design Complete

## Core Entities

### File Entity

**Purpose**: Central entity for all uploaded files with metadata and storage references
**Fields**:

- `id`: Primary key, UUID
- `companyId`: Foreign key to Company entity
- `threadId`: Optional foreign key to Thread entity
- `chatroomId`: Optional foreign key to ChatRoom entity
- `uploadedBy`: Foreign key to User entity (uploader)
- `originalName`: Original filename from client
- `displayName`: User-friendly display name
- `mimeType`: MIME type of the file
- `sizeBytes`: File size in bytes
- `hash`: SHA-256 hash for deduplication
- `storageKey`: S3/MinIO object key
- `storageBucket`: S3/MinIO bucket name
- `downloadUrl`: Signed URL for secure download (temporary)
- `metadata`: JSON field for additional file metadata
- `isProcessed`: Boolean flag for file processing status
- `processingStatus`: Enum (PENDING, PROCESSING, COMPLETED, FAILED)
- `createdAt`: Upload timestamp
- `updatedAt`: Last modification timestamp
- `deletedAt`: Soft delete timestamp

**Relationships**:

- `@ManyToOne` → Company (companyId)
- `@ManyToOne` → Thread (threadId, optional)
- `@ManyToOne` → ChatRoom (chatroomId, optional)
- `@ManyToOne` → User (uploadedBy)

**Validation Rules**:

- File size must not exceed company storage quota
- MIME type must be in allowed list
- Storage key must be unique within bucket
- Hash must be valid SHA-256 format

### UploadProgress Entity

**Purpose**: Real-time tracking of file upload progress for WebSocket broadcasting
**Fields**:

- `id`: Primary key, UUID
- `uploadSessionId`: UUID linking to upload session
- `fileId`: Foreign key to File entity
- `userId`: Foreign key to User entity (uploader)
- `status`: Enum (PENDING, UPLOADING, COMPLETED, FAILED, CANCELLED)
- `progressPercentage`: Integer 0-100
- `bytesUploaded`: Number of bytes uploaded
- `totalBytes`: Total file size in bytes
- `uploadSpeed`: Bytes per second (calculated)
- `estimatedTimeRemaining`: Seconds remaining (calculated)
- `currentChunk`: Current chunk being uploaded
- `totalChunks`: Total number of chunks
- `errorMessage`: Error message if upload failed
- `startedAt`: Upload start timestamp
- `completedAt`: Upload completion timestamp
- `lastUpdatedAt`: Last progress update timestamp

**Relationships**:

- `@ManyToOne` → File (fileId)
- `@ManyToOne` → User (userId)

**Validation Rules**:

- Progress percentage must be between 0-100
- Bytes uploaded cannot exceed total bytes
- Status transitions must be valid

### UploadSession Entity

**Purpose**: Track multi-file upload sessions with overall progress
**Fields**:

- `id`: Primary key, UUID
- `userId`: Foreign key to User entity
- `companyId`: Foreign key to Company entity
- `sessionName`: Optional session name
- `totalFiles`: Number of files in session
- `completedFiles`: Number of completed files
- `failedFiles`: Number of failed files
- `totalSize`: Total size of all files
- `uploadedSize`: Total uploaded size
- `status`: Enum (ACTIVE, COMPLETED, FAILED, CANCELLED)
- `createdAt`: Session start timestamp
- `updatedAt`: Last session update timestamp
- `completedAt`: Session completion timestamp

**Relationships**:

- `@ManyToOne` → User (userId)
- `@ManyToOne` → Company (companyId)
- `@OneToMany` → UploadProgress (uploadSessionId)

**Validation Rules**:

- Completed files cannot exceed total files
- Uploaded size cannot exceed total size
- Session must belong to valid company

### FileAssociation Entity

**Purpose**: Link files to chatrooms and threads with access permissions
**Fields**:

- `id`: Primary key, UUID
- `fileId`: Foreign key to File entity
- `chatroomId`: Optional foreign key to ChatRoom entity
- `threadId`: Optional foreign key to Thread entity
- `sharedBy`: Foreign key to User entity (who shared the file)
- `accessType`: Enum (PUBLIC, PRIVATE, RESTRICTED)
- `permissions`: JSON field for granular permissions
- `expiresAt`: Optional expiration timestamp
- `isPinned`: Boolean flag for pinned files
- `createdAt`: Association creation timestamp
- `updatedAt`: Last modification timestamp

**Relationships**:

- `@ManyToOne` → File (fileId)
- `@ManyToOne` → ChatRoom (chatroomId, optional)
- `@ManyToOne` → Thread (threadId, optional)
- `@ManyToOne` → User (sharedBy)

**Validation Rules**:

- File must be associated with either chatroom or thread
- Access type must be valid enum value
- Expiration must be in future if set

### StorageQuota Entity

**Purpose**: Track company storage usage and enforce limits
**Fields**:

- `id`: Primary key, UUID
- `companyId`: Foreign key to Company entity (unique)
- `storageLimitBytes`: Maximum storage in bytes
- `storageUsedBytes`: Current usage in bytes
- `fileCount`: Number of files
- `lastCalculatedAt`: Last quota calculation timestamp
- `createdAt`: Quota creation timestamp
- `updatedAt`: Last quota update timestamp

**Relationships**:

- `@OneToOne` → Company (companyId)

**Validation Rules**:

- Storage used cannot exceed limit
- File count must be non-negative
- Quota must be calculated regularly

### DownloadToken Entity

**Purpose**: Secure, time-limited access tokens for file downloads
**Fields**:

- `id`: Primary key, UUID
- `fileId`: Foreign key to File entity
- `userId`: Foreign key to User entity
- `token`: Secure random token
- `expiresAt`: Token expiration timestamp
- `downloadCount`: Number of times downloaded
- `maxDownloads`: Maximum allowed downloads
- `ipAddress`: IP address of downloader
- `userAgent`: User agent string
- `createdAt`: Token creation timestamp
- `lastUsedAt`: Last download timestamp

**Relationships**:

- `@ManyToOne` → File (fileId)
- `@ManyToOne` → User (userId)

**Validation Rules**:

- Token must be unique
- Expiration must be in future
- Download count cannot exceed max downloads

## Database Schema Design

### Initial Schema (File Upload Phase)

```sql
-- File metadata table
CREATE TABLE "file" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL REFERENCES "company"("id"),
    "thread_id" UUID REFERENCES "thread"("id"),
    "chatroom_id" UUID REFERENCES "chatroom"("id"),
    "uploaded_by" UUID NOT NULL REFERENCES "user"("id"),
    "original_name" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255),
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "hash" VARCHAR(64) NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "storage_bucket" VARCHAR(100) NOT NULL,
    "download_url" TEXT,
    "metadata" JSONB,
    "is_processed" BOOLEAN DEFAULT false,
    "processing_status" VARCHAR(20) DEFAULT 'PENDING',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP
);

-- Upload progress tracking table
CREATE TABLE "upload_progress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "upload_session_id" UUID NOT NULL,
    "file_id" UUID REFERENCES "file"("id"),
    "user_id" UUID NOT NULL REFERENCES "user"("id"),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "progress_percentage" INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    "bytes_uploaded" BIGINT DEFAULT 0,
    "total_bytes" BIGINT NOT NULL,
    "upload_speed" BIGINT DEFAULT 0,
    "estimated_time_remaining" INTEGER DEFAULT 0,
    "current_chunk" INTEGER DEFAULT 0,
    "total_chunks" INTEGER DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "last_updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Upload session tracking table
CREATE TABLE "upload_session" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "user"("id"),
    "company_id" UUID NOT NULL REFERENCES "company"("id"),
    "session_name" VARCHAR(255),
    "total_files" INTEGER DEFAULT 0,
    "completed_files" INTEGER DEFAULT 0,
    "failed_files" INTEGER DEFAULT 0,
    "total_size" BIGINT DEFAULT 0,
    "uploaded_size" BIGINT DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP
);

-- File associations table
CREATE TABLE "file_association" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "file_id" UUID NOT NULL REFERENCES "file"("id"),
    "chatroom_id" UUID REFERENCES "chatroom"("id"),
    "thread_id" UUID REFERENCES "thread"("id"),
    "shared_by" UUID NOT NULL REFERENCES "user"("id"),
    "access_type" VARCHAR(20) NOT NULL DEFAULT 'PRIVATE',
    "permissions" JSONB,
    "expires_at" TIMESTAMP,
    "is_pinned" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Storage quota tracking table
CREATE TABLE "storage_quota" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL UNIQUE REFERENCES "company"("id"),
    "storage_limit_bytes" BIGINT NOT NULL,
    "storage_used_bytes" BIGINT DEFAULT 0,
    "file_count" INTEGER DEFAULT 0,
    "last_calculated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Download tokens table
CREATE TABLE "download_token" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "file_id" UUID NOT NULL REFERENCES "file"("id"),
    "user_id" UUID NOT NULL REFERENCES "user"("id"),
    "token" VARCHAR(255) NOT NULL UNIQUE,
    "expires_at" TIMESTAMP NOT NULL,
    "download_count" INTEGER DEFAULT 0,
    "max_downloads" INTEGER DEFAULT 1,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP
);
```

### Indexes for Performance

```sql
-- File table indexes
CREATE INDEX "idx_file_company_id" ON "file"("company_id");
CREATE INDEX "idx_file_thread_id" ON "file"("thread_id");
CREATE INDEX "idx_file_chatroom_id" ON "file"("chatroom_id");
CREATE INDEX "idx_file_uploaded_by" ON "file"("uploaded_by");
CREATE INDEX "idx_file_hash" ON "file"("hash");
CREATE INDEX "idx_file_storage_key" ON "file"("storage_key");
CREATE INDEX "idx_file_created_at" ON "file"("created_at");
CREATE INDEX "idx_file_deleted_at" ON "file"("deleted_at");

-- Upload progress indexes
CREATE INDEX "idx_upload_progress_session_id" ON "upload_progress"("upload_session_id");
CREATE INDEX "idx_upload_progress_file_id" ON "upload_progress"("file_id");
CREATE INDEX "idx_upload_progress_user_id" ON "upload_progress"("user_id");
CREATE INDEX "idx_upload_progress_status" ON "upload_progress"("status");

-- Upload session indexes
CREATE INDEX "idx_upload_session_user_id" ON "upload_session"("user_id");
CREATE INDEX "idx_upload_session_company_id" ON "upload_session"("company_id");
CREATE INDEX "idx_upload_session_status" ON "upload_session"("status");

-- File association indexes
CREATE INDEX "idx_file_association_file_id" ON "file_association"("file_id");
CREATE INDEX "idx_file_association_chatroom_id" ON "file_association"("chatroom_id");
CREATE INDEX "idx_file_association_thread_id" ON "file_association"("thread_id");

-- Download token indexes
CREATE INDEX "idx_download_token_file_id" ON "download_token"("file_id");
CREATE INDEX "idx_download_token_user_id" ON "download_token"("user_id");
CREATE INDEX "idx_download_token_token" ON "download_token"("token");
CREATE INDEX "idx_download_token_expires_at" ON "download_token"("expires_at");
```

## Data Validation Rules

### File Validation

- **Size Limits**: Individual files max 10GB, total session max 50GB
- **Type Validation**: MIME type must be in allowed list
- **Name Validation**: Filename must not contain path traversal characters
- **Hash Validation**: SHA-256 hash must be calculated correctly

### Upload Progress Validation

- **Progress Range**: Percentage must be 0-100
- **Bytes Consistency**: Uploaded bytes cannot exceed total bytes
- **Status Transitions**: Valid state machine transitions
- **Chunk Validation**: Current chunk must be <= total chunks

### Storage Quota Validation

- **Usage Limits**: Used storage cannot exceed limit
- **File Count**: File count must be accurate
- **Calculation Frequency**: Quota must be recalculated regularly
- **Company Limits**: Enforce per-company storage policies

## Performance Considerations

### Query Optimization

- **Indexed Queries**: All foreign key and search queries use indexes
- **Pagination**: Large result sets use cursor-based pagination
- **Selective Loading**: Only load necessary fields for list views
- **Caching**: Frequently accessed metadata cached in Redis

### Storage Efficiency

- **Deduplication**: Files with same hash share storage
- **Compression**: Automatic compression for suitable file types
- **Cleanup**: Regular cleanup of orphaned files and expired tokens
- **Archival**: Old files moved to cheaper storage tiers

### Scalability

- **Partitioning**: File table partitioned by company_id for large datasets
- **Read Replicas**: Read-only replicas for file metadata queries
- **CDN Integration**: Static file delivery via CDN
- **Async Processing**: File processing handled asynchronously

## Security Measures

### Access Control

- **Authentication**: All file operations require valid JWT
- **Authorization**: Company and thread-based access control
- **Signed URLs**: Temporary, secure download URLs
- **Token Expiration**: Download tokens expire after use or time limit

### Data Protection

- **Encryption**: Files encrypted at rest in S3/MinIO
- **Transit Security**: HTTPS for all file transfers
- **Audit Logging**: All file operations logged for security
- **Virus Scanning**: Integration with antivirus scanning services

---

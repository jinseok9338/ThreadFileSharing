# File Upload Business Rules

**Feature**: 009-s3-minio  
**Date**: 2024-12-19  
**Status**: Business Rules Definition

## Core Business Rules

### File Upload Rules

#### File Size and Type Validation

- **Maximum File Size**: 10GB per individual file
- **Maximum Session Size**: 50GB total for multi-file uploads
- **Allowed File Types**: Based on MIME type validation
  - Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
  - Videos: `video/mp4`, `video/webm`, `video/quicktime`
  - Archives: `application/zip`, `application/x-rar-compressed`, `application/x-7z-compressed`
  - Text: `text/plain`, `text/csv`, `application/json`
- **Prohibited File Types**: Executable files, scripts, potentially malicious content
- **Filename Validation**: No path traversal characters, maximum 255 characters

#### Upload Session Management

- **Session Duration**: Upload sessions expire after 24 hours of inactivity
- **Maximum Files per Session**: 50 files per upload session
- **Concurrent Sessions**: Maximum 3 active upload sessions per user
- **Session Naming**: Optional session names, maximum 100 characters

#### Storage Quota Enforcement

- **Company Storage Limits**:
  - Free Tier: 50GB total storage
  - Pro Tier: 500GB total storage
  - Enterprise Tier: 5TB total storage
- **Quota Calculation**: Real-time calculation including all files in company
- **Quota Warnings**:
  - 80% usage: Warning notification
  - 95% usage: Critical warning
  - 100% usage: Uploads blocked
- **Quota Reset**: Monthly reset for paid tiers, no reset for free tier

### File Access and Permissions

#### File Association Rules

- **Chatroom Association**: Files can be associated with specific chatrooms
- **Thread Association**: Files can be associated with specific threads
- **Dual Association**: Files can be associated with both chatroom and thread
- **Access Control**: File access follows chatroom/thread permission model

#### Download and Sharing Rules

- **Download URLs**: Secure, time-limited URLs (default 1 hour expiration)
- **Download Limits**: Maximum 10 downloads per URL
- **IP Restrictions**: Download URLs tied to requesting user's IP
- **Access Logging**: All download attempts logged for security

#### File Deletion Rules

- **Soft Delete**: Files are soft-deleted (marked as deleted, not physically removed)
- **Retention Period**: Deleted files retained for 30 days before permanent removal
- **Deletion Permissions**:
  - File uploader: Can delete their own files
  - Chatroom/Thread admins: Can delete files in their spaces
  - Company admins: Can delete any file in their company
- **Cascade Deletion**: When chatroom/thread is deleted, associated files are marked for deletion

### Progress Tracking Rules

#### Upload Progress Updates

- **Update Frequency**: Progress updates every 1 second during active upload
- **Chunk Size**: 5MB chunks for multipart uploads
- **Progress Granularity**: 1% increments for progress percentage
- **Speed Calculation**: Rolling average of last 10 progress updates
- **ETA Calculation**: Based on current speed and remaining bytes

#### Session Progress Rules

- **Overall Progress**: Weighted average based on file sizes
- **Status Transitions**:
  - PENDING → UPLOADING → COMPLETED/FAILED
  - No backward transitions allowed
- **Completion Criteria**: All files in session must be COMPLETED or FAILED
- **Failure Handling**: Individual file failures don't stop other uploads

### Error Handling Rules

#### Upload Failure Scenarios

- **Network Interruption**: Automatic retry up to 3 times with exponential backoff
- **Storage Unavailable**: Queue uploads and retry when storage is available
- **Quota Exceeded**: Block new uploads, allow completion of in-progress uploads
- **File Corruption**: Validate file integrity, reject corrupted files
- **Authentication Failure**: Immediate upload termination

#### Retry Logic

- **Retry Attempts**: Maximum 3 retry attempts per failed upload
- **Retry Delay**: Exponential backoff: 1s, 2s, 4s
- **Retry Conditions**: Network errors, temporary storage issues
- **No Retry**: Authentication errors, quota exceeded, file type validation failures

### Security and Compliance Rules

#### File Security

- **Virus Scanning**: All uploaded files scanned for malware (future implementation)
- **Content Validation**: File content validated against declared MIME type
- **Encryption**: Files encrypted at rest in storage
- **Access Logging**: All file access operations logged with user, timestamp, IP

#### Data Privacy

- **File Retention**: Files retained according to company data retention policy
- **User Consent**: Users must consent to file storage and processing
- **Data Export**: Users can export their files on demand
- **Data Deletion**: Files permanently deleted when user account is deleted

### Performance and Scalability Rules

#### Upload Performance

- **Concurrent Uploads**: Maximum 5 concurrent uploads per user
- **Bandwidth Throttling**: No throttling for individual users
- **Connection Timeout**: 1 hour maximum for single file upload
- **Chunk Upload**: Parallel chunk uploads for large files

#### Storage Performance

- **File Deduplication**: Files with identical SHA-256 hashes share storage
- **Compression**: Automatic compression for suitable file types
- **CDN Integration**: Static file delivery via CDN (future implementation)
- **Backup Strategy**: Files backed up according to company backup policy

### Business Logic Validation

#### File Processing Rules

- **Processing Status**: PENDING → PROCESSING → COMPLETED/FAILED
- **Processing Tasks**: Thumbnail generation, metadata extraction, content analysis
- **Processing Timeout**: 30 minutes maximum for file processing
- **Processing Failures**: Non-blocking, files remain accessible

#### Notification Rules

- **Upload Completion**: Notify uploader and relevant chatroom/thread participants
- **Upload Failure**: Notify uploader with detailed error information
- **Quota Warnings**: Notify company admins and affected users
- **Processing Completion**: Notify uploader of processing results

### Audit and Compliance Rules

#### Audit Logging

- **Upload Events**: All file uploads logged with metadata
- **Download Events**: All file downloads logged with access details
- **Deletion Events**: All file deletions logged with reason and user
- **Permission Changes**: All permission modifications logged

#### Compliance Requirements

- **Data Residency**: Files stored in company's preferred region
- **GDPR Compliance**: Right to be forgotten, data portability
- **SOX Compliance**: Audit trails for financial documents
- **HIPAA Compliance**: Healthcare data protection (if applicable)

## Business Rule Validation

### Pre-Upload Validation

1. **User Authentication**: Valid JWT token required
2. **Company Membership**: User must be member of company
3. **Storage Quota**: Sufficient quota available for upload
4. **File Validation**: File type, size, and name validation
5. **Permission Check**: User has upload permission for target chatroom/thread

### During Upload Validation

1. **Progress Tracking**: Real-time progress updates
2. **Quota Monitoring**: Continuous quota checking
3. **Error Handling**: Immediate error detection and handling
4. **Security Scanning**: Background security validation

### Post-Upload Validation

1. **File Integrity**: SHA-256 hash verification
2. **Storage Confirmation**: File successfully stored in S3/MinIO
3. **Database Consistency**: File metadata correctly stored
4. **Permission Assignment**: Proper access permissions set
5. **Notification Delivery**: Completion notifications sent

## Exception Handling

### Business Rule Exceptions

- **Emergency Override**: Company admins can override quota limits for critical files
- **Grace Period**: 24-hour grace period for quota exceeded scenarios
- **Bulk Upload Exception**: Special handling for bulk file migrations
- **Compliance Exception**: Extended retention for compliance-required files

### Error Recovery

- **Partial Upload Recovery**: Resume interrupted uploads from last successful chunk
- **Metadata Recovery**: Rebuild file metadata from storage if database is corrupted
- **Permission Recovery**: Restore default permissions if access control fails
- **Notification Recovery**: Retry failed notifications with exponential backoff

---

# Quickstart: Company User Chatroom Data Structure

**Feature**: 008-company-user-chatroom  
**Date**: 2024-12-19  
**Purpose**: Validate complete user workflows and permission system

## Prerequisites

- User authenticated with JWT token
- User belongs to a company with appropriate role
- Chatroom exists in user's company
- File storage service (MinIO/S3) accessible

## User Workflows

### 1. Company Administrator Creates Chatroom

**Scenario**: Company admin creates a new chatroom for team collaboration

**Steps**:

1. **POST** `/api/v1/chatrooms` with admin token
   ```json
   {
     "name": "Project Alpha Team",
     "description": "Collaboration space for Project Alpha",
     "isPrivate": false
   }
   ```
2. **Verify**: 201 response with chatroom details
3. **Verify**: Chatroom appears in company chatroom list
4. **Verify**: Admin automatically becomes chatroom member

**Expected Result**: Chatroom created successfully with proper permissions

### 2. File Upload Triggers Thread Creation

**Scenario**: User uploads file and chooses to create new thread

**Steps**:

1. **POST** `/api/v1/files/upload` with file and thread creation action
   ```json
   {
     "chatroomId": "chatroom-uuid",
     "action": "CREATE_THREAD"
   }
   ```
2. **Verify**: 201 response with file details and new thread ID
3. **Verify**: New thread created with file attached
4. **Verify**: Uploader becomes thread owner
5. **Verify**: Thread appears in chatroom thread list

**Expected Result**: File uploaded and thread created with proper access control

### 3. Thread Participant Management

**Scenario**: Thread owner adds members with different roles

**Steps**:

1. **POST** `/api/v1/threads/:id/participants` to add member
   ```json
   {
     "userId": "user-uuid",
     "threadRole": "MEMBER"
   }
   ```
2. **Verify**: 201 response confirming participant added
3. **POST** `/api/v1/threads/:id/participants` to add viewer
   ```json
   {
     "userId": "viewer-uuid",
     "threadRole": "VIEWER"
   }
   ```
4. **Verify**: 201 response confirming viewer added
5. **GET** `/api/v1/threads/:id/participants` to verify roles

**Expected Result**: Participants added with correct roles and permissions

### 4. Permission-Based File Access

**Scenario**: Different users access files based on their thread roles

**Steps**:

1. **Thread Owner** attempts file download

   - **GET** `/api/v1/files/:id/download`
   - **Verify**: 200 response with signed download URL

2. **Thread Member** attempts file download

   - **GET** `/api/v1/files/:id/download`
   - **Verify**: 200 response with signed download URL

3. **Thread Viewer** attempts file download

   - **GET** `/api/v1/files/:id/download`
   - **Verify**: 200 response with signed download URL

4. **Non-Participant** attempts file download
   - **GET** `/api/v1/files/:id/download`
   - **Verify**: 403 response with access denied

**Expected Result**: File access properly controlled by thread participation

### 5. Storage Quota Management

**Scenario**: Company approaches storage limit

**Steps**:

1. **GET** `/api/v1/files/storage/quota` to check current usage
2. **Verify**: Response shows usage approaching limit
3. **Attempt** large file upload
4. **Verify**: 507 response when quota exceeded
5. **Admin** reviews storage usage and manages files

**Expected Result**: Storage limits enforced with proper error handling

### 6. Thread Sharing and Access

**Scenario**: Thread owner shares thread with non-chatroom member

**Steps**:

1. **POST** `/api/v1/threads/:id/share` to share thread
   ```json
   {
     "userId": "external-user-uuid",
     "threadRole": "VIEWER",
     "message": "프로젝트 문서 검토 부탁드립니다"
   }
   ```
2. **Verify**: 201 response confirming thread shared
3. **External user** accesses shared thread
4. **GET** `/api/v1/threads/shared` to list shared threads
5. **Verify**: Shared thread appears in external user's thread list
6. **GET** `/api/v1/threads/:id` to access shared thread
7. **Verify**: 200 response with thread details and SHARED access_type

**Expected Result**: Thread sharing works with proper access control

### 7. Real-time Permission Updates

**Scenario**: User role changes trigger real-time updates

**Steps**:

1. **WebSocket** connection established for user
2. **Admin** removes user from chatroom
3. **Verify**: User receives real-time notification
4. **Verify**: User's UI updates to reflect lost access
5. **Verify**: User cannot access chatroom resources

**Expected Result**: Real-time permission updates work correctly

## Permission Matrix Validation

### Company-Level Permissions

| User Role | Create ChatRoom | Manage Users | Delete ChatRoom |
| --------- | --------------- | ------------ | --------------- |
| OWNER     | ✅              | ✅           | ✅              |
| ADMIN     | ✅              | ✅           | ❌              |
| MEMBER    | ✅              | ❌           | ❌              |

### Thread-Level Permissions

| User Role | Create Thread | Add Participants | Delete Thread | Send Messages |
| --------- | ------------- | ---------------- | ------------- | ------------- |
| OWNER     | ✅            | ✅               | ✅            | ✅            |
| MEMBER    | ✅            | ✅               | ❌            | ✅            |
| VIEWER    | ❌            | ❌               | ❌            | ❌            |

### File Access Permissions

| User Role       | Upload File | Download File | Delete File |
| --------------- | ----------- | ------------- | ----------- |
| Thread Owner    | ✅          | ✅            | ✅          |
| Thread Member   | ✅          | ✅            | ❌          |
| Thread Viewer   | ❌          | ✅            | ❌          |
| Non-Participant | ❌          | ❌            | ❌          |

## Error Handling Validation

### Authentication Errors

- **401 Unauthorized**: Invalid or expired JWT token
- **403 Forbidden**: Valid token but insufficient permissions
- **404 Not Found**: Resource doesn't exist or user lacks access

### Business Logic Errors

- **400 Bad Request**: Invalid input data or business rule violation
- **409 Conflict**: Resource already exists (duplicate chatroom name)
- **413 Payload Too Large**: File exceeds size limits
- **507 Insufficient Storage**: Company storage quota exceeded

### System Errors

- **500 Internal Server Error**: Unexpected system failure
- **503 Service Unavailable**: File storage service unavailable

## Data Integrity Validation

### Entity Relationships

- **Company → User**: One-to-many with role assignment
- **User → ChatRoom**: Many-to-many through membership
- **ChatRoom → Thread**: One-to-many with automatic creation
- **Thread → File**: One-to-many with metadata tracking
- **User → Thread**: Many-to-many through ThreadParticipant with roles

### Constraint Validation

- **Unique Constraints**: Email, company slug, thread participants
- **Foreign Key Constraints**: Proper CASCADE/SET NULL behavior
- **Check Constraints**: Valid enum values, positive numbers
- **Soft Delete**: Preserves referential integrity

## Performance Validation

### Response Time Targets

- **API Endpoints**: <200ms for standard operations
- **File Upload**: <5s for files up to 100MB
- **File Download**: <1s for signed URL generation
- **Real-time Events**: <100ms latency

### Concurrent User Support

- **Unlimited Users**: No artificial limits per chatroom/thread
- **Scalable Storage**: MinIO/S3 handles concurrent file operations
- **Database Performance**: Proper indexing for role-based queries

## Security Validation

### Access Control

- **JWT Authentication**: All endpoints require valid tokens
- **Role-Based Authorization**: Proper permission enforcement
- **File Access Control**: Signed URLs with expiration
- **Audit Trail**: All permission changes logged

### Data Protection

- **File Encryption**: Storage-level encryption for sensitive files
- **Secure Uploads**: File type validation and virus scanning
- **Access Logging**: All file access attempts logged
- **Soft Delete**: Data recovery capability

## Success Criteria

- [ ] All user workflows complete successfully
- [ ] Permission matrix enforced correctly
- [ ] Error handling provides clear feedback
- [ ] Real-time updates work reliably
- [ ] Storage quotas enforced properly
- [ ] Data integrity maintained
- [ ] Performance targets met
- [ ] Security requirements satisfied

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check user role and thread participation
2. **Storage Quota Exceeded**: Review company storage usage
3. **File Upload Failed**: Verify file size and type restrictions
4. **Real-time Updates Missing**: Check WebSocket connection status

### Debug Information

- JWT token contains user ID and company role
- Thread participation status in ThreadParticipant table
- Storage usage tracked in Company entity
- File metadata includes uploader and access permissions

# Quickstart: 대용량 처리 및 코어 비지니스 로직 완성

## Overview

This quickstart guide demonstrates the backend API functionality for chatroom, messaging, thread, and large file upload services. The backend supports real-time WebSocket communication, organized discussions, and file sharing with chunked uploads for files larger than 4GB. This guide focuses on backend API testing only - frontend implementation is excluded from this specification.

## Prerequisites

- Backend server running on `http://localhost:3001`
- Valid JWT authentication token
- WebSocket client for testing (wscat, curl, or custom client)
- Test files of various sizes (including >4GB files)
- Bruno API client or curl for REST API testing

## Setup

### 1. Authentication

```bash
# Register a new user and company
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePassword123!",
    "fullName": "Test User",
    "companyName": "Test Company"
  }'

# Login to get JWT token
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. WebSocket Connection

```javascript
// Connect to WebSocket
const socket = io("http://localhost:3001", {
  auth: {
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("Connected to WebSocket");
});
```

## Core Functionality Tests

### 1. Chatroom Management

#### Create Chatroom

```bash
curl -X POST http://localhost:3001/api/v1/chatrooms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Discussion",
    "description": "Main discussion channel for project updates",
    "type": "public",
    "settings": {
      "allowFileUploads": true,
      "allowThreadCreation": true,
      "maxMembers": 50
    }
  }'
```

#### Get Chatrooms

```bash
curl -X GET http://localhost:3001/api/v1/chatrooms \
  -H "Authorization: Bearer $TOKEN"
```

#### Add Member to Chatroom

```bash
curl -X POST http://localhost:3001/api/v1/chatrooms/{chatroomId}/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "role": "member",
    "accessType": "full"
  }'
```

### 2. Real-Time Messaging

#### Send Message

```bash
curl -X POST http://localhost:3001/api/v1/chatrooms/{chatroomId}/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello everyone! How is the project going?",
    "type": "text"
  }'
```

#### Get Messages

```bash
curl -X GET "http://localhost:3001/api/v1/chatrooms/{chatroomId}/messages?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

#### WebSocket Message Events

```javascript
// Join chatroom
socket.emit("join_chatroom", { chatroomId: "chatroom-uuid" });

// Listen for new messages
socket.on("message_received", (data) => {
  console.log("New message:", data);
});

// Send message via WebSocket
socket.emit("send_message", {
  chatroomId: "chatroom-uuid",
  content: "Real-time message!",
  type: "text",
});
```

### 3. Thread Organization

#### Create Thread

```bash
curl -X POST http://localhost:3001/api/v1/chatrooms/{chatroomId}/threads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug Discussion",
    "description": "Discussing the recent bug reports",
    "type": "discussion",
    "settings": {
      "allowFileUploads": true,
      "isPrivate": false
    }
  }'
```

#### Get Threads

```bash
curl -X GET "http://localhost:3001/api/v1/chatrooms/{chatroomId}/threads?status=active" \
  -H "Authorization: Bearer $TOKEN"
```

#### Send Thread Message

```bash
curl -X POST http://localhost:3001/api/v1/threads/{threadId}/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I found the issue in the authentication module",
    "type": "text"
  }'
```

#### WebSocket Thread Events

```javascript
// Join thread
socket.emit("join_thread", { threadId: "thread-uuid" });

// Listen for thread messages
socket.on("thread_message_received", (data) => {
  console.log("Thread message:", data);
});
```

### 4. Large File Upload (>4GB)

#### Initiate Upload Session

```bash
curl -X POST http://localhost:3001/api/v1/files/upload/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "large-video.mp4",
    "fileSize": 5368709120,
    "chunkSize": 10485760,
    "mimeType": "video/mp4",
    "chatroomId": "chatroom-uuid",
    "threadId": "thread-uuid"
  }'
```

#### Upload File Chunks

```bash
# Upload chunk 0
curl -X POST http://localhost:3001/api/v1/files/upload/{sessionId}/chunk \
  -H "Authorization: Bearer $TOKEN" \
  -F "chunkIndex=0" \
  -F "chunkData=@chunk_0.bin"

# Upload chunk 1
curl -X POST http://localhost:3001/api/v1/files/upload/{sessionId}/chunk \
  -H "Authorization: Bearer $TOKEN" \
  -F "chunkIndex=1" \
  -F "chunkData=@chunk_1.bin"

# Continue for all chunks...
```

#### Complete Upload

```bash
curl -X POST http://localhost:3001/api/v1/files/upload/{sessionId}/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chunksChecksum": ["chunk0-hash", "chunk1-hash", "..."],
    "displayName": "Project Video",
    "metadata": {
      "description": "Main project presentation video"
    }
  }'
```

#### WebSocket Upload Progress

```javascript
// Listen for upload progress
socket.on("file_upload_progress", (data) => {
  console.log(`Upload progress: ${data.progress}%`);
  console.log(`Chunk ${data.chunkIndex} uploaded`);
});

// Listen for upload completion
socket.on("file_upload_completed", (data) => {
  console.log("File upload completed:", data);
});
```

### 5. File Management Integration

#### Get Files in Chatroom

```bash
curl -X GET "http://localhost:3001/api/v1/chatrooms/{chatroomId}/files" \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Files in Thread

```bash
curl -X GET "http://localhost:3001/api/v1/threads/{threadId}/files" \
  -H "Authorization: Bearer $TOKEN"
```

#### Download File

```bash
curl -X GET http://localhost:3001/api/v1/files/{fileId}/download \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded-file.mp4
```

## Advanced Features

### 1. Message Reactions

```bash
# Add reaction
curl -X POST http://localhost:3001/api/v1/messages/{messageId}/reactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emoji": "👍"}'
```

### 2. Typing Indicators

```javascript
// Send typing indicator
socket.emit("typing_start", { chatroomId: "chatroom-uuid" });

// Stop typing indicator
socket.emit("typing_stop", { chatroomId: "chatroom-uuid" });

// Listen for typing indicators
socket.on("user_typing", (data) => {
  console.log(`${data.user.fullName} is typing...`);
});
```

### 3. Presence Status

```javascript
// Listen for user presence changes
socket.on("user_online", (data) => {
  console.log(`${data.user.fullName} is online`);
});

socket.on("user_offline", (data) => {
  console.log(`${data.user.fullName} is offline`);
});
```

### 4. Resumable Uploads

```bash
# Get upload session status
curl -X GET http://localhost:3001/api/v1/files/upload/{sessionId} \
  -H "Authorization: Bearer $TOKEN"

# Resume upload session
curl -X POST http://localhost:3001/api/v1/files/upload/{sessionId}/resume \
  -H "Authorization: Bearer $TOKEN"
```

## Error Handling

### Common Error Scenarios

#### Invalid File Size

```bash
# Response: 400 Bad Request
{
  "message": "File size exceeds maximum allowed limit",
  "error": "FILE_SIZE_EXCEEDED",
  "statusCode": 400
}
```

#### Storage Quota Exceeded

```bash
# Response: 403 Forbidden
{
  "message": "Storage quota exceeded. Current usage: 45.2 GB, Limit: 50 GB",
  "error": "STORAGE_QUOTA_EXCEEDED",
  "statusCode": 403
}
```

#### Upload Session Expired

```bash
# Response: 404 Not Found
{
  "message": "Upload session not found or expired",
  "error": "UPLOAD_SESSION_NOT_FOUND",
  "statusCode": 404
}
```

## Performance Testing

### 1. Concurrent Uploads

```bash
# Test multiple concurrent uploads
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/v1/files/upload/initiate \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"fileName\": \"test$i.mp4\", \"fileSize\": 1073741824, \"chunkSize\": 10485760}" &
done
wait
```

### 2. Large File Upload (10GB)

```bash
# Create 10GB test file
dd if=/dev/zero of=test-10gb.bin bs=1M count=10240

# Initiate upload
SESSION_ID=$(curl -X POST http://localhost:3001/api/v1/files/upload/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test-10gb.bin", "fileSize": 10737418240, "chunkSize": 10485760}' \
  | jq -r '.data.id')

# Upload in chunks (this would be done programmatically)
# For demo purposes, showing the pattern
```

## Validation Checklist

- [ ] Chatroom creation and member management
- [ ] Real-time messaging with WebSocket
- [ ] Thread creation and organization
- [ ] Message reactions and editing
- [ ] File upload initiation and chunk upload
- [ ] Large file upload completion (>4GB)
- [ ] Upload progress tracking via WebSocket
- [ ] File download and access control
- [ ] Upload session resumption
- [ ] Error handling for all scenarios
- [ ] Performance under concurrent load
- [ ] Storage quota enforcement

## Next Steps

After completing this backend quickstart:

1. **Backend Integration Testing**: Run comprehensive backend integration tests
2. **Performance Optimization**: Monitor and optimize backend for production load
3. **Security Review**: Audit file upload security and access controls
4. **API Documentation**: Update OpenAPI documentation with real examples
5. **Monitoring**: Set up monitoring for backend upload success rates and performance
6. **Future Frontend Integration**: Prepare APIs for frontend consumption (next specification)

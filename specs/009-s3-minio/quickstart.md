# Quickstart: S3/MinIO File Upload System

**Feature**: 009-s3-minio  
**Date**: 2024-12-19  
**Status**: Ready for Implementation

## Overview

This quickstart guide demonstrates the S3/MinIO file upload system with real-time progress tracking, multiple file upload support, and comprehensive testing. The system integrates MinIO for local development and supports S3-compatible services for production.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- pnpm package manager installed
- Backend API running (for integration testing)
- MinIO service running in Docker Compose

## Environment Setup

### 1. Update Docker Compose Configuration

Add MinIO service to `docker-compose.yml`:

```yaml
services:
  # ... existing services ...

  minio:
    image: minio/minio:latest
    container_name: threadfilesharing-minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000" # MinIO API
      - "9001:9001" # MinIO Console
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - threadfilesharing-network

volumes:
  # ... existing volumes ...
  minio_data:
    driver: local
```

### 2. Environment Variables

Update backend `.env` files with MinIO configuration:

```bash
# Storage Configuration
STORAGE_TYPE=minio
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=threadfilesharing
MINIO_USE_SSL=false

# Upload Configuration
MAX_FILE_SIZE=10737418240  # 10GB
MAX_FILES_PER_UPLOAD=10
CHUNK_SIZE=5242880  # 5MB
UPLOAD_TIMEOUT=3600000  # 1 hour

# WebSocket Configuration
WEBSOCKET_CORS_ORIGIN=http://localhost:3000
```

### 3. Start Services

```bash
# Start all services including MinIO
docker-compose up -d

# Wait for MinIO to be healthy
docker-compose logs -f minio

# Verify MinIO is accessible
curl http://localhost:9000/minio/health/live
```

## API Testing with Bruno

### 1. Single File Upload Test

Create `tests/bruno/file-upload/single-file-upload.bru`:

```javascript
meta {
  name: Single File Upload
  type: http
  seq: 1
}

post {
  url: {{base_url}}/files/upload
  body: multipartForm
  auth: bearer
}

auth:bearer {
  token: {{access_token}}
}

body:multipartForm {
  files: @file(sample-document.pdf)
  chatroomId: {{chatroom_id}}
  sessionName: "Test Upload Session"
}

tests {
  test("Upload initiated successfully", function() {
    expect(res.getStatus()).to.equal(201);
    expect(res.getBody().status).to.equal("success");
    expect(res.getBody().data.sessionId).to.be.a("string");
    expect(res.getBody().data.files).to.be.an("array");
    expect(res.getBody().data.files[0].fileId).to.be.a("string");
  });
}
```

### 2. Multiple File Upload Test

Create `tests/bruno/file-upload/multiple-file-upload.bru`:

```javascript
meta {
  name: Multiple File Upload
  type: http
  seq: 2
}

post {
  url: {{base_url}}/files/upload
  body: multipartForm
  auth: bearer
}

auth:bearer {
  token: {{access_token}}
}

body:multipartForm {
  files: @files(sample-document.pdf, sample-image.jpg, sample-video.mp4)
  threadId: {{thread_id}}
  sessionName: "Multiple File Test"
}

tests {
  test("Multiple files upload initiated", function() {
    expect(res.getStatus()).to.equal(201);
    expect(res.getBody().status).to.equal("success");
    expect(res.getBody().data.files.length).to.be.greaterThan(1);

    // Store session ID for progress tracking
    bru.setVar("upload_session_id", res.getBody().data.sessionId);
  });
}
```

### 3. Upload Progress Test

Create `tests/bruno/file-upload/upload-progress.bru`:

```javascript
meta {
  name: Upload Progress
  type: http
  seq: 3
}

get {
  url: {{base_url}}/upload-progress/{{upload_session_id}}
  auth: bearer
}

auth:bearer {
  token: {{access_token}}
}

tests {
  test("Progress retrieved successfully", function() {
    expect(res.getStatus()).to.equal(200);
    expect(res.getBody().status).to.equal("success");
    expect(res.getBody().data.sessionId).to.equal(bru.getVar("upload_session_id"));
    expect(res.getBody().data.files).to.be.an("array");

    // Check progress for each file
    res.getBody().data.files.forEach(function(file) {
      expect(file.progressPercentage).to.be.at.least(0);
      expect(file.progressPercentage).to.be.at.most(100);
      expect(file.status).to.be.oneOf(["PENDING", "UPLOADING", "COMPLETED", "FAILED"]);
    });
  });
}
```

### 4. File Download Test

Create `tests/bruno/file-upload/file-download.bru`:

```javascript
meta {
  name: File Download
  type: http
  seq: 4
}

get {
  url: {{base_url}}/files/{{file_id}}/download
  auth: bearer
}

auth:bearer {
  token: {{access_token}}
}

tests {
  test("Download URL generated", function() {
    expect(res.getStatus()).to.equal(200);
    expect(res.getBody().status).to.equal("success");
    expect(res.getBody().data.downloadUrl).to.be.a("string");
    expect(res.getBody().data.expiresAt).to.be.a("string");
    expect(res.getBody().data.filename).to.be.a("string");
  });
}
```

### 5. Storage Quota Test

Create `tests/bruno/storage/storage-quota.bru`:

```javascript
meta {
  name: Storage Quota
  type: http
  seq: 5
}

get {
  url: {{base_url}}/storage/quota
  auth: bearer
}

auth:bearer {
  token: {{access_token}}
}

tests {
  test("Storage quota retrieved", function() {
    expect(res.getStatus()).to.equal(200);
    expect(res.getBody().status).to.equal("success");
    expect(res.getBody().data.storageLimitBytes).to.be.a("number");
    expect(res.getBody().data.storageUsedBytes).to.be.a("number");
    expect(res.getBody().data.fileCount).to.be.a("number");
    expect(res.getBody().data.usagePercentage).to.be.a("number");
  });
}
```

## WebSocket Testing

### 1. Upload Progress WebSocket Test

Create `tests/websocket/upload-progress.js`:

```javascript
const io = require("socket.io-client");

describe("Upload Progress WebSocket", function () {
  let socket;
  const serverUrl = "http://localhost:3001";
  const authToken = "your-jwt-token";
  const sessionId = "your-upload-session-id";

  before(function () {
    socket = io(serverUrl, {
      auth: {
        token: authToken,
      },
    });
  });

  after(function () {
    socket.disconnect();
  });

  it("should receive upload progress updates", function (done) {
    // Join upload session room
    socket.emit("join_upload_session", { sessionId });

    // Listen for progress updates
    socket.on("upload_progress", function (data) {
      expect(data.sessionId).to.equal(sessionId);
      expect(data.fileId).to.be.a("string");
      expect(data.progressPercentage).to.be.at.least(0);
      expect(data.progressPercentage).to.be.at.most(100);

      if (data.status === "COMPLETED") {
        done();
      }
    });

    // Start file upload (triggered by API call)
    // This would be done via API call in real scenario
  });

  it("should receive session progress updates", function (done) {
    socket.on("upload_session_progress", function (data) {
      expect(data.sessionId).to.equal(sessionId);
      expect(data.totalFiles).to.be.a("number");
      expect(data.completedFiles).to.be.a("number");
      expect(data.overallProgressPercentage).to.be.at.least(0);
      expect(data.overallProgressPercentage).to.be.at.most(100);

      if (data.status === "COMPLETED") {
        done();
      }
    });
  });
});
```

## Integration Testing

### 1. End-to-End Upload Flow

```bash
# Run Bruno API tests
cd tests/bruno
bru run --env local

# Expected output:
# ✓ Single File Upload (201)
# ✓ Multiple File Upload (201)
# ✓ Upload Progress (200)
# ✓ File Download (200)
# ✓ Storage Quota (200)
```

### 2. WebSocket Integration Test

```bash
# Run WebSocket tests
cd tests/websocket
npm test

# Expected output:
# ✓ Upload Progress WebSocket
# ✓ Session Progress WebSocket
# ✓ Upload Completed Event
# ✓ Upload Failed Event
```

### 3. Performance Testing

```bash
# Test large file upload
curl -X POST http://localhost:3001/api/v1/files/upload \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "files=@large-file.zip" \
  -F "chatroomId=$CHATROOM_ID"

# Monitor progress via WebSocket
# Check storage quota updates
# Verify file is accessible for download
```

## Validation Steps

### 1. MinIO Console Access

```bash
# Access MinIO Console
open http://localhost:9001

# Login credentials:
# Username: minioadmin
# Password: minioadmin

# Verify bucket creation and file storage
```

### 2. Database Verification

```sql
-- Check file metadata
SELECT id, original_name, size_bytes, storage_key, created_at
FROM file
ORDER BY created_at DESC;

-- Check upload progress
SELECT session_id, file_id, status, progress_percentage, bytes_uploaded
FROM upload_progress
WHERE status = 'UPLOADING';

-- Check storage quota
SELECT company_id, storage_used_bytes, storage_limit_bytes, file_count
FROM storage_quota;
```

### 3. Storage Verification

```bash
# Check MinIO bucket contents
docker exec threadfilesharing-minio mc ls minio/threadfilesharing/

# Verify file integrity
docker exec threadfilesharing-minio mc stat minio/threadfilesharing/companies/[company-id]/files/[file-id]/original-filename
```

## Error Handling Tests

### 1. File Size Limit Test

```javascript
// Upload file exceeding size limit
post {
  url: {{base_url}}/files/upload
  body: multipartForm
  auth: bearer
}

body:multipartForm {
  files: @file(very-large-file.zip)  // > 10GB
}

tests {
  test("File size limit enforced", function() {
    expect(res.getStatus()).to.equal(413);
    expect(res.getBody().error.code).to.equal("FILE_TOO_LARGE");
  });
}
```

### 2. Storage Quota Test

```javascript
// Upload files until quota exceeded
tests {
  test("Storage quota enforced", function() {
    expect(res.getStatus()).to.equal(507);
    expect(res.getBody().error.code).to.equal("STORAGE_QUOTA_EXCEEDED");
  });
}
```

### 3. Network Failure Simulation

```bash
# Stop MinIO service
docker-compose stop minio

# Attempt file upload
curl -X POST http://localhost:3001/api/v1/files/upload \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "files=@test-file.pdf"

# Expected: 503 Service Unavailable or connection error
# Restart MinIO
docker-compose start minio
```

## Success Criteria

### ✅ Upload Functionality

- [ ] Single file upload works with progress tracking
- [ ] Multiple file upload works with individual progress
- [ ] Large files (multi-gigabyte) upload successfully
- [ ] Upload progress updates in real-time via WebSocket
- [ ] Files are stored correctly in MinIO/S3

### ✅ API Endpoints

- [ ] All file upload endpoints respond correctly
- [ ] Progress tracking endpoint provides accurate data
- [ ] File download generates secure URLs
- [ ] Storage quota endpoint shows correct usage
- [ ] Error responses are properly formatted

### ✅ Real-time Features

- [ ] WebSocket events broadcast progress updates
- [ ] Session progress tracks multiple files
- [ ] Upload completion events fire correctly
- [ ] Error events provide detailed information
- [ ] Storage quota warnings work

### ✅ Error Handling

- [ ] File size limits are enforced
- [ ] Storage quotas are enforced
- [ ] Network failures are handled gracefully
- [ ] Invalid file types are rejected
- [ ] Authentication/authorization works

### ✅ Performance

- [ ] Large files upload without memory issues
- [ ] Multiple concurrent uploads work
- [ ] Progress updates are frequent and accurate
- [ ] Database queries are optimized
- [ ] Storage operations are efficient

## Troubleshooting

### Common Issues

1. **MinIO Connection Failed**

   ```bash
   # Check MinIO health
   curl http://localhost:9000/minio/health/live

   # Check Docker logs
   docker-compose logs minio

   # Restart MinIO
   docker-compose restart minio
   ```

2. **Upload Progress Not Updating**

   ```bash
   # Check WebSocket connection
   # Verify session ID is correct
   # Check upload progress database records
   ```

3. **File Not Found After Upload**

   ```bash
   # Check MinIO bucket
   docker exec threadfilesharing-minio mc ls minio/threadfilesharing/

   # Check database records
   SELECT * FROM file WHERE id = 'file-id';
   ```

4. **Storage Quota Issues**

   ```bash
   # Check quota calculation
   SELECT * FROM storage_quota WHERE company_id = 'company-id';

   # Recalculate quota
   # (Implementation-specific command)
   ```

## Next Steps

1. **Production Configuration**: Configure AWS S3 for production deployment
2. **File Processing**: Implement thumbnail generation and content analysis
3. **Security Hardening**: Add virus scanning and content validation
4. **Performance Optimization**: Implement CDN integration and caching
5. **Monitoring**: Add comprehensive logging and metrics collection

---

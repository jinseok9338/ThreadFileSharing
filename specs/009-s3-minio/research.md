# Research: S3/MinIO File Upload System

## Technical Decisions

### AWS SDK v3 for S3 Integration

**Decision**: Use AWS SDK v3 for Node.js with modular architecture and TypeScript support
**Rationale**:

- Modern, modular architecture with tree-shaking support
- Full TypeScript support with comprehensive type definitions
- Better performance and smaller bundle size compared to v2
- Official AWS support and active maintenance
- Compatible with both AWS S3 and S3-compatible services like MinIO

**Alternatives considered**: AWS SDK v2 (legacy, larger bundle), MinIO client only (less flexible for production)

### MinIO for Local Development

**Decision**: Use MinIO as S3-compatible storage for local development and testing
**Rationale**:

- 100% S3 API compatible for seamless development-to-production transition
- Docker container support for easy local setup
- High performance and scalability
- Active open-source community and enterprise support
- Supports all S3 operations including multipart uploads

**Alternatives considered**: Local file system (not production-like), AWS S3 for dev (expensive, slow)

### Multer for File Upload Handling

**Decision**: Use Multer middleware for handling multipart/form-data file uploads in NestJS
**Rationale**:

- Native NestJS integration with @UseInterceptors decorator
- Built-in support for memory and disk storage
- Progress tracking capabilities with custom storage engines
- Battle-tested in production environments
- Extensive configuration options for file validation

**Alternatives considered**: Busboy (lower level), formidable (less NestJS integration)

### Socket.io for Real-time Progress Updates

**Decision**: Use Socket.io for broadcasting upload progress to connected clients
**Rationale**:

- Already integrated in ThreadFileSharing system
- Reliable real-time communication with automatic reconnection
- Room-based broadcasting for targeted progress updates
- Event-driven architecture for clean separation of concerns
- Built-in acknowledgments and error handling

**Alternatives considered**: WebSocket native (more complex), Server-Sent Events (one-way only)

### Chunked Upload Strategy

**Decision**: Implement multipart upload for large files with configurable chunk size
**Rationale**:

- AWS S3 and MinIO native support for multipart uploads
- Better reliability for large files with resume capability
- Parallel chunk uploads for improved performance
- Progress tracking at chunk level for granular updates
- Automatic retry for failed chunks

**Alternatives considered**: Single-part upload (limited file size), custom chunking (complex)

## Implementation Approach

### File Upload Architecture

- **Controller Layer**: Handle HTTP requests, validate files, coordinate upload process
- **Service Layer**: Business logic, progress tracking, storage coordination
- **Storage Layer**: S3/MinIO integration, file operations, metadata management
- **WebSocket Layer**: Real-time progress broadcasting to connected clients
- **Entity Layer**: Database persistence for file metadata and associations

### Progress Tracking Strategy

- **Upload Session**: Track overall multi-file upload session
- **File Progress**: Individual file upload progress with chunk-level tracking
- **Real-time Updates**: WebSocket events for progress percentage, speed, ETA
- **Error Handling**: Granular error reporting with retry capabilities
- **Resume Support**: Resume interrupted uploads from last successful chunk

### Storage Organization

- **Bucket Strategy**: Company-based bucket organization for isolation
- **File Naming**: UUID-based naming with original filename metadata
- **Path Structure**: `companies/{companyId}/files/{fileId}/original-filename`
- **Metadata Storage**: PostgreSQL for file associations, S3/MinIO for binary data
- **Access Control**: Signed URLs with expiration for secure downloads

### Testing Strategy

- **Unit Tests**: Jest tests for all service methods and business logic
- **Integration Tests**: End-to-end upload flow testing with real MinIO
- **API Tests**: Bruno tests for all file upload endpoints
- **Performance Tests**: Large file upload testing and concurrent upload scenarios
- **Error Simulation**: Network failure, storage unavailability testing

## Dependencies and Versions

### Core Dependencies

- `@aws-sdk/client-s3`: ^3.450.0 (S3 client for AWS and MinIO)
- `@aws-sdk/lib-storage`: ^3.450.0 (Multipart upload support)
- `multer`: ^1.4.5-lts.1 (File upload middleware)
- `@nestjs/platform-fastify`: ^10.0.0 (Fastify adapter for NestJS)
- `socket.io`: ^4.7.4 (Real-time communication)
- `typeorm`: ^0.3.17 (Database ORM)

### Development Dependencies

- `minio`: ^7.1.3 (MinIO client for testing)
- `@nestjs/testing`: ^10.0.0 (Testing utilities)
- `jest`: ^29.0.0 (Testing framework)
- `supertest`: ^6.3.0 (HTTP testing)

### Environment Configuration

```env
# Storage Configuration
STORAGE_TYPE=minio  # or 's3' for production
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=threadfilesharing
MINIO_USE_SSL=false

# S3 Configuration (Production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=threadfilesharing-prod

# Upload Configuration
MAX_FILE_SIZE=10737418240  # 10GB
MAX_FILES_PER_UPLOAD=10
CHUNK_SIZE=5242880  # 5MB
UPLOAD_TIMEOUT=3600000  # 1 hour
```

## Risk Mitigation

### Storage Availability

- **Connection Pooling**: Configure S3/MinIO client connection pooling
- **Retry Logic**: Exponential backoff for failed upload operations
- **Health Checks**: Monitor storage service availability
- **Fallback Strategy**: Graceful degradation when storage is unavailable

### Upload Failures

- **Chunk-level Retry**: Retry individual chunks on failure
- **Progress Persistence**: Save upload progress to database
- **Resume Capability**: Resume interrupted uploads
- **Error Reporting**: Detailed error messages for troubleshooting

### Security Considerations

- **File Validation**: MIME type and extension validation
- **Virus Scanning**: Integration with antivirus scanning services
- **Access Control**: Signed URLs with expiration
- **Audit Logging**: Track all file operations for security

### Performance Optimization

- **Concurrent Uploads**: Parallel chunk uploads for large files
- **Connection Reuse**: Persistent connections to storage services
- **Caching**: Metadata caching for frequently accessed files
- **CDN Integration**: CloudFront or similar for file delivery

## WebSocket Integration Strategy

### Unified Architecture Design

- **Room Management**: Hierarchical room structure (Company → Chatroom → Thread → Upload Session)
- **Event Consolidation**: Unified event naming to prevent conflicts with future chat features
- **User Status Sharing**: Online/away/busy status integrated across file upload and chat
- **Notification System**: Centralized notifications for quota warnings, file processing, and system messages
- **Chat Integration**: Automatic message generation when files are uploaded to chatrooms/threads

### Future Chat Compatibility

- **Event Namespace**: Consistent event naming (`message_received`, `typing_indicator`, `user_status_changed`)
- **Room Patterns**: Standardized room patterns (`chatroom:{id}`, `thread:{id}`, `upload_session:{id}`)
- **User Context**: Shared user information structure across all real-time features
- **Notification Flow**: Seamless transition from upload completion to chat message

## Docker Compose Integration

### MinIO Service Configuration

```yaml
minio:
  image: minio/minio:latest
  container_name: threadfilesharing-minio
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  ports:
    - "9000:9000"
    - "9001:9001"
  volumes:
    - minio_data:/data
  command: server /data --console-address ":9001"
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
    interval: 30s
    timeout: 20s
    retries: 3
```

### Backend Service Updates

- **Environment Variables**: MinIO connection configuration
- **Health Checks**: Storage service availability monitoring
- **Dependencies**: Backend waits for MinIO to be healthy
- **Networking**: Internal Docker network for service communication

---

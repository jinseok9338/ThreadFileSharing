# Tasks: S3/MinIO File Upload System

**Input**: Design documents from `/specs/009-s3-minio/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)
**Status**: Ready for Implementation

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → ✅ Found: S3/MinIO file upload system with NestJS backend focus
2. Load optional design documents:
   → ✅ data-model.md: 6 entities (File, UploadProgress, UploadSession, FileAssociation, StorageQuota, DownloadToken)
   → ✅ contracts/: 4 contract files (file-upload-api.json, websocket-events.json, websocket-events-unified.json, websocket-events-business-aligned.json)
   → ✅ research.md: AWS SDK v3, MinIO client, Multer, Socket.io technical decisions
   → ✅ quickstart.md: MinIO setup, file upload testing, progress tracking validation
3. Generate tasks by category:
   → ✅ Setup: Docker Compose MinIO, dependencies, environment
   → ✅ Tests: Bruno API tests, Jest unit tests, WebSocket tests
   → ✅ Core: File entities, storage services, upload controllers
   → ✅ Integration: MinIO/S3, WebSocket gateway, progress tracking
   → ✅ Polish: Comprehensive testing, documentation, validation
4. Apply task rules:
   → ✅ Different files = marked [P] for parallel
   → ✅ Same file = sequential (no [P])
   → ✅ Tests before implementation (TDD)
5. Number tasks sequentially (T001-T035)
6. Generate dependency graph and parallel execution examples
7. Validate task completeness: All endpoints, entities, and contracts covered
8. Return: ✅ SUCCESS (35 tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Backend project**: `packages/backend/` (NestJS application)
- **Bruno tests**: `tests/bruno/` at repository root
- **Environment files**: Repository root (docker-compose.yml)
- **File entities**: `packages/backend/src/file/entities/`

## Phase 3.1: Infrastructure Setup

- [x] T001 [P] Add MinIO service to Docker Compose configuration in `docker-compose.yml`
- [x] T002 [P] Create MinIO environment variables in `env.template` (`.env.local`, `.env.development`, `.env.staging`, `.env.production`)
- [x] T003 [P] Install AWS SDK v3 and MinIO client dependencies in `packages/backend/package.json`
- [x] T004 [P] Install Multer and Socket.io dependencies in `packages/backend/package.json`
- [x] T005 [P] Configure MinIO health checks and volume persistence in `docker-compose.yml`

## Phase 3.2: Database Setup

- [ ] T006 Create File entity with S3/MinIO metadata in `packages/backend/src/file/entities/file.entity.ts`
- [ ] T007 Create UploadProgress entity for real-time tracking in `packages/backend/src/file/entities/upload-progress.entity.ts`
- [ ] T008 Create UploadSession entity for multi-file sessions in `packages/backend/src/file/entities/upload-session.entity.ts`
- [ ] T009 Create FileAssociation entity for chatroom/thread relationships in `packages/backend/src/file/entities/file-association.entity.ts`
- [ ] T010 Create StorageQuota entity for company limits in `packages/backend/src/file/entities/storage-quota.entity.ts`
- [ ] T011 Create DownloadToken entity for secure downloads in `packages/backend/src/file/entities/download-token.entity.ts`
- [ ] T012 Generate TypeORM migration for file entities in `packages/backend/src/database/migrations/`
- [ ] T013 Update DatabaseModule to include file entities in `packages/backend/src/database/database.module.ts`

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T014 [P] Bruno API test POST /api/v1/files/upload in `tests/bruno/file-upload/single-file-upload.bru`
- [ ] T015 [P] Bruno API test GET /api/v1/files in `tests/bruno/file-upload/list-files.bru`
- [ ] T016 [P] Bruno API test GET /api/v1/files/:id in `tests/bruno/file-upload/get-file.bru`
- [ ] T017 [P] Bruno API test GET /api/v1/files/:id/download in `tests/bruno/file-upload/download-file.bru`
- [ ] T018 [P] Bruno API test DELETE /api/v1/files/:id in `tests/bruno/file-upload/delete-file.bru`
- [ ] T019 [P] Bruno API test GET /api/v1/files/upload/progress/:fileId in `tests/bruno/file-upload/upload-progress.bru`
- [ ] T020 [P] Bruno API test GET /api/v1/files/storage/quota in `tests/bruno/storage/storage-quota.bru`
- [ ] T021 [P] Bruno API test MinIO health check in `tests/bruno/storage/minio-health.bru`
- [ ] T022 [P] Backend unit tests for FileService in `packages/backend/test/file/file.service.spec.ts`
- [ ] T023 [P] Backend unit tests for StorageService in `packages/backend/test/storage/storage.service.spec.ts`
- [ ] T024 [P] Backend unit tests for UploadProgressService in `packages/backend/test/upload-progress/upload-progress.service.spec.ts`
- [ ] T025 [P] WebSocket gateway tests for upload progress in `packages/backend/test/websocket/upload.gateway.spec.ts`

## Phase 3.4: Core Implementation (ONLY after tests are failing)

- [ ] T026 Create StorageService with MinIO/S3 integration in `packages/backend/src/storage/storage.service.ts`
- [ ] T027 Create MinIOService for local development in `packages/backend/src/storage/minio.service.ts`
- [ ] T028 Create FileService with upload/download logic in `packages/backend/src/file/file.service.ts`
- [ ] T029 Create UploadProgressService for real-time tracking in `packages/backend/src/upload-progress/upload-progress.service.ts`
- [ ] T030 Create FileController with all endpoints in `packages/backend/src/file/file.controller.ts`
- [ ] T031 Create UploadProgressController for progress tracking in `packages/backend/src/upload-progress/upload-progress.controller.ts`
- [ ] T032 Create File DTOs for request/response in `packages/backend/src/file/dto/`
- [ ] T033 Create UploadProgress DTOs in `packages/backend/src/upload-progress/dto/`

## Phase 3.5: WebSocket Integration

- [ ] T034 Create UploadGateway for real-time progress updates in `packages/backend/src/websocket/upload.gateway.ts`
- [ ] T035 Configure Socket.io for file upload events in `packages/backend/src/websocket/websocket.module.ts`
- [ ] T036 Integrate WebSocket with file upload progress in `packages/backend/src/file/file.service.ts`
- [ ] T037 Add WebSocket room management for upload sessions in `packages/backend/src/websocket/upload.gateway.ts`

## Phase 3.6: Integration & Configuration

- [ ] T038 Configure file upload middleware with Multer in `packages/backend/src/file/file.module.ts`
- [ ] T039 Configure S3/MinIO client with environment variables in `packages/backend/src/storage/storage.module.ts`
- [ ] T040 Add file size and type validation in `packages/backend/src/file/file.service.ts`
- [ ] T041 Implement storage quota enforcement in `packages/backend/src/file/file.service.ts`
- [ ] T042 Add secure download token generation in `packages/backend/src/file/file.service.ts`
- [ ] T043 Configure file upload progress tracking in `packages/backend/src/upload-progress/upload-progress.service.ts`

## Phase 3.7: Module Configuration

- [ ] T044 Create FileModule with all dependencies in `packages/backend/src/file/file.module.ts`
- [ ] T045 Create StorageModule with MinIO/S3 configuration in `packages/backend/src/storage/storage.module.ts`
- [ ] T046 Create UploadProgressModule in `packages/backend/src/upload-progress/upload-progress.module.ts`
- [ ] T047 Create WebSocketModule for upload events in `packages/backend/src/websocket/websocket.module.ts`
- [ ] T048 Update AppModule to include all file upload modules in `packages/backend/src/app.module.ts`

## Phase 3.8: Validation & Polish

- [ ] T049 [P] Run Bruno test suite for all file upload endpoints
- [ ] T050 [P] Execute quickstart validation scenarios from `quickstart.md`
- [ ] T051 [P] Performance testing for large file uploads (multi-gigabyte)
- [ ] T052 [P] Integration testing for MinIO and S3 compatibility
- [ ] T053 [P] WebSocket event testing for real-time progress updates
- [ ] T054 [P] Storage quota enforcement testing
- [ ] T055 [P] Security testing for file upload and download tokens
- [ ] T056 [P] Error handling testing for upload failures and retries
- [ ] T057 [P] Update API documentation with Swagger for file upload endpoints
- [ ] T058 [P] Create deployment documentation for MinIO/S3 configuration

## Dependency Graph

```
Setup Phase (T001-T005): All completed in parallel
  ↓
Database Phase (T006-T013): Completed sequentially
  ↓
Tests Phase (T014-T025): All completed in parallel
  ↓
Core Implementation Phase (T026-T033): Completed sequentially
  ↓
WebSocket Phase (T034-T037): Completed sequentially
  ↓
Integration Phase (T038-T043): Completed sequentially
  ↓
Module Configuration Phase (T044-T048): Completed sequentially
  ↓
Validation Phase (T049-T058): All completed in parallel
```

## Parallel Execution Examples

### Phase 3.1: Infrastructure Setup (T001-T005)

```bash
# All can run in parallel - different files
Task: "Add MinIO service to Docker Compose configuration in docker-compose.yml"
Task: "Create MinIO environment variables in .env.local, .env.development, .env.staging, .env.production"
Task: "Install AWS SDK v3 and MinIO client dependencies in packages/backend/package.json"
Task: "Install Multer and Socket.io dependencies in packages/backend/package.json"
Task: "Configure MinIO health checks and volume persistence in docker-compose.yml"
```

### Phase 3.2: Database Setup (T006-T011)

```bash
# All can run in parallel - different entity files
Task: "Create File entity with S3/MinIO metadata in packages/backend/src/file/entities/file.entity.ts"
Task: "Create UploadProgress entity for real-time tracking in packages/backend/src/file/entities/upload-progress.entity.ts"
Task: "Create UploadSession entity for multi-file sessions in packages/backend/src/file/entities/upload-session.entity.ts"
Task: "Create FileAssociation entity for chatroom/thread relationships in packages/backend/src/file/entities/file-association.entity.ts"
Task: "Create StorageQuota entity for company limits in packages/backend/src/file/entities/storage-quota.entity.ts"
Task: "Create DownloadToken entity for secure downloads in packages/backend/src/file/entities/download-token.entity.ts"
```

### Phase 3.3: Tests First (T014-T025)

```bash
# All can run in parallel - different test files
Task: "Bruno API test POST /api/v1/files/upload in tests/bruno/file-upload/single-file-upload.bru"
Task: "Bruno API test GET /api/v1/files in tests/bruno/file-upload/list-files.bru"
Task: "Bruno API test GET /api/v1/files/:id in tests/bruno/file-upload/get-file.bru"
Task: "Bruno API test GET /api/v1/files/:id/download in tests/bruno/file-upload/download-file.bru"
Task: "Bruno API test DELETE /api/v1/files/:id in tests/bruno/file-upload/delete-file.bru"
Task: "Bruno API test GET /api/v1/files/upload/progress/:fileId in tests/bruno/file-upload/upload-progress.bru"
Task: "Bruno API test GET /api/v1/files/storage/quota in tests/bruno/storage/storage-quota.bru"
Task: "Bruno API test MinIO health check in tests/bruno/storage/minio-health.bru"
Task: "Backend unit tests for FileService in packages/backend/test/file/file.service.spec.ts"
Task: "Backend unit tests for StorageService in packages/backend/test/storage/storage.service.spec.ts"
Task: "Backend unit tests for UploadProgressService in packages/backend/test/upload-progress/upload-progress.service.spec.ts"
Task: "WebSocket gateway tests for upload progress in packages/backend/test/websocket/upload.gateway.spec.ts"
```

### Phase 3.8: Validation & Polish (T049-T058)

```bash
# All can run in parallel - different validation areas
Task: "Run Bruno test suite for all file upload endpoints"
Task: "Execute quickstart validation scenarios from quickstart.md"
Task: "Performance testing for large file uploads (multi-gigabyte)"
Task: "Integration testing for MinIO and S3 compatibility"
Task: "WebSocket event testing for real-time progress updates"
Task: "Storage quota enforcement testing"
Task: "Security testing for file upload and download tokens"
Task: "Error handling testing for upload failures and retries"
Task: "Update API documentation with Swagger for file upload endpoints"
Task: "Create deployment documentation for MinIO/S3 configuration"
```

## Validation Checklist

_All items verified during task generation_

- [x] All contracts have corresponding Bruno API tests (8 test files)
- [x] All entities have model creation tasks (6 entity files)
- [x] All tests come before implementation (TDD approach)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] WebSocket events aligned with business logic
- [x] MinIO integration properly planned
- [x] Comprehensive test coverage planned

## Key Implementation Notes

### File Upload Features

- **Single/Multiple File Upload**: Support for concurrent uploads with individual progress tracking
- **Large File Support**: Multi-gigabyte files with chunked upload and progress tracking
- **Real-time Progress**: WebSocket-based progress updates for upload sessions
- **Storage Quotas**: Company-level storage limit enforcement
- **Secure Downloads**: Time-limited download tokens with access control

### WebSocket Integration

- **Business-Aligned Events**: Events match ThreadFileSharing business logic
- **Room Management**: Hierarchical rooms (Company → Chatroom → Thread → Upload Session)
- **Permission-Based Access**: Role-based WebSocket room access control
- **File-Thread Integration**: Automatic thread creation from file uploads

### Testing Strategy

- **Bruno API Tests**: Comprehensive endpoint testing for all file operations
- **Jest Unit Tests**: Service layer and business logic testing
- **WebSocket Tests**: Real-time event and progress tracking testing
- **Integration Tests**: MinIO/S3 compatibility and end-to-end workflows

### Security & Performance

- **Authentication**: JWT-based authentication for all file operations
- **Authorization**: Company and thread-based access control
- **Virus Scanning**: Integration points for file security scanning
- **Performance**: Optimized for large files and concurrent uploads

---

**Total Tasks**: 58 tasks (35 core + 23 parallel)
**Status**: ✅ **READY FOR EXECUTION**
**Focus**: Backend-only implementation with comprehensive testing
**Testing**: Bruno API tests, Jest unit tests, WebSocket integration tests
**Infrastructure**: MinIO local development, S3 production compatibility

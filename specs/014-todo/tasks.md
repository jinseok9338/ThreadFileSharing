# Tasks: 백엔드 TODO 항목 구현 완료

**Input**: Design documents from `/specs/014-todo/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Workspace project**: `packages/shared/`, `packages/backend/`, `packages/frontend/`
- **Bruno tests**: `tests/bruno/` at repository root
- **Package tests**: `packages/*/test/` or `packages/*/**tests**/`
- Paths shown below assume workspace structure from plan.md

## Phase 3.1: Setup & Analysis

- [x] T001 Analyze existing TODO items in backend code and create implementation checklist
- [x] T002 [P] Create backup of existing WebSocket Gateway file before modifications
- [x] T003 [P] Create backup of existing File Upload Service files before modifications
- [x] T004 [P] Create backup of existing Chunked Upload Service file before modifications
- [x] T005 [P] Create backup of existing WebSocket Room Service file before modifications
- [x] T006 [P] Setup Bruno API testing environment for new endpoints in tests/bruno/
- [x] T007 [P] Configure Docker and Docker Compose for backend service testing
- [x] T008 [P] Configure linting and formatting tools for modified files

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T009 [P] Bruno API test POST /api/v1/messages in tests/bruno/messages/create-message.bru
- [ ] T010 [P] Bruno API test GET /api/v1/messages/{messageId} in tests/bruno/messages/get-message.bru
- [ ] T011 [P] Bruno API test GET /api/v1/messages/{messageId}/reply in tests/bruno/messages/get-reply.bru
- [ ] T012 [P] Bruno API test GET /api/v1/threads/{threadId}/users/{userId}/role in tests/bruno/roles/thread-role.bru
- [ ] T013 [P] Bruno API test GET /api/v1/companies/{companyId}/users/{userId}/role in tests/bruno/roles/company-role.bru
- [ ] T014 [P] Bruno API test GET /api/v1/chatrooms/{chatroomId}/members/{userId} in tests/bruno/membership/chatroom-membership.bru
- [ ] T015 [P] Bruno API test GET /api/v1/threads/{threadId}/participants/{userId} in tests/bruno/membership/thread-participation.bru
- [ ] T016 [P] Bruno API test GET /api/v1/upload-sessions/{sessionId}/access in tests/bruno/upload/upload-session-access.bru
- [ ] T017 [P] Bruno API test POST /api/v1/files/upload/chunks/{sessionId}/validate in tests/bruno/upload/chunk-validation.bru
- [ ] T018 [P] Bruno API test POST /api/v1/files/upload/{fileId}/auto-actions in tests/bruno/upload/auto-actions.bru
- [ ] T019 [P] Bruno API test GET /api/v1/files/upload/progress/{sessionId} in tests/bruno/upload/upload-progress.bru
- [ ] T020 [P] Backend unit tests for MessageService in packages/backend/test/unit/message.service.spec.ts
- [ ] T021 [P] Backend unit tests for ThreadService role methods in packages/backend/test/unit/thread.service.spec.ts
- [ ] T022 [P] Backend unit tests for ChatroomService membership methods in packages/backend/test/unit/chatroom.service.spec.ts
- [ ] T023 [P] Backend unit tests for ChunkedUploadService checksum validation in packages/backend/test/unit/chunked-upload.service.spec.ts
- [ ] T024 [P] Backend unit tests for FileUploadService auto-actions in packages/backend/test/unit/file-upload.service.spec.ts
- [ ] T025 [P] WebSocket integration tests for message persistence in packages/backend/test/integration/websocket-message.spec.ts
- [ ] T026 [P] WebSocket integration tests for role retrieval in packages/backend/test/integration/websocket-role.spec.ts
- [ ] T027 [P] WebSocket integration tests for membership validation in packages/backend/test/integration/websocket-membership.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### 높은 우선순위 (핵심 기능)

- [ ] T028 Implement MessageService.createMessage method in packages/backend/src/message/services/message.service.ts
- [ ] T029 Implement MessageService.getReplyData method in packages/backend/src/message/services/message.service.ts
- [ ] T030 Integrate MessageService into WebSocket Gateway for chatroom messages in packages/backend/src/websocket/gateway/websocket.gateway.ts
- [ ] T031 Integrate MessageService into WebSocket Gateway for thread messages in packages/backend/src/websocket/gateway/websocket.gateway.ts
- [ ] T032 Implement ThreadService.getUserRole method in packages/backend/src/thread/thread.service.ts
- [ ] T033 Integrate ThreadService role retrieval into WebSocket Gateway in packages/backend/src/websocket/gateway/websocket.gateway.ts
- [ ] T034 Implement ChatroomService.isUserMember method in packages/backend/src/chatroom/chatroom.service.ts
- [ ] T035 Implement ThreadService.isUserParticipant method in packages/backend/src/thread/thread.service.ts
- [ ] T036 Implement UploadSessionService.hasUserAccess method in packages/backend/src/file/services/upload-session.service.ts
- [ ] T037 Integrate membership validation into WebSocket Room Service in packages/backend/src/websocket/services/websocket-room.service.ts
- [ ] T038 Implement SHA-256 checksum calculation in packages/backend/src/file/services/chunked-upload.service.ts
- [ ] T039 Implement chunk checksum validation in packages/backend/src/file/services/chunked-upload.service.ts

### 중간 우선순위 (기능 완성)

- [ ] T040 Implement FileUploadService auto-actions for chatroom messages in packages/backend/src/file/services/file-upload.service.ts
- [ ] T041 Implement FileUploadService auto-actions for thread creation in packages/backend/src/file/services/file-upload.service.ts
- [ ] T042 Integrate MessageService and ThreadService into FileUploadService in packages/backend/src/file/services/file-upload.service.ts
- [ ] T043 Implement CompanyService.getUserRole method in packages/backend/src/company/company.service.ts
- [ ] T044 Integrate CompanyService role retrieval into FileUploadService in packages/backend/src/file/services/file-upload.service.ts
- [ ] T045 Implement UploadProgressService WebSocket broadcasting in packages/backend/src/file/services/upload-progress.service.ts
- [ ] T046 Integrate WebSocket Gateway into UploadProgressService in packages/backend/src/file/services/upload-progress.service.ts

### 낮은 우선순위 (최적화)

- [ ] T047 Implement company-based access control in ThreadService in packages/backend/src/thread/thread.service.ts
- [ ] T048 Implement thread message filtering in MessageService in packages/backend/src/message/services/message.service.ts

## Phase 3.4: Integration

- [ ] T049 Configure TypeORM entities for new Message fields in packages/backend/src/message/entities/message.entity.ts
- [ ] T050 Configure TypeORM entities for ThreadRole in packages/backend/src/thread/entities/thread-role.entity.ts
- [ ] T051 Configure TypeORM entities for ChatroomMembership in packages/backend/src/chatroom/entities/chatroom-membership.entity.ts
- [ ] T052 Configure TypeORM entities for ThreadParticipation in packages/backend/src/thread/entities/thread-participation.entity.ts
- [ ] T053 Configure TypeORM entities for UploadSession in packages/backend/src/file/entities/upload-session.entity.ts
- [ ] T054 Configure TypeORM entities for ChunkChecksum in packages/backend/src/file/entities/chunk-checksum.entity.ts
- [ ] T055 Configure TypeORM entities for CompanyRole in packages/backend/src/company/entities/company-role.entity.ts
- [ ] T056 Create TypeORM migrations for new entities and fields
- [ ] T057 Update WebSocket Gateway module imports for new services
- [ ] T058 Update FileUploadService module imports for new services
- [ ] T059 Update ChunkedUploadService module imports for new services
- [ ] T060 Update WebSocket Room Service module imports for new services
- [ ] T061 Configure error handling and logging for all new methods
- [ ] T062 Configure transaction boundaries for message persistence
- [ ] T063 Configure transaction boundaries for auto-actions

## Phase 3.5: Polish

- [ ] T064 [P] Unit tests for MessageService new methods in packages/backend/test/unit/message.service.spec.ts
- [ ] T065 [P] Unit tests for ThreadService new methods in packages/backend/test/unit/thread.service.spec.ts
- [ ] T066 [P] Unit tests for ChatroomService new methods in packages/backend/test/unit/chatroom.service.spec.ts
- [ ] T067 [P] Unit tests for ChunkedUploadService new methods in packages/backend/test/unit/chunked-upload.service.spec.ts
- [ ] T068 [P] Unit tests for FileUploadService new methods in packages/backend/test/unit/file-upload.service.spec.ts
- [ ] T069 [P] Unit tests for CompanyService new methods in packages/backend/test/unit/company.service.spec.ts
- [ ] T070 [P] Unit tests for UploadProgressService new methods in packages/backend/test/unit/upload-progress.service.spec.ts
- [ ] T071 [P] Integration tests for WebSocket message persistence in packages/backend/test/integration/websocket-message-persistence.spec.ts
- [ ] T072 [P] Integration tests for role retrieval in packages/backend/test/integration/role-retrieval.spec.ts
- [ ] T073 [P] Integration tests for membership validation in packages/backend/test/integration/membership-validation.spec.ts
- [ ] T074 [P] Integration tests for checksum validation in packages/backend/test/integration/checksum-validation.spec.ts
- [ ] T075 [P] Integration tests for auto-actions in packages/backend/test/integration/auto-actions.spec.ts
- [ ] T076 Performance tests for message persistence (< 100ms)
- [ ] T077 Performance tests for role retrieval (< 50ms)
- [ ] T078 Performance tests for checksum validation (< 200ms)
- [ ] T079 [P] Update API documentation with Swagger for new endpoints
- [ ] T080 [P] Complete Bruno API test coverage for all new endpoints
- [ ] T081 [P] Update WebSocket event documentation
- [ ] T082 Code refactoring and duplication removal
- [ ] T083 Docker image optimization for production
- [ ] T084 Run E2E testing suite with WebSocket functionality
- [ ] T085 Security audit for new message persistence and role validation
- [ ] T086 Type safety validation across all new methods
- [ ] T087 Remove all TODO comments from backend code
- [ ] T088 Verify all 26 TODO items have been implemented and tested

## Dependencies

- Tests (T009-T027) before implementation (T028-T048)
- T028-T031 blocks T030-T031 (MessageService integration)
- T032-T033 blocks T033 (ThreadService integration)
- T034-T037 blocks T037 (Membership validation integration)
- T038-T039 blocks T039 (Checksum validation)
- T040-T046 blocks T042 (Auto-actions integration)
- T047-T048 blocks T048 (Optimization features)
- Implementation before integration (T028-T048 before T049-T063)
- Integration before polish (T049-T063 before T064-T088)

## Parallel Example

```
# Launch T009-T019 together (Bruno API tests):
Task: "Bruno API test POST /api/v1/messages in tests/bruno/messages/create-message.bru"
Task: "Bruno API test GET /api/v1/messages/{messageId} in tests/bruno/messages/get-message.bru"
Task: "Bruno API test GET /api/v1/threads/{threadId}/users/{userId}/role in tests/bruno/roles/thread-role.bru"
Task: "Bruno API test GET /api/v1/companies/{companyId}/users/{userId}/role in tests/bruno/roles/company-role.bru"
Task: "Bruno API test POST /api/v1/files/upload/chunks/{sessionId}/validate in tests/bruno/upload/chunk-validation.bru"

# Launch T020-T027 together (Backend unit tests):
Task: "Backend unit tests for MessageService in packages/backend/test/unit/message.service.spec.ts"
Task: "Backend unit tests for ThreadService role methods in packages/backend/test/unit/thread.service.spec.ts"
Task: "Backend unit tests for ChatroomService membership methods in packages/backend/test/unit/chatroom.service.spec.ts"
Task: "Backend unit tests for ChunkedUploadService checksum validation in packages/backend/test/unit/chunked-upload.service.spec.ts"
Task: "WebSocket integration tests for message persistence in packages/backend/test/integration/websocket-message.spec.ts"

# Launch T064-T075 together (Polish unit tests):
Task: "Unit tests for MessageService new methods in packages/backend/test/unit/message.service.spec.ts"
Task: "Unit tests for ThreadService new methods in packages/backend/test/unit/thread.service.spec.ts"
Task: "Unit tests for ChatroomService new methods in packages/backend/test/unit/chatroom.service.spec.ts"
Task: "Integration tests for WebSocket message persistence in packages/backend/test/integration/websocket-message-persistence.spec.ts"
Task: "Integration tests for role retrieval in packages/backend/test/integration/role-retrieval.spec.ts"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Focus on removing all 26 TODO items from backend code
- Maintain backward compatibility with existing WebSocket clients
- Ensure all new functionality is properly tested

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:

   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] All 26 TODO items are addressed
- [x] Backward compatibility is maintained
- [x] Performance goals are considered

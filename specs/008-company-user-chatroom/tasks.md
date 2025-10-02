# Tasks: Company User Chatroom Data Structure

**Input**: Design documents from `/specs/008-company-user-chatroom/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Extract: NestJS + TypeORM, React 18+, Socket.io, MinIO
2. Load design documents:
   → data-model.md: 10 entities → model tasks
   → contracts/: 3 API files → contract test tasks
   → research.md: Permission decisions → setup tasks
   → quickstart.md: 7 scenarios → integration tests
3. Generate tasks by category:
   → Setup: Shared types, DB models, permission system
   → Tests: Contract tests, permission validation, integration
   → Core: Entities, services, APIs, permission guards
   → Integration: DB migrations, permission enforcement
   → Polish: Unit tests, documentation, validation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Tests before implementation (TDD)
   → Models before services before APIs
5. Number tasks sequentially (T001, T002...)
6. Focus on DB design and permission system as requested
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Focus on DB design and permission system

## Phase 3.1: Setup and Constants

- [x] T001 [P] Define permission enums and constants in `packages/backend/src/constants/permissions.ts`
- [x] T002 [P] Create Company DTOs in `packages/backend/src/company/dto/`
- [x] T003 [P] Create User DTOs in `packages/backend/src/user/dto/`
- [x] T004 [P] Create ChatRoom DTOs in `packages/backend/src/chatroom/dto/`
- [x] T005 [P] Create Thread DTOs in `packages/backend/src/thread/dto/`
- [x] T006 [P] Create File DTOs in `packages/backend/src/file/dto/`

## Phase 3.2: Database Models (DB Design Focus)

- [x] T007 [P] Create Company entity with storage quotas in `packages/backend/src/company/entities/company.entity.ts`
- [x] T008 [P] Create User entity with company roles in `packages/backend/src/user/entities/user.entity.ts`
- [x] T009 [P] Create ChatRoom entity in `packages/backend/src/chatroom/entities/chatroom.entity.ts`
- [x] T010 [P] Create Thread entity with file association in `packages/backend/src/thread/entities/thread.entity.ts`
- [x] T011 [P] Create File entity with metadata in `packages/backend/src/file/entities/file.entity.ts`
- [x] T012 [P] Create Message entity in `packages/backend/src/message/entities/message.entity.ts`
- [x] T013 [P] Create ThreadMessage entity in `packages/backend/src/thread-message/entities/thread-message.entity.ts`
- [x] T014 [P] Create ThreadParticipant entity with access types in `packages/backend/src/thread-participant/entities/thread-participant.entity.ts`
- [x] T015 [P] Create CompanyInvitation entity in `packages/backend/src/company-invitation/entities/company-invitation.entity.ts`
- [x] T016 [P] Create RefreshToken entity in `packages/backend/src/refresh-token/entities/refresh-token.entity.ts`

## Phase 3.3: Permission System (Critical Focus)

- [x] T017 [P] Create CompanyRoleGuard for company-level permissions in `packages/backend/src/auth/guards/company-role.guard.ts`
- [x] T018 [P] Create ThreadRoleGuard for thread-level permissions in `packages/backend/src/auth/guards/thread-role.guard.ts`
- [x] T019 [P] Create PermissionService for role hierarchy validation in `packages/backend/src/permission/permission.service.ts`
- [x] T020 [P] Create RoleHierarchyService for permission inheritance in `packages/backend/src/permission/role-hierarchy.service.ts`
- [x] T021 [P] Create StorageQuotaService for company storage limits in `packages/backend/src/storage/storage-quota.service.ts`
- [x] T022 [P] Create PermissionDecorator for endpoint-level permissions in `packages/backend/src/auth/decorators/permissions.decorator.ts`
- [x] T023 [P] Create AccessTypeService for MEMBER vs SHARED access in `packages/backend/src/permission/access-type.service.ts`

## Phase 3.4: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.5

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T024 [P] Bruno API test ChatRoom endpoints in `tests/bruno/chatroom/`
- [ ] T025 [P] Bruno API test Thread endpoints in `tests/bruno/thread/`
- [ ] T026 [P] Bruno API test File endpoints in `tests/bruno/file/`
- [ ] T027 [P] Permission validation tests in `packages/backend/test/permission/permission.service.spec.ts`
- [ ] T028 [P] Role hierarchy tests in `packages/backend/test/permission/role-hierarchy.service.spec.ts`
- [ ] T029 [P] Storage quota tests in `packages/backend/test/storage/storage-quota.service.spec.ts`
- [ ] T030 [P] ThreadParticipant access type tests in `packages/backend/test/thread-participant/thread-participant.entity.spec.ts`
- [ ] T031 [P] Integration test for company admin creates chatroom in `packages/backend/test/integration/chatroom-creation.spec.ts`
- [ ] T032 [P] Integration test for file upload triggers thread creation in `packages/backend/test/integration/thread-creation.spec.ts`
- [ ] T033 [P] Integration test for thread sharing in `packages/backend/test/integration/thread-sharing.spec.ts`
- [ ] T034 [P] Integration test for permission-based file access in `packages/backend/test/integration/file-permissions.spec.ts`
- [ ] T035 [P] Integration test for storage quota management in `packages/backend/test/integration/storage-quota.spec.ts`

## Phase 3.5: Core Services (ONLY after tests are failing)

- [ ] T036 [P] Create CompanyService with storage management in `packages/backend/src/company/company.service.ts`
- [ ] T037 [P] Create UserService with company role management in `packages/backend/src/user/user.service.ts`
- [ ] T038 [P] Create ChatRoomService with permission checks in `packages/backend/src/chatroom/chatroom.service.ts`
- [ ] T039 [P] Create ThreadService with participant management in `packages/backend/src/thread/thread.service.ts`
- [ ] T040 [P] Create FileService with storage integration in `packages/backend/src/file/file.service.ts`
- [ ] T041 [P] Create MessageService for chatroom messages in `packages/backend/src/message/message.service.ts`
- [ ] T042 [P] Create ThreadMessageService for thread messages in `packages/backend/src/thread-message/thread-message.service.ts`
- [ ] T043 [P] Create ThreadParticipantService for access control in `packages/backend/src/thread-participant/thread-participant.service.ts`
- [ ] T044 [P] Create MinIOService for file storage in `packages/backend/src/storage/minio.service.ts`

## Phase 3.6: API Controllers

- [ ] T045 [P] Create ChatRoomController with permission guards in `packages/backend/src/chatroom/chatroom.controller.ts`
- [ ] T046 [P] Create ThreadController with access type validation in `packages/backend/src/thread/thread.controller.ts`
- [ ] T047 [P] Create FileController with storage quota checks in `packages/backend/src/file/file.controller.ts`
- [ ] T048 [P] Create ThreadShareController for sharing functionality in `packages/backend/src/thread/thread-share.controller.ts`
- [ ] T049 [P] Create PermissionController for role management in `packages/backend/src/permission/permission.controller.ts`
- [ ] T050 [P] Create StorageController for quota management in `packages/backend/src/storage/storage.controller.ts`

## Phase 3.7: Database Integration

- [ ] T054 Create TypeORM migrations for all entities in `packages/backend/src/migrations/`
- [ ] T055 Configure PostgreSQL with proper indexes for permission queries
- [ ] T056 Setup database constraints for unique keys and foreign keys
- [ ] T057 Configure soft delete for all entities
- [ ] T058 [P] Create database seeders for comprehensive test data in `packages/backend/src/database/seeds/`
- [ ] T058a [P] Create CompanySeeder with single shared company in `packages/backend/src/database/seeds/company.seeder.ts`
- [ ] T058b [P] Create UserSeeder with 30 users (3 Owners, 5 Admins, 22 Members) in `packages/backend/src/database/seeds/user.seeder.ts`
- [ ] T058c [P] Create ChatRoomSeeder with multiple chatrooms in `packages/backend/src/database/seeds/chatroom.seeder.ts`
- [ ] T058d [P] Create ThreadSeeder with file-centric threads in `packages/backend/src/database/seeds/thread.seeder.ts`
- [ ] T058e [P] Create FileSeeder with sample files and metadata in `packages/backend/src/database/seeds/file.seeder.ts`
- [ ] T058f [P] Create MessageSeeder with chatroom and thread messages in `packages/backend/src/database/seeds/message.seeder.ts`
- [ ] T058g [P] Create ThreadParticipantSeeder with access types and sharing in `packages/backend/src/database/seeds/thread-participant.seeder.ts`
- [ ] T058h Update jinseok9338@gmail.com password to "Dodzjtm17!!" in user seeder
- [ ] T059 Setup database connection pooling for concurrent users

## Phase 3.8: Real-time Integration

- [ ] T060 [P] Create ChatGateway with Socket.io for real-time messaging in `packages/backend/src/chat/chat.gateway.ts`
- [ ] T061 [P] Create ThreadGateway for thread-specific events in `packages/backend/src/thread/thread.gateway.ts`
- [ ] T062 [P] Create PermissionGateway for real-time permission updates in `packages/backend/src/permission/permission.gateway.ts`
- [ ] T063 [P] Create FileGateway for upload progress in `packages/backend/src/file/file.gateway.ts`
- [ ] T064 [P] Setup Redis for Socket.io session management

## Phase 3.9: Polish and Validation

- [ ] T065 [P] Unit tests for all services in `packages/backend/test/services/`
- [ ] T066 [P] Unit tests for all controllers in `packages/backend/test/controllers/`
- [ ] T067 [P] Unit tests for all guards in `packages/backend/test/guards/`
- [ ] T068 [P] Complete Bruno API test coverage for all endpoints
- [ ] T069 [P] Performance tests for permission queries
- [ ] T070 [P] Security audit for permission system
- [ ] T071 [P] Database performance optimization
- [ ] T072 [P] Update API documentation with permission requirements
- [ ] T073 [P] Create entity relationship diagrams
- [ ] T074 [P] Document permission matrix implementation
- [ ] T075 [P] Create quickstart validation scripts

## Dependencies

- T001-T009 (Setup) before T010-T019 (Models)
- T010-T019 (Models) before T020-T026 (Permission System)
- T020-T026 (Permission System) before T027-T038 (Tests)
- T027-T038 (Tests) before T039-T047 (Services)
- T039-T047 (Services) before T048-T053 (Controllers)
- T048-T053 (Controllers) before T054-T059 (DB Integration)
- T054-T059 (DB Integration) before T060-T064 (Real-time)
- T060-T064 (Real-time) before T065-T075 (Polish)

## Parallel Execution Examples

```
# Launch T001-T009 together (Type Definitions):
Task: "Define Company entity types in backend"
Task: "Define User entity types in backend"
Task: "Define ChatRoom entity types in backend"
Task: "Define Thread entity types in backend"
Task: "Define File entity types in backend"
Task: "Define permission enums and constants"
Task: "Create Zod schemas for all entities"
Task: "Define frontend types"
Task: "Create API client types"

# Launch T010-T019 together (Database Models):
Task: "Create Company entity with storage quotas"
Task: "Create User entity with company roles"
Task: "Create ChatRoom entity"
Task: "Create Thread entity with file association"
Task: "Create File entity with metadata"

# Launch T020-T026 together (Permission System):
Task: "Create CompanyRoleGuard for company-level permissions"
Task: "Create ThreadRoleGuard for thread-level permissions"
Task: "Create PermissionService for role hierarchy validation"
Task: "Create RoleHierarchyService for permission inheritance"
Task: "Create StorageQuotaService for company storage limits"

# Launch T058a-T058h together (Seed Data):
Task: "Create CompanySeeder with single shared company"
Task: "Create UserSeeder with 30 users (3 Owners, 5 Admins, 22 Members)"
Task: "Create ChatRoomSeeder with multiple chatrooms"
Task: "Create ThreadSeeder with file-centric threads"
Task: "Create FileSeeder with sample files and metadata"
Task: "Create MessageSeeder with chatroom and thread messages"
Task: "Create ThreadParticipantSeeder with access types and sharing"
Task: "Update jinseok9338@gmail.com password to Dodzjtm17!!"

# Launch T027-T038 together (Tests):
Task: "Bruno API test ChatRoom endpoints"
Task: "Bruno API test Thread endpoints"
Task: "Bruno API test File endpoints"
Task: "Permission validation tests"
Task: "Role hierarchy tests"
```

## Critical Focus Areas

### DB Design Priority

- **Entity relationships**: Proper foreign keys and constraints
- **Permission storage**: ThreadParticipant with access types
- **Storage quotas**: Company-level limits with tracking
- **Soft deletes**: Data integrity preservation

### Permission System Priority

- **Role hierarchy**: Company (Owner > Admin > Member) + Thread (Owner > Member > Viewer)
- **Access types**: MEMBER vs SHARED distinction
- **Guard implementation**: NestJS guards for endpoint protection
- **Real-time updates**: WebSocket permission change notifications

## Seed Data Requirements

### User Structure (30 users total)

- **Owners**: 3 users (Company owners with full permissions)
- **Admins**: 5 users (Company admins with user management)
- **Members**: 22 users (Regular company members)
- **Special Account**: jinseok9338@gmail.com with password "Dodzjtm17!!"

### Company Structure

- **Single Company**: All 30 users belong to the same company
- **Storage Limit**: 50GB default quota
- **Company Name**: "ThreadFileSharing Company" or similar

### ChatRoom Structure

- **Multiple ChatRooms**: 5-8 chatrooms for different teams/projects
- **Team-based**: 디자인팀, 개발팀, 기획팀, 마케팅팀, 운영팀 등
- **Mixed Membership**: Users can belong to multiple chatrooms
- **Sample ChatRooms**:
  - "디자인팀" (Design Team)
  - "개발팀" (Development Team)
  - "기획팀" (Planning Team)
  - "마케팅팀" (Marketing Team)
  - "전체회의" (All Hands)

### Thread Structure

- **File-centric**: Each thread created around specific files
- **Diverse Content**: Documents, images, spreadsheets, presentations
- **Participant Mix**: Some threads with all members, some with subsets
- **Shared Threads**: Some threads shared with users not in parent chatroom

### File Structure

- **Various Types**: PDF, DOCX, XLSX, PPTX, JPG, PNG files
- **Realistic Names**: "프로젝트 기획서.pdf", "디자인 가이드.pptx" 등
- **Storage Simulation**: Files with realistic sizes (KB to MB range)
- **Metadata**: Proper upload dates, user attribution

### Message Structure

- **ChatRoom Messages**: General discussion messages
- **Thread Messages**: File-specific discussions
- **Realistic Content**: Korean text with emojis, mentions
- **Time Distribution**: Messages spread over recent weeks

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Focus on DB design and permission system as requested
- All permission checks must be tested thoroughly
- Storage quota enforcement is critical for business model
- **Seed Data Priority**: Create realistic test environment for permission validation

## Validation Checklist

- [ ] All 10 entities have corresponding model tasks
- [ ] All 3 contract files have corresponding test tasks
- [ ] All permission guards have test coverage
- [ ] All tests come before implementation (TDD)
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] DB design and permission system are prioritized
- [ ] No task modifies same file as another [P] task
- [ ] Seed data includes 30 users with proper role distribution (3 Owners, 5 Admins, 22 Members)
- [ ] jinseok9338@gmail.com password updated to "Dodzjtm17!!"
- [ ] All users belong to single shared company
- [ ] Seed data includes multiple chatrooms, threads, files, and messages
- [ ] Thread sharing scenarios included in seed data

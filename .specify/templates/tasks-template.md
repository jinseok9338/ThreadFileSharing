# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
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

## Phase 3.1: Setup

- [ ] T001 Create workspace structure (packages/shared, packages/backend, packages/frontend, docs/business, docs/screens)
- [ ] T002 [P] Initialize shared types package with TypeScript and Zod
- [ ] T003 [P] Initialize NestJS backend with Fastify, TypeORM, and Socket.io dependencies
- [ ] T004 [P] Initialize React frontend with React Router, Tailwind CSS 4, shadcn/ui, and Socket.io client
- [ ] T005 [P] Configure workspace dependencies and shared package imports
- [ ] T006 [P] Setup Bruno API testing environment in tests/bruno/
- [ ] T007 [P] Configure Docker and Docker Compose (NestJS, React, PostgreSQL, Redis)
- [ ] T008 [P] Configure linting and formatting tools (ESLint, Prettier for all packages)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T009 [P] Bruno API test POST /api/auth/register in tests/bruno/auth/register.bru
- [ ] T010 [P] Bruno API test POST /api/auth/login in tests/bruno/auth/login.bru
- [ ] T011 [P] Bruno API test GET /api/chat/messages in tests/bruno/chat/messages.bru
- [ ] T012 [P] Backend unit tests in packages/backend/test/auth/auth.controller.spec.ts
- [ ] T013 [P] WebSocket event tests in packages/backend/test/chat/chat.gateway.spec.ts
- [ ] T014 [P] React component tests in packages/frontend/src/components/**tests**/
- [ ] T015 [P] E2E tests for real-time chat flow using Jest and Socket.io client

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T016 [P] Document business logic in docs/business/ (user flows, permissions, rules)
- [ ] T017 [P] Create screen wireframes in docs/screens/wireframes/
- [ ] T018 [P] Document shadcn/ui component specifications in docs/screens/components/
- [ ] T019 [P] Shared types for User, Chat, Thread in packages/shared/src/types/
- [ ] T020 [P] Zod schemas for validation in packages/shared/src/schemas/
- [ ] T021 [P] User entity with TypeORM in packages/backend/src/users/entities/user.entity.ts
- [ ] T022 [P] Auth module with JWT strategy in packages/backend/src/auth/auth.module.ts
- [ ] T023 [P] Auth service with bcrypt in packages/backend/src/auth/auth.service.ts
- [ ] T024 [P] Auth controller with Guards in packages/backend/src/auth/auth.controller.ts
- [ ] T025 [P] Chat gateway with Socket.io in packages/backend/src/chat/chat.gateway.ts
- [ ] T026 [P] Thread entity and service in packages/backend/src/threads/
- [ ] T027 [P] File upload service with Multer in packages/backend/src/files/files.service.ts
- [ ] T028 [P] React auth components with shadcn/ui in packages/frontend/src/components/auth/
- [ ] T029 [P] React chat components with shadcn/ui in packages/frontend/src/components/chat/
- [ ] T030 [P] React Router setup and navigation in packages/frontend/src/routes/
- [ ] T031 [P] Socket.io client service in packages/frontend/src/services/socketService.ts
- [ ] T032 Input validation with class-validator and shared schemas
- [ ] T033 Error handling and logging with Winston

## Phase 3.4: Integration

- [ ] T034 Configure TypeORM with PostgreSQL and migrations
- [ ] T035 JWT authentication middleware and Guards
- [ ] T036 CORS configuration for React frontend
- [ ] T037 File storage configuration (local or S3)
- [ ] T038 Redis session store configuration
- [ ] T039 Workspace package linking and shared types import
- [ ] T040 Tailwind CSS 4 and shadcn/ui integration
- [ ] T041 Docker health check endpoints
- [ ] T042 Request/response logging with Winston

## Phase 3.5: Polish

- [ ] T043 [P] Unit tests for validation in packages/backend/test/unit/
- [ ] T044 [P] Frontend unit tests in packages/frontend/src/components/**tests**/
- [ ] T045 [P] Shared types validation tests in packages/shared/test/
- [ ] T046 Performance tests with NestJS metrics and monitoring
- [ ] T047 [P] Update API documentation with Swagger
- [ ] T048 [P] Complete Bruno API test coverage for all endpoints
- [ ] T049 [P] Update business and screen documentation with implementation details
- [ ] T050 [P] Responsive design testing for mobile/desktop
- [ ] T051 Code refactoring and duplication removal across packages
- [ ] T052 Docker image optimization for production
- [ ] T053 Run E2E testing suite with real-time features
- [ ] T054 Security audit for file uploads and authentication
- [ ] T055 Type safety validation across all packages
- [ ] T056 Accessibility testing for shadcn/ui components

## Dependencies

- Tests (T004-T007) before implementation (T008-T014)
- T008 blocks T009, T015
- T016 blocks T018
- Implementation before polish (T019-T023)

## Parallel Example

```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

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

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task

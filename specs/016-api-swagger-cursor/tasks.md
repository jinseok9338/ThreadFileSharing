# Tasks: 백엔드 API 문서 개선 및 Swagger 응답 스키마 보완

**Input**: Design documents from `/specs/016-api-swagger-cursor/`
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

- **Backend controllers**: `packages/backend/src/*/controllers/*.controller.ts`
- **Backend DTOs**: `packages/backend/src/*/dto/*.dto.ts`
- **Bruno tests**: `tests/bruno/` at repository root
- **Swagger documentation**: `packages/backend/src/*/controllers/*.controller.ts` (inline)
- Paths shown below assume workspace structure from plan.md

## Phase 3.1: Setup

- [ ] T001 [P] Analyze current Swagger documentation gaps in all 6 controllers
- [ ] T002 [P] Identify inconsistent pagination parameters across controllers
- [ ] T003 [P] Create documentation standards validation checklist
- [ ] T004 [P] Setup Swagger documentation testing environment
- [ ] T005 [P] Configure API response validation tools
- [ ] T006 [P] Setup cursor pagination format validation
- [ ] T007 [P] Create error response documentation templates
- [ ] T008 [P] Setup parallel controller analysis framework

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T009 [P] Bruno API test for AuthController response schemas in tests/bruno/auth/response-schemas.bru
- [ ] T010 [P] Bruno API test for ChatroomController response schemas in tests/bruno/chatroom/response-schemas.bru
- [ ] T011 [P] Bruno API test for CompanyController response schemas in tests/bruno/company/response-schemas.bru
- [ ] T012 [P] Bruno API test for FileController response schemas in tests/bruno/file/response-schemas.bru
- [ ] T013 [P] Bruno API test for MessageController response schemas in tests/bruno/message/response-schemas.bru
- [ ] T014 [P] Bruno API test for ThreadController response schemas in tests/bruno/thread/response-schemas.bru
- [ ] T015 [P] Bruno API test for cursor pagination consistency in tests/bruno/pagination/cursor-consistency.bru
- [ ] T016 [P] Bruno API test for error response formats in tests/bruno/errors/error-formats.bru
- [ ] T017 [P] Backend unit tests for Swagger decorators in packages/backend/test/swagger/swagger-decorators.spec.ts
- [ ] T018 [P] Backend unit tests for response DTOs in packages/backend/test/dto/response-dtos.spec.ts
- [ ] T019 [P] Integration tests for Swagger UI functionality in packages/backend/test/integration/swagger-ui.spec.ts
- [ ] T020 [P] Performance tests for Swagger documentation generation in packages/backend/test/performance/swagger-generation.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### AuthController Documentation

- [ ] T021 Add missing @ApiResponse decorators to packages/backend/src/auth/controllers/auth.controller.ts
- [ ] T022 Complete response DTO documentation in packages/backend/src/auth/dto/auth-response.dto.ts
- [ ] T023 Add error response documentation for all endpoints in packages/backend/src/auth/controllers/auth.controller.ts
- [ ] T024 Add working examples for all auth endpoints in packages/backend/src/auth/controllers/auth.controller.ts

### ChatroomController Documentation

- [ ] T025 [P] Add missing @ApiResponse decorators to packages/backend/src/chatroom/controllers/chatroom.controller.ts
- [ ] T026 [P] Complete member management response schemas in packages/backend/src/chatroom/dto/chatroom-response.dto.ts
- [ ] T027 [P] Add error response documentation for all endpoints in packages/backend/src/chatroom/controllers/chatroom.controller.ts
- [ ] T028 [P] Add working examples for all chatroom endpoints in packages/backend/src/chatroom/controllers/chatroom.controller.ts

### CompanyController Documentation

- [ ] T029 [P] Add missing @ApiResponse decorators to packages/backend/src/company/controllers/company.controller.ts
- [ ] T030 [P] Complete nested object response schemas in packages/backend/src/company/dto/company-response.dto.ts
- [ ] T031 [P] Add invitation system response documentation in packages/backend/src/company/controllers/company.controller.ts
- [ ] T032 [P] Add working examples for all company endpoints in packages/backend/src/company/controllers/company.controller.ts

### FileController Documentation

- [ ] T033 [P] Add missing @ApiResponse decorators to packages/backend/src/file/controllers/file.controller.ts
- [ ] T034 [P] Complete file upload response schemas in packages/backend/src/file/dto/file-response.dto.ts
- [ ] T035 [P] Add storage quota response documentation in packages/backend/src/file/controllers/file.controller.ts
- [ ] T036 [P] Add working examples for all file endpoints in packages/backend/src/file/controllers/file.controller.ts

### MessageController Documentation

- [ ] T037 [P] Add missing @ApiResponse decorators to packages/backend/src/message/controllers/message.controller.ts
- [ ] T038 [P] Complete pagination response schemas in packages/backend/src/message/dto/message-response.dto.ts
- [ ] T039 [P] Add search results response documentation in packages/backend/src/message/controllers/message.controller.ts
- [ ] T040 [P] Add working examples for all message endpoints in packages/backend/src/message/controllers/message.controller.ts

### ThreadController Documentation

- [ ] T041 [P] Add missing @ApiResponse decorators to packages/backend/src/thread/controllers/thread.controller.ts
- [ ] T042 [P] Complete thread-file relationship schemas in packages/backend/src/thread/dto/thread-response.dto.ts
- [ ] T043 [P] Add participant management response documentation in packages/backend/src/thread/controllers/thread.controller.ts
- [ ] T044 [P] Add working examples for all thread endpoints in packages/backend/src/thread/controllers/thread.controller.ts

## Phase 3.4: Cursor Pagination Standardization

- [ ] T045 [P] Update FileController pagination parameter from 'cursor' to 'lastIndex' in packages/backend/src/file/controllers/file.controller.ts
- [ ] T046 [P] Update ThreadController pagination parameter from 'cursor' to 'lastIndex' in packages/backend/src/thread/controllers/thread.controller.ts
- [ ] T047 [P] Update pagination query DTOs to use consistent 'lastIndex' parameter in packages/backend/src/\*/dto/cursor-pagination.dto.ts
- [ ] T048 [P] Update pagination response schemas to use 'nextCursor' consistently in packages/backend/src/\*/dto/pagination-response.dto.ts
- [ ] T049 [P] Add cursor format validation and examples in packages/backend/src/common/dto/cursor-format.dto.ts
- [ ] T050 [P] Update Swagger documentation for all pagination endpoints with consistent parameter names

## Phase 3.5: Error Response Standardization

- [ ] T051 [P] Create standardized error response DTO in packages/backend/src/common/dto/error-response.dto.ts
- [ ] T052 [P] Add consistent error response decorators to all controllers
- [ ] T053 [P] Document 400 Bad Request responses for all endpoints
- [ ] T054 [P] Document 401 Unauthorized responses for all endpoints
- [ ] T055 [P] Document 403 Forbidden responses for all endpoints
- [ ] T056 [P] Document 404 Not Found responses for all endpoints
- [ ] T057 [P] Document 500 Internal Server Error responses for all endpoints
- [ ] T058 [P] Add error response examples with proper status codes and message formats

## Phase 3.6: Integration

- [ ] T059 [P] Validate all response schemas match actual API responses
- [ ] T060 [P] Test Swagger UI functionality with updated documentation
- [ ] T061 [P] Verify cursor pagination works correctly with 'lastIndex' parameter
- [ ] T062 [P] Test error response formats across all endpoints
- [ ] T063 [P] Validate backward compatibility for existing API clients
- [ ] T064 [P] Test Swagger documentation generation performance (< 2s)
- [ ] T065 [P] Test Swagger UI load time (< 1s)
- [ ] T066 [P] Verify all examples work correctly in Swagger UI

## Phase 3.7: Polish

- [ ] T067 [P] Run comprehensive Bruno API test suite for all endpoints
- [ ] T068 [P] Validate 100% response schema documentation completeness
- [ ] T069 [P] Validate 100% pagination parameter consistency
- [ ] T070 [P] Validate 100% error response documentation
- [ ] T071 [P] Performance optimization for Swagger documentation generation
- [ ] T072 [P] Code review and refactoring of documentation patterns
- [ ] T073 [P] Update API documentation with implementation details
- [ ] T074 [P] Create developer guide for API documentation standards
- [ ] T075 [P] Security audit for documented endpoints
- [ ] T076 [P] Accessibility testing for Swagger UI
- [ ] T077 [P] Final validation and testing of all documentation improvements
- [ ] T078 [P] Generate comprehensive documentation report

## Dependencies

- Setup (T001-T008) before tests (T009-T020)
- Tests (T009-T020) before implementation (T021-T044)
- Implementation (T021-T044) before pagination standardization (T045-T050)
- Pagination standardization (T045-T050) before error standardization (T051-T058)
- Error standardization (T051-T058) before integration (T059-T066)
- Integration (T059-T066) before polish (T067-T078)

## Parallel Execution Examples

### Controller Documentation (T025-T044)

```
# Launch T025-T044 together (different controller files):
Task: "Add missing @ApiResponse decorators to ChatroomController"
Task: "Add missing @ApiResponse decorators to CompanyController"
Task: "Add missing @ApiResponse decorators to FileController"
Task: "Add missing @ApiResponse decorators to MessageController"
Task: "Add missing @ApiResponse decorators to ThreadController"
```

### Pagination Standardization (T045-T050)

```
# Launch T045-T050 together (different files):
Task: "Update FileController pagination parameter"
Task: "Update ThreadController pagination parameter"
Task: "Update pagination query DTOs"
Task: "Update pagination response schemas"
Task: "Add cursor format validation"
```

### Error Response Documentation (T051-T058)

```
# Launch T051-T058 together (different files):
Task: "Create standardized error response DTO"
Task: "Add consistent error response decorators"
Task: "Document 400 Bad Request responses"
Task: "Document 401 Unauthorized responses"
Task: "Document 403 Forbidden responses"
Task: "Document 404 Not Found responses"
Task: "Document 500 Internal Server Error responses"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Follow alphabetical order for controller analysis (Auth → Chatroom → Company → File → Message → Thread)
- Maintain backward compatibility for all API changes
- Ensure all documentation follows OpenAPI 3.0 specification

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - swagger-documentation.yaml → contract test tasks [P]
   - Each documentation standard → validation task
2. **From Data Model**:
   - ApiEndpoint entity → endpoint documentation tasks [P]
   - ApiResponse entity → response schema tasks [P]
   - CursorPagination entity → pagination standardization tasks [P]
   - DocumentationGap entity → gap analysis tasks [P]
3. **From Research**:
   - 6 controllers → 6 controller documentation tasks [P]
   - Cursor pagination inconsistencies → standardization tasks [P]
   - Missing response schemas → completion tasks [P]
4. **Ordering**:
   - Setup → Tests → Implementation → Standardization → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All 6 controllers have documentation tasks
- [ ] All pagination endpoints have standardization tasks
- [ ] All error response types have documentation tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent (different files)
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [ ] Backward compatibility maintained for all changes
- [ ] Performance requirements met (< 2s generation, < 1s UI load)

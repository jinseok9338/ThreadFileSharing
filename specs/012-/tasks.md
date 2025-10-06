# Tasks: API Scenario Test Improvements and Fixes

**Input**: Design documents from `/specs/012-/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Found: /specs/012-/plan.md
   → Extract: JavaScript/Node.js, Bruno API testing, Jest, existing test framework
2. Load optional design documents:
   → data-model.md: Extract test entities → test improvement tasks
   → contracts/: api-test-improvements.yaml → contract validation tasks
   → research.md: Extract test improvement decisions → setup tasks
3. Generate tasks by category:
   → Setup: backend validation, test environment preparation
   → Tests: scenario test improvements, contract validations
   → Core: test expectation updates, backend validation
   → Integration: test suite validation, docker rebuilds
   → Polish: test documentation, performance validation
4. Apply task rules:
   → Different test files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Backend validation before test updates
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All scenario tests have improvement tasks?
   → All contracts have validation tasks?
   → All test expectations updated?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Scenario Tests**: `tests/scenarios/api/` at repository root
- **Bruno Tests**: `tests/bruno/` at repository root
- **Backend**: `packages/backend/` (for docker rebuilds)
- **Test Reports**: `tests/reports/` at repository root

## Phase 3.1: Setup & Backend Validation

- [x] T001 Verify backend server is running and accessible at http://localhost:3001
- [x] T002 [P] Test file deletion API endpoint (DELETE /api/v1/files/{fileId}) to confirm implementation status
- [x] T003 [P] Test thread-file association APIs (GET/POST/DELETE /api/v1/threads/{id}/files) to confirm implementation status
- [x] T004 [P] Test user role management API (PUT /api/v1/users/{userId}/role) to confirm implementation status
- [x] T005 [P] Test company member management APIs (GET/POST /api/v1/companies/me/members) to confirm implementation status
- [x] T006 [P] Test storage quota management APIs (GET /api/v1/files/storage/quota) to confirm implementation status
- [x] T007 [P] Test file upload completion API (POST /api/v1/files/upload/complete) to confirm implementation status
- [x] T008 Create backup directory for original test files in tests/scenarios/api/backups/

## Phase 3.2: Test Analysis & Improvement Planning ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These analysis tasks MUST be completed before ANY test modifications**

- [x] T009 [P] Analyze thread-file-sharing-flow.test.js for incorrect expectations (expect 404 but should expect 200/201)
- [x] T010 [P] Analyze file-upload-auto-thread.test.js for incorrect expectations (expect 404 but should expect 200)
- [x] T011 [P] Analyze role-permission-flow.test.js for incorrect expectations (expect 404 but should expect 200)
- [x] T012 [P] Analyze storage-quota-flow.test.js for incorrect expectations (expect 404 but should expect 200)
- [x] T013 [P] Analyze multi-user-collaboration.test.js for incorrect expectations
- [x] T014 [P] Analyze error-recovery-flow.test.js for incorrect expectations
- [x] T015 [P] Analyze performance-load-flow.test.js for incorrect expectations
- [x] T016 [P] Analyze user-registration-flow.test.js for any incorrect expectations
- [x] T017 [P] Analyze company-setup-flow.test.js for any incorrect expectations
- [x] T018 [P] Analyze chatroom-messaging-flow.test.js for any incorrect expectations
- [x] T019 Document identified test improvements in tests/reports/test-improvements-needed.md

## Phase 3.3: High Priority Test Improvements (ONLY after analysis is complete)

- [x] T020 [P] Update thread-file-sharing-flow.test.js: Fix file deletion test expectations (404 → 200)
- [x] T021 [P] Update thread-file-sharing-flow.test.js: Fix thread-file association test expectations (404 → 201)
- [x] T022 [P] Update thread-file-sharing-flow.test.js: Fix thread file list retrieval expectations (404 → 200)
- [x] T023 [P] Update file-upload-auto-thread.test.js: Fix file upload completion expectations (404 → 200)
- [x] T024 [P] Update role-permission-flow.test.js: Fix user role update expectations (404 → 200)
- [x] T025 [P] Update storage-quota-flow.test.js: Fix storage quota retrieval expectations (404 → 200)
- [x] T026 [P] Update storage-quota-flow.test.js: Fix quota recalculation expectations (404 → 200)
- [x] T027 [P] Update company-setup-flow.test.js: Fix company member management expectations (404 → 200/201)
- [x] T028 [P] Update multi-user-collaboration.test.js: Fix collaboration feature expectations
- [x] T029 Run updated thread-file-sharing-flow.test.js to validate improvements
- [x] T030 Run updated file-upload-auto-thread.test.js to validate improvements
- [x] T031 Run updated role-permission-flow.test.js to validate improvements
- [x] T032 Run updated storage-quota-flow.test.js to validate improvements

## Phase 3.4: Medium Priority Test Improvements

- [x] T033 [P] Update error-recovery-flow.test.js: Fix error handling expectations based on actual backend behavior
- [x] T034 [P] Update performance-load-flow.test.js: Fix performance test expectations
- [x] T035 [P] Update user-registration-flow.test.js: Fix any incorrect registration expectations
- [x] T036 [P] Update chatroom-messaging-flow.test.js: Fix any incorrect messaging expectations
- [x] T037 [P] Update company-setup-flow.test.js: Fix any remaining company setup expectations
- [x] T038 [P] Update multi-user-collaboration.test.js: Fix any remaining collaboration expectations
- [x] T039 Run full scenario test suite to validate all improvements
- [x] T040 [P] Update Bruno API tests in tests/bruno/ to match corrected expectations

## Phase 3.5: Integration & Validation

- [x] T041 [P] Validate API contracts against actual backend responses in tests/bruno/
- [x] T042 [P] Update unimplemented-features.md to remove features that are actually implemented
- [x] T043 [P] Create test improvement report in tests/reports/test-improvements-completed.md
- [x] T044 Run complete test suite (scenarios + Bruno + unit tests) to ensure no regressions
- [x] T045 [P] Validate test execution performance hasn't degraded
- [x] T046 [P] Validate test coverage is maintained or improved
- [x] T047 [P] Update test documentation with new expectations
- [x] T048 [P] Create docker rebuild script for backend changes if needed
- [x] T049 [P] Test docker container rebuild process for backend updates

## Phase 3.6: Polish & Documentation

- [ ] T050 [P] Update quickstart.md with actual test improvement results
- [ ] T051 [P] Create test maintenance guide for future backend changes
- [ ] T052 [P] Document test expectation patterns for team reference
- [ ] T053 [P] Update CI/CD pipeline configuration if test changes require it
- [ ] T054 [P] Create test improvement checklist for future features
- [ ] T055 [P] Validate all test improvements follow TDD principles
- [ ] T056 [P] Create test reliability monitoring setup
- [ ] T057 [P] Update test helper documentation with new validation patterns
- [ ] T058 [P] Create test debugging guide for common issues
- [ ] T059 [P] Validate test data generation is still working correctly
- [ ] T060 [P] Create test performance baseline for future comparisons

## Dependencies

- Backend validation (T002-T007) before test analysis (T009-T018)
- Test analysis (T009-T018) before test improvements (T020-T032)
- High priority improvements (T020-T032) before medium priority (T033-T038)
- Test improvements before integration validation (T041-T049)
- Integration validation before polish (T050-T060)

## Parallel Example

```
# Launch T009-T018 together (test analysis):
Task: "Analyze thread-file-sharing-flow.test.js for incorrect expectations"
Task: "Analyze file-upload-auto-thread.test.js for incorrect expectations"
Task: "Analyze role-permission-flow.test.js for incorrect expectations"
Task: "Analyze storage-quota-flow.test.js for incorrect expectations"
Task: "Analyze multi-user-collaboration.test.js for incorrect expectations"
Task: "Analyze error-recovery-flow.test.js for incorrect expectations"
Task: "Analyze performance-load-flow.test.js for incorrect expectations"
Task: "Analyze user-registration-flow.test.js for any incorrect expectations"
Task: "Analyze company-setup-flow.test.js for any incorrect expectations"
Task: "Analyze chatroom-messaging-flow.test.js for any incorrect expectations"
```

## Docker Rebuild Considerations

**Important**: If backend changes are needed during test improvements:

- [ ] T061 [P] Create docker-compose down script for backend container
- [ ] T062 [P] Create docker-compose build script for backend container
- [ ] T063 [P] Create docker-compose up script for backend container
- [ ] T064 [P] Create backend health check script to verify container is ready
- [ ] T065 [P] Create test environment reset script for clean test runs

## Notes

- [P] tasks = different test files, no dependencies
- Verify backend implementation before updating test expectations
- Commit after each major test improvement phase
- Avoid: modifying same test file in parallel, breaking existing passing tests
- Focus: tests/scenarios/api/ directory improvements only
- Backend rebuilds: Only if backend changes are actually needed

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - api-test-improvements.yaml → contract validation tasks [P]
   - Each endpoint → backend validation task [P]
2. **From Data Model**:
   - TestScenario entities → test improvement tasks [P]
   - BackendBehavior entities → validation tasks [P]
3. **From Research**:
   - Test improvement decisions → analysis tasks [P]
   - Backend implementation status → validation tasks [P]
4. **From Quickstart**:

   - Test improvement scenarios → implementation tasks
   - Validation steps → validation tasks

5. **Ordering**:
   - Backend validation → Test analysis → Test improvements → Integration → Polish
   - Dependencies block parallel execution
   - Docker rebuilds only when backend changes are needed

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All scenario test files have analysis tasks
- [ ] All identified improvements have implementation tasks
- [ ] All contracts have validation tasks
- [ ] Backend validation comes before test improvements
- [ ] Parallel tasks truly independent (different files)
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [ ] Docker rebuild tasks included for backend changes
- [ ] Test improvement focus maintained throughout

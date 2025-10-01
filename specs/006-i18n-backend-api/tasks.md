# Tasks: Backend Internationalization (i18n) API

**Input**: Design documents from `/specs/006-i18n-backend-api/`
**Prerequisites**: Existing NestJS backend, auth system, Bruno testing setup

---

## Phase 0: Research & Setup

- [x] **T001** Research i18n backend solutions
  - **File**: `specs/006-i18n-backend-api/research.md`
  - **Status**: ✅ Complete
  - **Dependencies**: None

---

## Phase 1: Design Documents

- [x] **T002** Create i18n data model

  - **File**: `specs/006-i18n-backend-api/data-model.md`
  - **Status**: ✅ Complete
  - **Dependencies**: None

- [x] **T003** Define i18n API contracts

  - **File**: `specs/006-i18n-backend-api/contracts/i18n-api.ts`
  - **Status**: ✅ Complete
  - **Dependencies**: None

- [x] **T004** Create i18n quickstart guide
  - **File**: `specs/006-i18n-backend-api/quickstart.md`
  - **Status**: ✅ Complete
  - **Dependencies**: None

---

## Phase 2: Setup & Dependencies

- [ ] **T005** Install i18n backend dependencies

  - **File**: `packages/backend/package.json`
  - **Description**: Add i18next, i18next-fs-backend, joi for language validation
  - **Command**: `cd packages/backend && pnpm add i18next i18next-fs-backend joi`
  - **Dependencies**: None

- [ ] **T006** [P] Create language message files
  - **Files**:
    - `packages/backend/src/i18n/locales/en.json`
    - `packages/backend/src/i18n/locales/ko.json`
  - **Description**: Create JSON files with auth error messages in English and Korean
  - **Dependencies**: None

---

## Phase 3: Core Implementation

- [ ] **T007** [P] Create I18nService

  - **File**: `packages/backend/src/i18n/i18n.service.ts`
  - **Description**: Service for language detection, message translation, and interpolation
  - **Dependencies**: T005, T006

- [ ] **T008** [P] Create language detection middleware

  - **File**: `packages/backend/src/i18n/language-detection.middleware.ts`
  - **Description**: Middleware to detect language from X-Custom-Language header
  - **Dependencies**: T005

- [ ] **T009** [P] Create I18nModule

  - **File**: `packages/backend/src/i18n/i18n.module.ts`
  - **Description**: NestJS module for i18n functionality
  - **Dependencies**: T007, T008

- [ ] **T010** Create localized error response DTO
  - **File**: `packages/backend/src/i18n/dto/localized-error-response.dto.ts`
  - **Description**: DTO for localized error responses with language info
  - **Dependencies**: T005

---

## Phase 4: Integration with Existing Auth

- [ ] **T011** Update AuthService to use I18nService

  - **File**: `packages/backend/src/auth/auth.service.ts`
  - **Description**: Replace hardcoded English messages with localized messages
  - **Dependencies**: T007, T010

- [ ] **T012** Update AuthController to include language in responses

  - **File**: `packages/backend/src/auth/auth.controller.ts`
  - **Description**: Add language detection and localized error handling
  - **Dependencies**: T008, T010

- [ ] **T013** Update global exception filter for i18n
  - **File**: `packages/backend/src/common/filters/http-exception.filter.ts`
  - **Description**: Enhance exception filter to return localized error messages
  - **Dependencies**: T007, T010

---

## Phase 5: Testing

- [ ] **T014** [P] Bruno API test for Korean language detection

  - **File**: `tests/bruno/i18n/korean-language-test.bru`
  - **Description**: Test auth endpoints with X-Custom-Language: ko header
  - **Dependencies**: T011, T012

- [ ] **T015** [P] Bruno API test for English language detection

  - **File**: `tests/bruno/i18n/english-language-test.bru`
  - **Description**: Test auth endpoints with X-Custom-Language: en header
  - **Dependencies**: T011, T012

- [ ] **T016** [P] Bruno API test for fallback behavior

  - **File**: `tests/bruno/i18n/fallback-language-test.bru`
  - **Description**: Test auth endpoints without language header (defaults to English)
  - **Dependencies**: T011, T012

- [ ] **T017** [P] Backend unit tests for I18nService

  - **File**: `packages/backend/test/i18n/i18n.service.spec.ts`
  - **Description**: Test language detection, message translation, interpolation
  - **Dependencies**: T007

- [ ] **T018** [P] Backend unit tests for language detection middleware
  - **File**: `packages/backend/test/i18n/language-detection.middleware.spec.ts`
  - **Description**: Test middleware language detection logic
  - **Dependencies**: T008

---

## Phase 6: Frontend Integration

- [ ] **T019** Update frontend API client to send language header

  - **File**: `packages/frontend/app/api/ky.ts`
  - **Description**: Add X-Custom-Language header based on current i18n language
  - **Dependencies**: T011, T012

- [ ] **T020** Update frontend error handling for localized messages
  - **File**: `packages/frontend/app/utils/api.ts`
  - **Description**: Handle localized error messages from backend
  - **Dependencies**: T019

---

## Phase 7: Polish & Documentation

- [ ] **T021** [P] Add language info endpoint

  - **File**: `packages/backend/src/i18n/i18n.controller.ts`
  - **Description**: GET /api/v1/i18n/languages endpoint to return supported languages
  - **Dependencies**: T007, T009

- [ ] **T022** [P] Update API documentation with i18n examples

  - **File**: `packages/backend/docs/api-i18n.md`
  - **Description**: Document language detection, message formats, examples
  - **Dependencies**: T014, T015, T016

- [ ] **T023** [P] Add performance monitoring for language detection

  - **File**: `packages/backend/src/i18n/i18n.service.ts`
  - **Description**: Add metrics for language detection time and cache hits
  - **Dependencies**: T007

- [ ] **T024** [P] Create i18n configuration validation
  - **File**: `packages/backend/src/i18n/config/i18n.config.ts`
  - **Description**: Validate message files and supported languages at startup
  - **Dependencies**: T006, T007

---

## Progress Summary

**Completed**: T001-T004 (4/24 tasks)
**Remaining**: T005-T024 (20 tasks)

**Latest**:

- ✅ Design documents complete
- ✅ API contracts defined
- ✅ Quickstart guide created

**Next Task**: T005 - Install i18n backend dependencies

---

**TASKS STATUS**: Ready for execution - Continue with T005

## Dependencies

- T005 blocks T007, T008, T010
- T006 blocks T007
- T007 blocks T009, T011, T013
- T008 blocks T012, T013
- T010 blocks T011, T012, T013
- T011, T012 block T014, T015, T016
- T007 blocks T017
- T008 blocks T018
- T011, T012 block T019
- T019 blocks T020

## Parallel Example

```
# Launch T014-T018 together (after dependencies met):
Task: "Bruno API test for Korean language detection"
Task: "Bruno API test for English language detection"
Task: "Bruno API test for fallback behavior"
Task: "Backend unit tests for I18nService"
Task: "Backend unit tests for language detection middleware"
```

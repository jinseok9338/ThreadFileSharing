# Implementation Plan: Backend Internationalization (i18n) API

**Branch**: `006-i18n-backend-api` | **Date**: 2025-10-01 | **Spec**: [spec.md](./spec.md)

## Summary

Implement backend internationalization system that reads `X-Custom-Language` header and returns localized error messages in Korean or English. Includes language detection middleware, message translation service, and fallback handling for unsupported languages.

## Technical Context

**Language**: TypeScript 5.x + NestJS
**Dependencies**: NestJS, TypeORM, class-validator, i18next (backend), joi (validation)
**Storage**: JSON message files, in-memory cache
**Testing**: Jest, Bruno API tests
**Platform**: Node.js server
**Project Type**: backend (monorepo workspace)
**Performance**: <10ms language detection, <5ms message lookup
**Constraints**: Existing NestJS auth system, Korean/English only initially
**Scale/Scope**: 2 languages, ~50 error messages, all API endpoints

## Constitution Check

### Test-First Development

- [ ] Language detection middleware tests planned
- [ ] Message translation service tests planned
- [ ] API response localization tests planned

### Authentication-First Architecture

- [ ] Language detection works with existing JWT auth
- [ ] No impact on existing auth flow

### Shared Type System

- [ ] Language types defined in shared package
- [ ] API response types include localized messages

### File-Centric Design

- [ ] Language message files stored as JSON
- [ ] Message files version controlled

### Data Integrity

- [ ] Message validation with Zod schemas
- [ ] Language code validation

## Project Structure

### Documentation (this feature)

```
specs/006-i18n-backend-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (backend package)

```
packages/backend/
├── src/
│   ├── i18n/
│   │   ├── i18n.module.ts
│   │   ├── i18n.service.ts
│   │   ├── language-detection.middleware.ts
│   │   ├── dto/
│   │   └── locales/
│   │       ├── en.json
│   │       └── ko.json
│   ├── auth/
│   │   └── (existing files updated)
│   └── common/
│       └── (existing files updated)
└── test/
    ├── i18n/
    └── integration/
```

## Phase 0: Research & Decisions

- ✅ Language detection via X-Custom-Language header
- ✅ JSON-based message storage (simple, fast)
- ✅ i18next for backend message interpolation
- ✅ Middleware approach for automatic language detection
- ✅ Fallback to English for unsupported languages

## Phase 1: Design Artifacts

**Outputs**:

- contracts/i18n-api.ts (language detection, message response types)
- data-model.md (language entities, message structure)
- quickstart.md (localization setup guide)

## Ready for /tasks Command

All planning phases complete. Run `/tasks` to generate implementation tasks.

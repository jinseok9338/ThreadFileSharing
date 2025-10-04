# Implementation Plan: 대용량 처리 및 코어 비지니스 로직 완성

**Branch**: `010-chatroom-chat-thread` | **Date**: 2025-10-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-chatroom-chat-thread/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

This feature completes the backend core business logic for chatroom management, real-time messaging, thread organization, and large file processing (>4GB). The implementation prioritizes large file handling with streaming uploads, real-time WebSocket communication, and comprehensive backend services. The backend will support concurrent users, file sharing, and thread-based organization with proper authentication and authorization. Frontend implementation is excluded from this specification.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+  
**Primary Dependencies**: NestJS, Socket.io, TypeORM, PostgreSQL, Redis  
**Storage**: PostgreSQL (primary), Redis (sessions/cache), MinIO/S3 (files)  
**Testing**: Jest + NestJS Testing utilities, Bruno API tests  
**Target Platform**: Backend API server (Linux server deployment)  
**Project Type**: backend (NestJS backend with internal entities and DTOs)  
**Performance Goals**: <100ms API response, <200ms WebSocket delivery, 1000+ concurrent users per chatroom  
**Constraints**: 4GB+ file streaming, real-time WebSocket, secure file access, <500ms p95 API response  
**Scale/Scope**: Multi-tenant chatrooms, 10GB+ file uploads, 1000+ messages per thread, REST API endpoints

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Test-First Development**:

- [x] Feature spec includes testable acceptance criteria (30 functional requirements defined)
- [x] Bruno API tests planned for all endpoints (chatroom, messaging, thread, file APIs)
- [x] Test strategy defined for backend (Jest + NestJS)
- [x] Integration test plan for NestJS API and WebSocket communication
- [x] Backend unit test plan for services and business logic

**Authentication-First Architecture**:

- [x] User roles and permissions defined (creator, member, read-only)
- [x] JWT authentication strategy planned (existing system)
- [x] NestJS Guards and authorization planned (role-based access)
- [x] Secure password handling considered (bcrypt, existing implementation)

**Real-Time Communication**:

- [x] WebSocket events and handlers identified (chat, file upload, presence)
- [x] Socket.io integration planned for backend gateway
- [x] Connection management and reconnection strategy defined
- [x] Real-time features properly scoped (chat, notifications, presence, typing)

**Backend Type System**:

- [x] TypeORM entities defined within backend package
- [x] DTOs and validation classes in backend modules
- [x] Socket.io event interfaces in backend services
- [x] class-validator for DTO validation
- [x] TypeORM entities with proper relationships and constraints

**File-Centric Design**:

- [x] File upload and storage strategy defined (MinIO/S3 with streaming)
- [x] Thread-file association model planned
- [x] File access control and permissions considered
- [x] File type validation and security measures identified

**Data Integrity**:

- [x] Database entities and relationships identified (Chatroom, Message, Thread, FileUploadSession)
- [x] TypeORM migration strategy planned
- [x] Transaction boundaries considered
- [x] Business rule constraints defined

**Screen-First Design**:

- [x] Frontend implementation excluded from this specification
- [x] API-first design approach with comprehensive OpenAPI specs
- [x] Backend services designed for future frontend integration
- [x] WebSocket events structured for frontend consumption
- [x] REST API endpoints fully documented

**Containerization & Deployment**:

- [x] Standalone backend project structure (no workspace)
- [x] Docker strategy defined for backend
- [x] Docker Compose plan for local development (NestJS, PostgreSQL, Redis, MinIO)
- [x] Dokploy deployment considerations documented

## Project Structure

### Documentation (this feature)

```
specs/010-chatroom-chat-thread/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
docs/
├── business/
│   ├── chatroom-management.md
│   ├── messaging-system.md
│   ├── thread-organization.md
│   ├── large-file-processing.md
│   ├── real-time-communication.md
│   └── file-sharing-security.md

src/
├── chatroom/
│   ├── entities/
│   │   ├── chatroom.entity.ts
│   │   └── chatroom-member.entity.ts
│   ├── dto/
│   │   ├── create-chatroom.dto.ts
│   │   ├── update-chatroom.dto.ts
│   │   └── chatroom-response.dto.ts
│   ├── services/
│   │   └── chatroom.service.ts
│   ├── controllers/
│   │   └── chatroom.controller.ts
│   └── chatroom.module.ts
├── message/
│   ├── entities/
│   │   ├── message.entity.ts
│   │   └── message-reaction.entity.ts
│   ├── dto/
│   │   ├── send-message.dto.ts
│   │   ├── edit-message.dto.ts
│   │   └── message-response.dto.ts
│   ├── services/
│   │   └── message.service.ts
│   ├── controllers/
│   │   └── message.controller.ts
│   └── message.module.ts
├── thread/
│   ├── entities/
│   │   ├── thread.entity.ts
│   │   └── thread-member.entity.ts
│   ├── dto/
│   │   ├── create-thread.dto.ts
│   │   ├── update-thread.dto.ts
│   │   └── thread-response.dto.ts
│   ├── services/
│   │   └── thread.service.ts
│   ├── controllers/
│   │   └── thread.controller.ts
│   └── thread.module.ts
├── websocket/
│   ├── gateways/
│   │   └── chatroom.gateway.ts
│   ├── services/
│   │   └── websocket-room.service.ts
│   └── websocket.module.ts
├── file/
│   ├── entities/
│   │   └── file-upload-session.entity.ts
│   ├── dto/
│   │   ├── initiate-upload.dto.ts
│   │   ├── upload-chunk.dto.ts
│   │   └── upload-session-response.dto.ts
│   ├── services/
│   │   ├── chunked-upload.service.ts
│   │   ├── upload-progress.service.ts
│   │   └── streaming-upload.service.ts
│   ├── controllers/
│   │   └── file-upload.controller.ts
│   └── file.module.ts
├── common/
│   ├── enums/
│   │   ├── chatroom-type.enum.ts
│   │   ├── message-type.enum.ts
│   │   ├── thread-status.enum.ts
│   │   └── upload-status.enum.ts
│   └── interfaces/
│       ├── websocket-events.interface.ts
│       └── file-metadata.interface.ts
├── app.module.ts
├── main.ts
└── ...

test/
├── unit/
├── integration/
└── e2e/

docker-compose.yml
Dockerfile
package.json
tsconfig.json
nest-cli.json
.gitignore
README.md

tests/
└── bruno/
    ├── chatroom/
    ├── message/
    ├── thread/
    └── file-upload/
```

**Structure Decision**: Standalone NestJS backend project (no workspace). All entities, DTOs, enums, and interfaces are defined within the src directory. Each module contains its own entities and DTOs with proper TypeORM relationships and class-validator validation. Common enums and interfaces are centralized in the common directory for reuse across modules.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:

   - For each user action → endpoint
   - Use standard REST patterns
   - Output OpenAPI schema to `/contracts/`
   - DTOs defined in backend modules, not shared package

3. **Generate contract tests** from contracts:

   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Document business logic** in `docs/business/`:

   - Extract domain rules from feature requirements
   - Document user flows and business constraints
   - Create reference for implementation teams

6. **Document API design patterns** in `docs/api/`:

   - Create comprehensive API documentation
   - Document WebSocket event patterns
   - Plan error handling and response formats
   - Design authentication and authorization flows

7. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, docs/business/\*, docs/api/\*, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Backend implementation tasks to make tests pass
- **Priority Focus**: Large file processing tasks first (user requirement)
- **Scope**: Backend-only implementation (no frontend tasks)
- **Architecture**: Standalone NestJS project with internal entities and DTOs (no workspace, no shared package)

**Ordering Strategy**:

- TDD order: Tests before implementation
- **Large file processing tasks prioritized** (chunked upload, streaming, progress tracking)
- Dependency order: Models before services before controllers
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered backend tasks in tasks.md with large file processing tasks at the top. All tasks will use NestJS internal entities and DTOs within the standalone backend project.

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v1.2.0 - See `.specify/memory/constitution.md`_

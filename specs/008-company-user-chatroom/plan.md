# Implementation Plan: Company User Chatroom Data Structure

**Branch**: `008-company-user-chatroom` | **Date**: 2024-12-19 | **Spec**: `/specs/008-company-user-chatroom/spec.md`
**Input**: Feature specification from `/specs/008-company-user-chatroom/spec.md`

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

Define comprehensive data structure and permission system for Company → User → ChatRoom → Thread → File hierarchy with role-based access control. Focus on detailed documentation and entity relationship diagrams for proper authorization implementation across all levels.

## Technical Context

**Language/Version**: TypeScript 5.0+ with strict mode  
**Primary Dependencies**: NestJS + TypeORM, React 18+, Socket.io, MinIO (S3-compatible)  
**Storage**: PostgreSQL (primary), MinIO/S3 (files), Redis (sessions)  
**Testing**: Jest + NestJS Testing, Bruno API tests, React Testing Library  
**Target Platform**: Web application (Linux server deployment)  
**Project Type**: Workspace application (NestJS + React + Shared Types)  
**Performance Goals**: <200ms API response time, real-time messaging <100ms latency  
**Constraints**: 50GB storage limit per company, unlimited concurrent users, MVP focus on structure  
**Scale/Scope**: Multi-tenant SaaS with hierarchical permissions, file-centric thread creation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Test-First Development**:

- [x] Feature spec includes testable acceptance criteria (16 functional requirements)
- [x] Bruno API tests planned for all endpoints (auth, chat, threads, files)
- [x] Test strategy defined for backend (Jest + NestJS) and frontend (Jest + RTL)
- [x] Integration test plan for React-NestJS API and WebSocket communication
- [x] E2E test plan for real-time chat and file upload flows

**Authentication-First Architecture**:

- [x] User roles and permissions defined (Company: Owner/Admin/Member, Thread: Owner/Member/Viewer)
- [x] JWT authentication strategy planned (existing implementation)
- [x] NestJS Guards and authorization planned (existing RoleGuard)
- [x] Secure password handling considered (existing bcrypt implementation)

**Real-Time Communication**:

- [x] WebSocket events and handlers identified (chat messages, typing indicators, file uploads)
- [x] Socket.io integration planned for frontend and backend
- [x] Connection management and reconnection strategy defined
- [x] Real-time features properly scoped (chat, notifications, presence)

**Type System**:

- [x] Backend type definitions planned (packages/backend/src/types/)
- [x] Frontend type definitions planned (packages/frontend/app/types/)
- [x] API contract types defined in both backend and frontend
- [x] Socket.io event interfaces defined in backend
- [x] Zod schemas planned for validation and type generation
- [x] TypeORM entity types defined in backend

**File-Centric Design**:

- [x] File upload and storage strategy defined (MinIO/S3, 50GB company limit)
- [x] Thread-file association model planned
- [x] File access control and permissions considered (thread-level access)
- [x] File type validation and security measures identified

**Data Integrity**:

- [x] Database entities and relationships identified (Company → User → ChatRoom → Thread → File)
- [x] TypeORM migration strategy planned
- [x] Transaction boundaries considered
- [x] Business rule constraints defined

**Screen-First Design**:

- [x] User interface wireframes planned for all screens (existing chat UI)
- [x] shadcn/ui component specifications documented
- [x] User flows and navigation paths mapped
- [x] Responsive design strategy defined (desktop-focused)
- [x] Accessibility requirements considered

**Containerization & Deployment**:

- [x] Workspace structure defined (packages/shared, packages/backend, packages/frontend)
- [x] Docker strategy defined for all packages
- [x] Docker Compose plan for local development (NestJS, React, PostgreSQL, Redis)
- [x] Dokploy deployment considerations documented

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
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
│   ├── user-management.md
│   ├── thread-management.md
│   ├── file-sharing.md
│   ├── chat-system.md
│   ├── permissions.md
│   └── business-rules.md
└── screens/
    ├── wireframes/
    │   ├── main-layout.md
    │   ├── chat-interface.md
    │   └── thread-detail.md
    ├── components/
    │   └── shadcn-components.md
    └── user-flows/
        └── main-user-flows.md

packages/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── chat/
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── services/
│   │   │   └── controllers/
│   │   ├── threads/
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── services/
│   │   │   └── controllers/
│   │   ├── files/
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── services/
│   │   │   └── controllers/
│   │   └── users/
│   ├── test/
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── app/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── services/
    │   └── utils/
    ├── __tests__/
    ├── Dockerfile
    └── package.json

tests/
└── bruno/
    ├── auth/
    ├── chat/
    ├── threads/
    └── files/
```

**Structure Decision**: Separate backend and frontend applications. Existing structure already established with packages/backend and packages/frontend. Type definitions will be duplicated between backend and frontend as needed.

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
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

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

6. **Design screen wireframes** in `docs/screens/`:

   - Create wireframes for all user interfaces
   - Specify shadcn/ui component usage
   - Document user flows and navigation paths
   - Plan responsive design for mobile/desktop

7. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, docs/business/\*, docs/screens/\*, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Specific Task Categories**:

1. **Type Definitions Setup** (T001-T009):

   - Backend type definitions for all entities
   - Frontend type definitions
   - Permission constants and enums
   - Zod schemas for validation
   - API contract types
   - Socket.io event interfaces

2. **Database Models** (T010-T019):

   - Company entity with storage quotas
   - User entity with company roles
   - ChatRoom entity with membership
   - Thread entity with file association
   - File entity with metadata
   - ThreadParticipant junction entity
   - Database migrations

3. **API Contract Tests** (T027-T038):

   - ChatRoom API contract tests
   - Thread API contract tests
   - File API contract tests
   - Permission validation tests
   - Error handling tests
   - Storage quota tests

4. **Backend Services** (T039-T047):

   - ChatRoom service with permission checks
   - Thread service with participant management
   - File service with storage integration
   - Permission service with role hierarchy
   - Storage quota service
   - Real-time event handlers
   - API controllers with guards
   - Business logic validation

5. **Integration Tests** (T048-T053):

   - Complete user workflows
   - Permission matrix validation
   - Real-time updates
   - Storage quota enforcement

6. **Documentation** (T065-T075):
   - Business rules documentation
   - Permission matrix updates
   - Entity relationship diagrams

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

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

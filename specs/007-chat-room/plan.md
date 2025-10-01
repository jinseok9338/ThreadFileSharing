# Implementation Plan: Chat Room Layout

**Branch**: `007-chat-room` | **Date**: 2025-10-01 | **Spec**: [link]
**Input**: Feature specification from `/specs/007-chat-room/spec.md`

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

Create a Teams-like three-column chat interface layout with left navigation (채팅, 세팅), middle chat room list, and right chat room content area. Focus on UI implementation with real-time messaging, file upload support, and theme switching capabilities.

## Technical Context

**Language/Version**: TypeScript 5.0+, React 19, NestJS 10  
**Primary Dependencies**: React Router 7, Socket.io, Tailwind CSS 4, shadcn/ui  
**Storage**: PostgreSQL for chat data, file storage for uploads  
**Testing**: Jest + React Testing Library (frontend), Jest + NestJS Testing (backend)  
**Target Platform**: Desktop web application (no mobile support)  
**Project Type**: web (frontend + backend workspace)  
**Performance Goals**: Real-time messaging <100ms latency, file upload progress indication  
**Constraints**: Desktop-only interface, Teams-like layout requirements  
**Scale/Scope**: Multiple chat rooms, real-time messaging, file uploads with thread creation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Test-First Development**:

- [x] Feature spec includes testable acceptance criteria
- [x] Bruno API tests planned for all endpoints
- [x] Test strategy defined for backend (Jest + NestJS) and frontend (Jest + RTL)
- [x] Integration test plan for React-NestJS API and WebSocket communication
- [x] E2E test plan for real-time chat and file upload flows

**Authentication-First Architecture**:

- [x] User roles and permissions defined (creator, member, read-only)
- [x] JWT authentication strategy planned
- [x] NestJS Guards and authorization planned
- [x] Secure password handling considered

**Real-Time Communication**:

- [x] WebSocket events and handlers identified
- [x] Socket.io integration planned for frontend and backend
- [x] Connection management and reconnection strategy defined
- [x] Real-time features properly scoped (chat, notifications, presence)

**Shared Type System**:

- [x] Shared types package structure planned
- [x] API contract types defined in shared package
- [x] Socket.io event interfaces centralized
- [x] Zod schemas planned for validation and type generation
- [x] TypeORM entity types exported to shared package

**File-Centric Design**:

- [x] File upload and storage strategy defined
- [x] Thread-file association model planned
- [x] File access control and permissions considered
- [x] File type validation and security measures identified

**Data Integrity**:

- [x] Database entities and relationships identified
- [x] TypeORM migration strategy planned
- [x] Transaction boundaries considered
- [x] Business rule constraints defined

**Screen-First Design**:

- [x] User interface wireframes planned for all screens
- [x] shadcn/ui component specifications documented
- [x] User flows and navigation paths mapped
- [x] Responsive design strategy defined (mobile/desktop)
- [x] Accessibility requirements considered

**Containerization & Deployment**:

- [x] Workspace structure defined (packages/shared, packages/backend, packages/frontend)
- [x] Docker strategy defined for all packages
- [x] Docker Compose plan for local development (NestJS, React, PostgreSQL, Redis)
- [x] Dokploy deployment considerations documented

## Project Structure

### Documentation (this feature)

```
specs/007-chat-room/
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
├── shared/
│   ├── src/
│   │   ├── types/
│   │   ├── schemas/
│   │   └── constants/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── threads/
│   │   ├── files/
│   │   └── users/
│   ├── test/
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── src/
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

**Structure Decision**: Workspace application with NestJS + React + Shared Types structure. This supports the constitutional requirements for shared types, containerization, and test-first development.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - Socket.io integration patterns for real-time chat
   - shadcn/ui component selection for three-column layout
   - File upload progress indication best practices
   - Theme switching implementation patterns
   - Virtual scrolling for chat room lists

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

**Output**: data-model.md, /contracts/_, failing tests, quickstart.md, docs/business/_, docs/screens/\*, agent-specific file

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

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No violations identified - all constitutional requirements are met_

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v1.2.0 - See `.specify/memory/constitution.md`_

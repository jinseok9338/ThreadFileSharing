# Implementation Plan: 웹소켓 단위 테스트 보완 및 개선

**Branch**: `013-websocket-unit-test-improvements` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-websocket-unit-test-improvements/spec.md`

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

기존 `tests/websocket_test` 디렉토리의 웹소켓 테스트들을 현재 백엔드 구현 상태에 맞게 보완하고 개선하여, 모든 웹소켓 기능(채팅방 메시지, 스레드 메시지, 파일 업로드, 사용자 상태 관리, 룸 조인/나가기 등)을 동등하게 테스트하고, 동적 토큰 생성을 통한 인증 처리와 연결+데이터+비즈니스 로직 수준의 검증을 수행하는 테스트 환경을 구축합니다.

## Technical Context

**Language/Version**: Node.js 18+ with Socket.io-client 4.8+  
**Primary Dependencies**: socket.io-client, axios, form-data, jsonwebtoken  
**Storage**: N/A (테스트는 기존 백엔드와 통신)  
**Testing**: Node.js 스크립트 기반 통합 테스트 (Jest 프레임워크 없이 구조화)  
**Target Platform**: Local development environment (Docker Compose)  
**Project Type**: web (백엔드 + 프론트엔드 워크스페이스)  
**Performance Goals**: 웹소켓 연결 시간 < 2초, 메시지 전송 응답 < 500ms  
**Constraints**: 기존 테스트 파일 구조 유지, 하드코딩된 토큰 제거, 동적 인증 구현  
**Scale/Scope**: 7개 기존 테스트 파일 개선, 모든 웹소켓 기능 커버리지

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

- [ ] User interface wireframes planned for all screens (N/A - 테스트 개선)
- [ ] shadcn/ui component specifications documented (N/A - 테스트 개선)
- [ ] User flows and navigation paths mapped (N/A - 테스트 개선)
- [ ] Responsive design strategy defined (N/A - 테스트 개선)
- [ ] Accessibility requirements considered (N/A - 테스트 개선)

**Containerization & Deployment**:

- [x] Workspace structure defined (packages/shared, packages/backend, packages/frontend)
- [x] Docker strategy defined for all packages
- [x] Docker Compose plan for local development (NestJS, React, PostgreSQL, Redis)
- [x] Dokploy deployment considerations documented

## Project Structure

### Documentation (this feature)

```
specs/013-websocket-unit-test-improvements/
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
├── websocket_test/          # 기존 웹소켓 테스트 디렉토리
│   ├── test-file-upload-websocket.js
│   ├── test-websocket-auth.js
│   ├── test-websocket-events-detailed.js
│   ├── test-websocket-events.js
│   ├── test-websocket-simple.js
│   ├── test-websocket-with-new-chatroom.js
│   ├── test-storage-fix.js
│   ├── package.json
│   └── README.md
└── bruno/
    ├── auth/
    ├── chat/
    ├── threads/
    └── files/
```

**Structure Decision**: 웹 애플리케이션 워크스페이스 구조를 사용하며, 기존 `tests/websocket_test` 디렉토리를 개선하여 현재 백엔드 구현과 일치하도록 보완

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - 기존 웹소켓 테스트 파일들의 현재 상태 분석
   - 백엔드 WebSocket Gateway 구현과의 차이점 식별
   - 동적 토큰 생성 구현 방법 연구
   - 비즈니스 로직 검증 방법 정의

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

   - WebSocket Connection, WebSocket Message, WebSocket Test Suite, Connection State 엔티티 정의
   - 테스트 실행 환경과 인증 토큰 관리 모델
   - 테스트 결과 및 성능 메트릭 모델

2. **Generate API contracts** from functional requirements:

   - 동적 토큰 생성을 위한 인증 API 엔드포인트
   - 웹소켓 연결 및 이벤트 처리 계약
   - 테스트 결과 검증 계약

3. **Generate contract tests** from contracts:

   - 동적 토큰 생성 테스트
   - 웹소켓 연결 테스트
   - 이벤트 송수신 테스트

4. **Extract test scenarios** from user stories:

   - 각 웹소켓 기능별 테스트 시나리오
   - 통합 테스트 시나리오

5. **Document business logic** in `docs/business/`:

   - 웹소켓 인증 및 권한 관리 규칙
   - 실시간 메시지 전송 및 브로드캐스팅 규칙
   - 연결 관리 및 재연결 규칙

6. **Design screen wireframes** in `docs/screens/`:

   - N/A (테스트 개선 프로젝트)

7. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, docs/business/\*, agent-specific file

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

_No constitution violations detected - all principles properly addressed for test improvement scope_

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
- [x] Complexity deviations documented

---

_Based on Constitution v1.2.0 - See `.specify/memory/constitution.md`_

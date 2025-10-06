# Implementation Plan: 백엔드 API 문서 개선 및 Swagger 응답 스키마 보완

**Branch**: `016-api-swagger-cursor` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/jinseokseo/Desktop/Development/ThreadFileSharing/specs/016-api-swagger-cursor/spec.md`

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

백엔드 API 문서의 완전성을 향상시키고 Swagger 응답 스키마를 보완하여 개발자 경험을 개선합니다. 모든 컨트롤러의 엔드포인트에 대해 완전한 문서화를 수행하고, cursor pagination 파라미터를 `lastIndex`로 통일하여 일관성을 확보합니다.

## Technical Context

**Language/Version**: TypeScript 5.x, NestJS 10.x  
**Primary Dependencies**: @nestjs/swagger, class-validator, class-transformer  
**Storage**: PostgreSQL with TypeORM  
**Testing**: Jest, Bruno API testing  
**Target Platform**: Node.js server with Docker containerization  
**Project Type**: web (monorepo with backend and frontend)  
**Performance Goals**: API documentation generation < 2s, Swagger UI load time < 1s  
**Constraints**: Must maintain backward compatibility, no breaking changes to existing API contracts  
**Scale/Scope**: 6 controllers, ~50 endpoints, complete response schema documentation

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
- [x] Component specifications documented
- [x] User flows mapped with navigation paths
- [x] Responsive design planned for mobile and desktop
- [x] shadcn/ui components specified for consistency
- [x] Accessibility requirements documented

**Containerization & Deployment**:

- [x] Production-ready Dockerfiles planned
- [x] Docker Compose for local development
- [x] All dependencies containerized
- [x] Dokploy deployment strategy defined

## Project Structure

**Monorepo Structure**:

```
packages/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication controllers
│   │   ├── chatroom/       # Chatroom controllers
│   │   ├── company/        # Company controllers
│   │   ├── file/           # File management controllers
│   │   ├── message/        # Message controllers
│   │   ├── thread/         # Thread controllers
│   │   └── websocket/      # WebSocket gateway
│   └── swagger/            # API documentation
├── frontend/               # React application
└── shared/                 # Shared types and utilities
```

**Documentation Structure**:

```
docs/
├── api/                    # API documentation
│   ├── swagger/           # Swagger specifications
│   └── examples/          # API usage examples
└── screens/               # UI wireframes
```

## Complexity Tracking

**Constitutional Compliance**: ✅ All principles satisfied
**Technical Complexity**: Medium - Requires systematic review of all controllers
**Implementation Risk**: Low - Documentation improvements, no breaking changes
**Testing Complexity**: Medium - Requires validation of all endpoints

## Progress Tracking

- [x] Initial Constitution Check
- [x] Phase 0: Research & Analysis
- [x] Phase 1: Design & Contracts
- [x] Post-Design Constitution Check
- [x] Phase 2: Task Planning

---

## Phase 0: Research & Analysis

### Current State Analysis

**Controllers to Review**:

1. **AuthController** (`/api/v1/auth/*`)
2. **ChatroomController** (`/api/v1/chatrooms/*`)
3. **CompanyController** (`/api/v1/companies/*`)
4. **FileController** (`/api/v1/files/*`)
5. **MessageController** (`/api/v1/messages/*`)
6. **ThreadController** (`/api/v1/threads/*`)

**Cursor Pagination Endpoints**:

- `/api/v1/messages/chatroom/{chatroomId}` - Uses `lastIndex`
- `/api/v1/files` - Potential pagination
- `/api/v1/threads` - Potential pagination

**Documentation Gaps Identified**:

- Missing response schemas in many endpoints
- Inconsistent parameter naming (`cursor` vs `lastIndex`)
- Incomplete error response documentation
- Missing examples for complex endpoints

### Research Findings

**Swagger Configuration**: Uses `@nestjs/swagger` with decorators
**Response Wrapping**: Custom response interceptor wraps all responses
**Error Handling**: Global exception filter with standardized error format
**Pagination**: Cursor-based pagination with Base64 encoded JSON cursors

---

## Phase 1: Design & Contracts

### API Documentation Standards

**Response Schema Requirements**:

- All endpoints MUST have complete `@ApiResponse` decorators
- Response DTOs MUST be properly documented with `@ApiProperty`
- Error responses MUST include status codes and message formats
- Pagination responses MUST include `nextCursor` and `hasMore` fields

**Parameter Documentation**:

- All query parameters MUST use `@ApiQuery` decorators
- Path parameters MUST use `@ApiParam` decorators
- Request bodies MUST use `@ApiBody` with proper DTOs

**Cursor Pagination Standard**:

- Input parameter: `lastIndex` (Base64 encoded JSON)
- Response field: `nextCursor` (Base64 encoded JSON)
- Remove all `cursor` parameter references from documentation

### Data Model

**API Endpoint Entity**:

- `path`: string (endpoint path)
- `method`: string (HTTP method)
- `parameters`: Parameter[] (query, path, body parameters)
- `responses`: Response[] (success and error responses)
- `examples`: Example[] (request/response examples)

**Response Schema Entity**:

- `statusCode`: number (HTTP status code)
- `description`: string (response description)
- `schema`: object (response data structure)
- `examples`: object[] (example responses)

**Pagination Parameter Entity**:

- `name`: string (parameter name - 'lastIndex')
- `type`: string (parameter type - 'string')
- `description`: string (usage description)
- `example`: string (example value)

### Contracts

**Swagger Documentation Contract**:

- All endpoints MUST have complete OpenAPI 3.0 documentation
- Response schemas MUST match actual API responses
- Error responses MUST be documented with proper status codes
- Examples MUST be provided for all documented endpoints

**Cursor Pagination Contract**:

- Input: `lastIndex` parameter (Base64 encoded JSON)
- Output: `nextCursor` field in response (Base64 encoded JSON)
- Format: `{"createdAt": "ISO string", "id": "UUID"}`

---

## Phase 2: Task Planning Approach

### Task Generation Strategy

**Phase 2.1: Controller Analysis**

- Analyze all 6 controllers systematically
- Identify missing response schemas
- Document cursor pagination inconsistencies
- Create comprehensive gap analysis

**Phase 2.2: Documentation Implementation**

- Implement missing `@ApiResponse` decorators
- Add complete response DTO documentation
- Standardize error response documentation
- Remove inconsistent `cursor` parameter references

**Phase 2.3: Validation & Testing**

- Validate all endpoints against documented schemas
- Test cursor pagination functionality
- Verify error response formats
- Ensure Swagger UI displays correctly

**Phase 2.4: Quality Assurance**

- Review all documentation for completeness
- Test API examples in Swagger UI
- Validate backward compatibility
- Generate final documentation report

### Parallel Execution Opportunities

- Controller analysis can be done in parallel
- Response schema documentation can be implemented concurrently
- Error response standardization can be done independently
- Validation testing can run in parallel with implementation

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
- [x] Technical context filled
- [x] Constitution check completed
- [x] Phase 0 research completed
- [x] Phase 1 design completed
- [x] Post-design constitution check passed
- [x] Phase 2 task planning approach defined

---

**Ready for /tasks command to generate detailed implementation tasks.**

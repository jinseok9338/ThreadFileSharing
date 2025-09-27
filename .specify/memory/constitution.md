<!--
Sync Impact Report:
Version: 1.0.0 → 1.2.0 (Stack change, Bruno testing, and shared types)
Modified principles:
- Test-First Development: Updated for NestJS + Jest + Bruno API testing
- Full-Stack Type Safety: Enhanced with shared types workspace
- Data Integrity: Changed from JPA to TypeORM
- Deployment Readiness: Updated for NestJS containers
Added principles:
- Authentication-First Architecture (new)
- Real-Time Communication (new)
- File-Centric Design (new)
- Shared Type System (new)
Removed sections: None
Templates requiring updates:
- ✅ plan-template.md: Updated with workspace structure and Bruno testing
- ✅ tasks-template.md: Updated with shared types setup and Bruno test tasks
Follow-up TODOs: None
-->

# ThreadFileSharing Constitution

<!-- File-Centric Chat with Threads - NestJS + React Stack -->

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

Every feature MUST begin with failing tests before any implementation. API tests use Bruno for REST endpoint validation. Backend unit tests use Jest with NestJS Testing utilities. Frontend tests use Jest and React Testing Library. Integration tests MUST verify React-NestJS API communication and WebSocket connections. Database tests MUST use TypeORM with in-memory SQLite. E2E tests MUST cover real-time chat and file upload flows. Red-Green-Refactor cycle: Bruno API tests → Unit tests → Implementation → Integration tests.

**Rationale**: Bruno ensures API contract compliance from start. Prevents regression bugs, ensures testable design, validates real-time features, and confirms file upload security before implementation investment.

### II. Authentication-First Architecture

Every feature MUST implement authentication and authorization from the start. NestJS Guards MUST protect all endpoints. JWT tokens MUST be used for stateless authentication. Role-based permissions MUST distinguish between thread creators, invited members, and read-only users. Password hashing MUST use bcrypt. Session management MUST be secure with proper token expiration.

**Rationale**: Chat applications require robust user management and file access control. Building auth later creates security vulnerabilities and architectural debt.

### III. Real-Time Communication

All chat features MUST use WebSocket connections via Socket.io. Event-driven architecture MUST handle real-time messaging, file uploads, and thread notifications. Connection state MUST be managed with automatic reconnection. Message delivery MUST be confirmed with acknowledgments. Typing indicators and presence status MUST be implemented for better UX.

**Rationale**: Chat applications require instant communication. HTTP polling creates poor user experience and excessive server load.

### IV. Shared Type System

All types MUST be centralized in a shared workspace package. Frontend and backend MUST import types from `@threadsharing/shared`. API request/response schemas MUST be defined once and reused. No duplicate type definitions between packages. Socket.io events MUST have typed interfaces from shared package. Database entities MUST generate shared types for frontend consumption. Zod schemas MUST provide runtime validation and type generation.

**Rationale**: Eliminates type drift between frontend and backend. Ensures API contract compliance, reduces maintenance burden, and provides single source of truth for all data structures.

### V. File-Centric Design

Every file upload MUST trigger thread creation prompts. File access MUST be controlled by thread permissions. File storage MUST be secure with signed URLs for access. File metadata MUST be stored in database with proper relationships. Thread-file associations MUST be maintained with referential integrity. File types MUST be validated and restricted for security.

**Rationale**: The core value proposition is file-based thread creation. File security and proper associations are critical for user trust and data integrity.

### VI. Data Integrity

All database entities MUST use TypeORM decorators with proper relationships. Database schema changes MUST use TypeORM migrations. Transaction boundaries MUST be explicitly defined with @Transactional. No direct SQL in business logic - use TypeORM repositories and query builders. Database constraints MUST enforce business rules.

**Rationale**: Ensures data consistency, enables database version control, maintains clean separation between data access and business logic.

### VII. Containerization & Deployment

All services MUST have production-ready Dockerfiles. Local development MUST use Docker Compose for service orchestration. All dependencies MUST be containerized including PostgreSQL and Redis. Docker images MUST be optimized for Dokploy deployment with proper health checks and environment configuration.

**Rationale**: Ensures consistent environments across development, testing, and production while enabling reliable Dokploy deployments.

### VIII. Screen-First Design

All user interfaces MUST be designed before implementation. Screen wireframes MUST be documented in `docs/screens/` with component specifications. User flows MUST be mapped with clear navigation paths. Responsive design MUST be planned for mobile and desktop. shadcn/ui components MUST be specified for consistency. Accessibility requirements MUST be documented for each screen.

**Rationale**: Prevents UI inconsistencies and reduces development time. Clear screen specifications enable parallel frontend/backend development and ensure better user experience.

## Technology Stack Standards

**Shared Package Requirements:**

- TypeScript with strict mode for all type definitions
- Zod for schema validation and type generation
- Shared constants and enums
- API contract types and Socket.io event interfaces
- Build tooling for package distribution

**Backend Requirements:**

- NestJS with Fastify adapter and TypeScript
- TypeORM for data persistence with PostgreSQL
- Socket.io for real-time WebSocket communication
- Passport.js with JWT strategy for authentication
- Jest with NestJS Testing utilities for unit/integration tests
- Multer for file upload handling
- bcrypt for password hashing
- Import types from `@threadsharing/shared`

**Frontend Requirements:**

- React 18+ with TypeScript and strict mode
- React Router for client-side routing
- Tailwind CSS 4 for styling and responsive design
- shadcn/ui for consistent UI components
- Socket.io client for real-time communication
- React Query for server state management
- React Hook Form for form handling
- Jest and React Testing Library for testing
- Vite for build tooling and development server
- Import types from `@threadsharing/shared`

**Testing Requirements:**

- Bruno for API endpoint testing and validation
- Jest for unit and integration tests
- E2E testing for real-time features
- TypeScript coverage for all test files

**Infrastructure Requirements:**

- Yarn workspaces or npm workspaces for monorepo management
- Docker and Docker Compose for local development
- PostgreSQL for primary database
- Redis for session storage and caching
- File storage (local or S3-compatible)
- Dokploy-compatible Docker images for deployment
- Environment-based configuration management

## Development Workflow

**Feature Development Process:**

1. Create feature branch from main
2. Write failing tests first (TDD)
3. Implement minimum code to pass tests
4. Refactor while keeping tests green
5. Ensure Docker build succeeds
6. Submit PR with constitution compliance verification

**Code Review Requirements:**

- All tests must pass (backend JUnit, frontend Jest)
- Docker image must build successfully
- Integration tests must verify API contracts
- No constitution principle violations
- Code coverage must meet minimum thresholds

**Quality Gates:**

- Unit test coverage > 80% for business logic
- Integration tests for all API endpoints
- TypeScript strict mode with zero errors
- JPA entity relationships properly tested
- Docker health checks functional

## Governance

**Constitution Authority**: This constitution supersedes all other development practices and coding standards. All pull requests MUST verify compliance with these principles before merging.

**Amendment Process**: Constitution changes require documentation of rationale, impact assessment on existing features, and migration plan for non-compliant code. Major changes require team approval.

**Compliance Verification**: Every feature implementation MUST include a constitution compliance checklist. Complexity deviations MUST be justified with technical rationale and simpler alternatives evaluation.

**Development Guidance**: Use `.specify/templates/` for feature planning and task generation. Follow TDD workflow strictly - tests first, then implementation, then refactor.

**Version**: 1.2.0 | **Ratified**: 2025-09-27 | **Last Amended**: 2025-09-27

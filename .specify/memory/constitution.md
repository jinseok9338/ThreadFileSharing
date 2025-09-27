<!--
Sync Impact Report:
Version: 1.0.0 (Initial constitution)
Modified principles: All principles created from template
Added sections: Technology Stack Standards, Development Workflow
Removed sections: None
Templates requiring updates:
- ✅ plan-template.md: Constitution Check section updated
- ✅ spec-template.md: Requirements alignment verified
- ✅ tasks-template.md: Task categorization updated
Follow-up TODOs: None
-->

# ThreadFileSharing Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

Every feature MUST begin with failing tests before any implementation. Backend tests use JUnit 5 and Spring Boot Test. Frontend tests use Jest and React Testing Library. Integration tests MUST verify React-Spring Boot API communication. Database tests MUST use JPA with H2 in-memory database. Red-Green-Refactor cycle strictly enforced - no code without failing tests first.

**Rationale**: Prevents regression bugs, ensures testable design, and validates feature requirements before implementation investment.

### II. Containerization Standard

Every service MUST have a production-ready Dockerfile. Local development MUST use Docker Compose for service orchestration. All dependencies MUST be containerized including databases and external services. Docker images MUST be optimized for Dokploy deployment with proper health checks and environment configuration.

**Rationale**: Ensures consistent environments across development, testing, and production while enabling reliable Dokploy deployments.

### III. Full-Stack Type Safety

Frontend MUST use TypeScript with strict mode enabled. Backend MUST use Java with proper DTO classes for API contracts. API request/response schemas MUST be consistent between React and Spring Boot. No `any` types in TypeScript, no raw types in Java.

**Rationale**: Prevents runtime type errors, improves IDE support, and ensures API contract compliance between frontend and backend.

### IV. JPA Data Integrity

All database entities MUST use JPA annotations with proper relationships (@OneToMany, @ManyToOne, etc.). Database schema changes MUST use Flyway migrations. Transaction boundaries MUST be explicitly defined with @Transactional. No direct SQL in business logic - use JPA repositories and JPQL.

**Rationale**: Ensures data consistency, enables database version control, and maintains clean separation between data access and business logic.

### V. Deployment Readiness

All features MUST be deployable via Docker with zero manual configuration. Environment-specific settings MUST use Spring Profiles and environment variables. Health check endpoints MUST be implemented for all services. Build process MUST generate production-ready Docker images compatible with Dokploy.

**Rationale**: Enables reliable deployments, supports monitoring and scaling, and ensures consistent production environments.

## Technology Stack Standards

**Backend Requirements:**

- Spring Boot 3.x with Java 17 or higher
- JPA/Hibernate for data persistence
- PostgreSQL for production, H2 for testing
- Maven for dependency management
- JUnit 5 and Spring Boot Test for testing

**Frontend Requirements:**

- React 18+ with TypeScript
- Modern build tools (Vite or Create React App)
- Jest and React Testing Library for testing
- Axios or Fetch API for backend communication

**Infrastructure Requirements:**

- Docker and Docker Compose for local development
- PostgreSQL database container
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

**Version**: 1.0.0 | **Ratified**: 2025-09-27 | **Last Amended**: 2025-09-27

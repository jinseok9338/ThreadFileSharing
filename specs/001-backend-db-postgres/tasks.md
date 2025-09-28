# Tasks: Backend Project Setup with Database

**Input**: Design documents from `/specs/001-backend-db-postgres/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → ✅ Found: NestJS + Fastify + TypeORM + PostgreSQL + Docker + Bruno
2. Load optional design documents:
   → ✅ data-model.md: Migration Entity, Configuration Entity, Health Check table
   → ✅ contracts/: health-api.json with 4 endpoints
   → ✅ research.md: Technical decisions and dependencies
3. Generate tasks by category:
   → ✅ Setup: Docker Compose, NestJS project, environment files
   → ✅ Tests: Bruno API tests, Jest unit tests
   → ✅ Core: Health check endpoints, database connection
   → ✅ Integration: TypeORM, migrations, environment configs
   → ✅ Polish: Documentation, validation, cleanup
4. Apply task rules:
   → ✅ Different files = marked [P] for parallel
   → ✅ Same file = sequential (no [P])
   → ✅ Tests before implementation (TDD)
5. Number tasks sequentially (T001-T018)
6. Generate dependency graph and parallel execution examples
7. Validate task completeness: All endpoints, entities, and configs covered
8. Return: SUCCESS (18 tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Backend project**: `packages/backend/` (NestJS application)
- **Bruno tests**: `tests/bruno/` at repository root
- **Environment files**: Repository root (.env.local, .env.development, etc.)
- **Docker files**: Repository root (docker-compose.yml, Dockerfile)

## Phase 3.1: Project Setup

- [ ] T001 [P] Create project workspace structure (packages/backend/, tests/bruno/, docs/)
- [ ] T002 [P] Create Docker Compose configuration (docker-compose.yml) with PostgreSQL and backend services
- [ ] T003 [P] Create environment files (.env.local, .env.development, .env.staging, .env.production, .env.example)
- [ ] T004 Initialize NestJS project in packages/backend/ with Fastify adapter and TypeScript
- [ ] T005 [P] Configure package.json with required dependencies (NestJS, Fastify, TypeORM, PostgreSQL, Jest)
- [ ] T006 [P] Setup Bruno API testing environment in tests/bruno/ with health check collection
- [ ] T007 [P] Configure TypeScript and ESLint settings for packages/backend/
- [ ] T008 [P] Create Dockerfile for backend service with multi-stage build

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T009 [P] Bruno API test GET /health in tests/bruno/health/basic-health.bru
- [ ] T010 [P] Bruno API test GET /health/database in tests/bruno/health/database-health.bru
- [ ] T011 [P] Bruno API test GET /health/ready in tests/bruno/health/readiness.bru
- [ ] T012 [P] Bruno API test GET /health/live in tests/bruno/health/liveness.bru
- [ ] T013 [P] Backend unit tests for HealthController in packages/backend/src/health/health.controller.spec.ts
- [ ] T014 [P] Backend unit tests for DatabaseService in packages/backend/src/database/database.service.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T015 Configure TypeORM connection in packages/backend/src/database/database.module.ts
- [ ] T016 Create health check entity in packages/backend/src/health/entities/health-check.entity.ts
- [ ] T017 Implement HealthController with all endpoints in packages/backend/src/health/health.controller.ts
- [ ] T018 Create database service for connection management in packages/backend/src/database/database.service.ts

## Phase 3.4: Integration & Configuration

- [ ] T019 Configure TypeORM migrations in packages/backend/src/migrations/
- [ ] T020 Create initial migration for health_check table
- [ ] T021 Setup environment-based configuration in packages/backend/src/config/
- [ ] T022 Configure Docker Compose health checks and volume persistence
- [ ] T023 Setup application bootstrap with environment validation in packages/backend/src/main.ts

## Phase 3.5: Validation & Polish

- [ ] T024 [P] Run Bruno test suite against all environments (local, development, staging)
- [ ] T025 [P] Execute quickstart validation scenarios from quickstart.md
- [ ] T026 [P] Performance testing for database connection pooling
- [ ] T027 [P] Update API documentation with Swagger/OpenAPI integration
- [ ] T028 [P] Create deployment documentation for Docker Compose setup

## Dependency Graph

```
Setup Phase (T001-T008): All can run in parallel
  ↓
Tests Phase (T009-T014): All can run in parallel, depends on T001-T008
  ↓
Implementation Phase (T015-T018): Sequential, depends on T009-T014
  ↓
Integration Phase (T019-T023): Sequential, depends on T015-T018
  ↓
Validation Phase (T024-T028): All can run in parallel, depends on T019-T023
```

## Parallel Execution Examples

### Setup Phase (Parallel)

```bash
# All setup tasks can run simultaneously
Task Agent: "Execute T001: Create workspace structure"
Task Agent: "Execute T002: Create Docker Compose config"
Task Agent: "Execute T003: Create environment files"
# ... continue with T004-T008
```

### Tests Phase (Parallel)

```bash
# All test creation can run simultaneously
Task Agent: "Execute T009: Create Bruno health test"
Task Agent: "Execute T010: Create Bruno database test"
Task Agent: "Execute T011: Create Bruno readiness test"
# ... continue with T012-T014
```

### Implementation Phase (Sequential)

```bash
# Must run in order due to dependencies
Task Agent: "Execute T015: Configure TypeORM"
# Wait for completion, then:
Task Agent: "Execute T016: Create health entity"
# Wait for completion, then:
Task Agent: "Execute T017: Implement HealthController"
# Wait for completion, then:
Task Agent: "Execute T018: Create DatabaseService"
```

## Success Criteria

### ✅ Infrastructure Setup

- [ ] Docker Compose starts PostgreSQL and backend services
- [ ] All environment files configured correctly
- [ ] TypeScript compilation succeeds without errors
- [ ] Bruno test environment configured

### ✅ API Implementation

- [ ] All 4 health check endpoints respond correctly
- [ ] Database connection established and tested
- [ ] Error handling returns proper HTTP status codes
- [ ] API responses match OpenAPI schema

### ✅ Database Integration

- [ ] TypeORM migrations execute successfully
- [ ] Health check table created and accessible
- [ ] Connection pooling configured properly
- [ ] Environment-specific database connections work

### ✅ Testing Coverage

- [ ] All Bruno API tests pass
- [ ] Unit tests achieve >80% coverage
- [ ] Integration tests validate database operations
- [ ] Quickstart scenarios execute successfully

### ✅ Environment Validation

- [ ] Local development environment works
- [ ] Development server configuration validated
- [ ] Staging environment configuration tested
- [ ] Production readiness confirmed

## Task Execution Notes

### Prerequisites for Each Phase

- **Phase 3.1**: Node.js 18+, Docker, Docker Compose installed
- **Phase 3.2**: Phase 3.1 complete, Bruno CLI installed
- **Phase 3.3**: Phase 3.2 complete, all tests failing
- **Phase 3.4**: Phase 3.3 complete, basic implementation working
- **Phase 3.5**: Phase 3.4 complete, full integration working

### Critical Path

T001 → T004 → T015 → T017 → T021 → T024

### High-Risk Tasks

- **T015**: TypeORM configuration (complex database setup)
- **T017**: HealthController implementation (core API functionality)
- **T021**: Environment configuration (deployment readiness)

### Validation Commands

```bash
# After T008: Check Docker setup
docker-compose config

# After T014: Run tests (should fail)
cd tests/bruno && bru run --env local

# After T018: Run tests (should pass)
cd tests/bruno && bru run --env local

# After T023: Full environment test
npm run test && npm run start:dev
```

---

**Total Tasks**: 28 tasks
**Estimated Duration**: 2-3 days for experienced developer
**Parallel Opportunities**: 16 tasks can run in parallel
**Critical Dependencies**: 12 sequential tasks on critical path

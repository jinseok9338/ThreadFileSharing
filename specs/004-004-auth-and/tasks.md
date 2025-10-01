# Tasks: Authentication and Permissions System

**Input**: Design documents from `/specs/004-004-auth-and/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/auth-api.json

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → ✅ Found: Auth and permissions implementation plan
   → Extract: NestJS, Passport.js, JWT, bcrypt, TypeORM
2. Load optional design documents:
   → data-model.md: Extract entities → 7 entities (Company, User, RefreshToken, CompanyInvitation, ThreadParticipant, Team, TeamMember)
   → contracts/: auth-api.json → 4 endpoint groups
   → research.md: Extract decisions → Guard-based auth, dual token system
3. Generate tasks by category:
   → Setup: dependencies, environment, JWT module
   → Tests: Bruno API tests, Jest unit tests
   → Core: Entities, Services, Controllers, Guards
   → Integration: Module connections, Swagger
   → Polish: Rate limiting, audit logging
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? ✅
   → All entities have migrations? ✅
   → All endpoints implemented? ✅
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `packages/backend/`
- **Bruno tests**: `tests/bruno/auth/`
- **Migrations**: `packages/backend/src/migrations/`

---

## Phase 1: Setup & Dependencies

- [x] **T001** Install authentication dependencies

  - **File**: `packages/backend/package.json`
  - **Description**: Install @nestjs/passport, passport, @nestjs/jwt, passport-jwt, bcrypt, @nestjs/throttler and dev types
  - **Command**: `pnpm add @nestjs/passport passport @nestjs/jwt passport-jwt bcrypt @nestjs/throttler && pnpm add -D @types/passport-jwt @types/bcrypt`
  - **Dependencies**: None

- [x] **T002** Add JWT environment variables

  - **File**: `packages/backend/.env.example`
  - **Description**: Add JWT_SECRET, JWT_ACCESS_EXPIRATION, JWT_REFRESH_EXPIRATION, BCRYPT_ROUNDS, FRONTEND_URL
  - **Dependencies**: None

- [x] **T003** Configure JWT module
  - **File**: `packages/backend/src/auth/auth.module.ts`
  - **Description**: Configure JwtModule with environment variables
  - **Dependencies**: T001, T002

---

## Phase 2: Database Schema (TDD - Entities First)

- [x] **T004** [P] Create Company entity

  - **File**: `packages/backend/src/company/entities/company.entity.ts`
  - **Description**: Define Company entity with TypeORM decorators (id, name, slug, plan, max_users, max_storage_bytes, timestamps, soft delete)
  - **Dependencies**: None

- [x] **T005** [P] Create User entity

  - **File**: `packages/backend/src/user/entities/user.entity.ts`
  - **Description**: Define User entity (id, company_id FK, email unique, password_hash, SSO IDs, company_role, status fields, timestamps, soft delete)
  - **Dependencies**: None

- [x] **T006** [P] Create RefreshToken entity

  - **File**: `packages/backend/src/auth/entities/refresh-token.entity.ts`
  - **Description**: Define RefreshToken entity (id, user_id FK, token_hash unique, expires_at, revoked, timestamps)
  - **Dependencies**: None

- [x] **T007** [P] Create CompanyInvitation entity

  - **File**: `packages/backend/src/invitation/entities/company-invitation.entity.ts`
  - **Description**: Define CompanyInvitation entity (id, company_id, invited_by_user_id, email, role, token unique, status, expires_at, timestamps)
  - **Dependencies**: None

- [x] **T008** [P] Create ThreadParticipant entity

  - **File**: `packages/backend/src/thread/entities/thread-participant.entity.ts`
  - **Description**: Define ThreadParticipant entity (id, thread_id, user_id, role, can_invite, joined_at, last_read_at) with unique composite index
  - **Dependencies**: None

- [x] **T009** [P] Create Team entity (Optional)

  - **File**: `packages/backend/src/team/entities/team.entity.ts`
  - **Description**: Define Team entity (id, company_id, name, description, timestamps, soft delete)
  - **Dependencies**: None

- [x] **T010** [P] Create TeamMember entity (Optional)
  - **File**: `packages/backend/src/team/entities/team-member.entity.ts`
  - **Description**: Define TeamMember entity (id, team_id, user_id, role, joined_at) with unique composite index
  - **Dependencies**: None

---

## Phase 3: Database Migrations

- [x] **T011** Generate Company migration

  - **File**: `packages/backend/src/migrations/[timestamp]-CreateCompanyTable.ts`
  - **Description**: Generate migration for companies table with indexes (slug unique, plan, deleted_at)
  - **Command**: `pnpm run migration:generate src/migrations/CreateCompanyTable`
  - **Dependencies**: T004
  - **Note**: Created as part of unified CreateAuthenticationSchema migration (1759281690007)

- [x] **T012** Generate User migration

  - **File**: `packages/backend/src/migrations/[timestamp]-CreateUserTable.ts`
  - **Description**: Generate migration for users table with FK to companies and indexes (email unique, company_id, google_id, azure_id)
  - **Command**: `pnpm run migration:generate src/migrations/CreateUserTable`
  - **Dependencies**: T005, T011
  - **Note**: Created as part of unified CreateAuthenticationSchema migration (1759281690007)

- [x] **T013** Generate RefreshToken migration

  - **File**: `packages/backend/src/migrations/[timestamp]-CreateRefreshTokenTable.ts`
  - **Description**: Generate migration for refresh_tokens table with FK to users and indexes
  - **Command**: `pnpm run migration:generate src/migrations/CreateRefreshTokenTable`
  - **Dependencies**: T006, T012
  - **Note**: Created as part of unified CreateAuthenticationSchema migration (1759281690007)

- [x] **T014** Generate CompanyInvitation migration

  - **File**: `packages/backend/src/migrations/[timestamp]-CreateCompanyInvitationTable.ts`
  - **Description**: Generate migration for company_invitations table with FKs and indexes (token unique)
  - **Command**: `pnpm run migration:generate src/migrations/CreateCompanyInvitationTable`
  - **Dependencies**: T007, T011, T012
  - **Note**: Created as part of unified CreateAuthenticationSchema migration (1759281690007)

- [x] **T015** Generate ThreadParticipant migration

  - **File**: `packages/backend/src/migrations/[timestamp]-CreateThreadParticipantTable.ts`
  - **Description**: Generate migration for thread_participants table with composite unique index (thread_id, user_id)
  - **Command**: `pnpm run migration:generate src/migrations/CreateThreadParticipantTable`
  - **Dependencies**: T008, T012
  - **Note**: Created as part of unified CreateAuthenticationSchema migration (1759281690007)

- [x] **T016** Run all migrations

  - **Command**: `pnpm run migration:run`
  - **Description**: Apply all auth-related migrations to database
  - **Dependencies**: T011-T015

- [x] **T017** Create seed data script
  - **File**: `packages/backend/src/database/seeds/auth.seed.ts`
  - **Description**: Create seed data for development/testing with sample companies, users (owner/admin/member), and invitations
  - **Script Command**: Add `seed:run` and `seed:create` scripts to package.json
  - **Sample Data**:
    - 2 companies (Acme Corp with slug 'acme-corp', TechStart with slug 'techstart')
    - Each company: 1 owner, 1 admin, 2 members (total 8 users)
    - Sample passwords: Use bcrypt hashed 'Password123!'
    - 2 pending invitations per company
  - **Dependencies**: T016

---

## Phase 4: Tests First (TDD) - Bruno API Tests

- [x] **T018** [P] Write Bruno test for POST /auth/register

  - **File**: `tests/bruno/auth/register.bru`
  - **Description**: Test successful registration, email conflict, validation errors, company creation
  - **Dependencies**: T017

- [x] **T019** [P] Write Bruno test for POST /auth/login

  - **File**: `tests/bruno/auth/login.bru`
  - **Description**: Test successful login, invalid credentials, account locking
  - **Dependencies**: T017

- [x] **T020** [P] Write Bruno test for POST /auth/refresh

  - **File**: `tests/bruno/auth/refresh.bru`
  - **Description**: Test token refresh, expired token, revoked token, rotation
  - **Dependencies**: T016

- [x] **T021** [P] Write Bruno test for POST /auth/logout

  - **File**: `tests/bruno/auth/logout.bru`
  - **Description**: Test logout, token revocation
  - **Dependencies**: T016

- [x] **T022** [P] Write Bruno test for GET /users/me

  - **File**: `tests/bruno/auth/profile.bru`
  - **Description**: Test get profile, update profile, unauthorized access
  - **Dependencies**: T016

- [x] **T023** [P] Write Bruno test for GET /companies/me

  - **File**: `tests/bruno/auth/company.bru`
  - **Description**: Test get company info, get members, company isolation
  - **Dependencies**: T016

- [x] **T024** [P] Write Bruno test for POST /invitations
  - **File**: `tests/bruno/auth/invitations.bru`
  - **Description**: Test create invitation, accept invitation, expired token, role validation
  - **Dependencies**: T016

---

## Phase 5: Core Services & Guards (TDD - Unit Tests First)

- [x] **T025** Write AuthService unit tests

  - **File**: `packages/backend/src/auth/auth.service.spec.ts`
  - **Description**: Test register, login, validateUser, hashPassword, comparePassword, generateTokens, validateRefreshToken
  - **Dependencies**: T016

- [x] **T026** Write CompanyService unit tests

  - **File**: `packages/backend/src/company/company.service.spec.ts`
  - **Description**: Test create company, get members, remove member, update settings
  - **Dependencies**: T016

- [x] **T027** Write InvitationService unit tests

  - **File**: `packages/backend/src/invitation/invitation.service.spec.ts`
  - **Description**: Test create invitation, validate token, accept invitation, expire invitations
  - **Dependencies**: T016

- [x] **T028** Write Guard unit tests
  - **File**: `packages/backend/src/auth/guards/*.guard.spec.ts`
  - **Description**: Test AuthGuard, CompanyGuard, RoleGuard, ThreadParticipantGuard
  - **Dependencies**: T016

---

## Phase 6: Core Implementation (Following Tests)

### Authentication Module

- [x] **T029** Implement JwtStrategy

  - **File**: `packages/backend/src/auth/strategies/jwt.strategy.ts`
  - **Description**: Implement passport-jwt strategy, validate payload, attach user to request
  - **Dependencies**: T003, T024

- [x] **T030** Implement LocalStrategy

  - **File**: `packages/backend/src/auth/strategies/local.strategy.ts`
  - **Description**: Implement passport-local strategy for email/password validation
  - **Dependencies**: T003, T024

- [x] **T031** Implement AuthService

  - **File**: `packages/backend/src/auth/auth.service.ts`
  - **Description**: Implement register (create company + user), login, validateUser, token generation, refresh token logic
  - **Dependencies**: T024, T028, T029

- [x] **T032** Implement AuthGuard

  - **File**: `packages/backend/src/auth/guards/auth.guard.ts`
  - **Description**: Extend @nestjs/passport JwtAuthGuard
  - **Dependencies**: T027, T028

- [x] **T033** Implement CompanyGuard

  - **File**: `packages/backend/src/auth/guards/company.guard.ts`
  - **Description**: Verify resource belongs to user's company
  - **Dependencies**: T027, T031

- [x] **T034** Implement RoleGuard

  - **File**: `packages/backend/src/auth/guards/role.guard.ts`
  - **Description**: Check user's company_role against @Roles decorator
  - **Dependencies**: T027, T031

- [x] **T035** Implement ThreadParticipantGuard

  - **File**: `packages/backend/src/auth/guards/thread-participant.guard.ts`
  - **Description**: Check ThreadParticipant table or admin status
  - **Dependencies**: T027, T031, T008

- [x] **T036** Implement custom decorators
  - **File**: `packages/backend/src/auth/decorators/current-user.decorator.ts`
  - **Description**: Create @CurrentUser(), @Roles(), @Public() decorators
  - **Dependencies**: T031

### Company Module

- [x] **T037** Implement CompanyService

  - **File**: `packages/backend/src/company/company.service.ts`
  - **Description**: Implement create, findOne, update, getMembers, removeMember
  - **Dependencies**: T025, T004, T005

- [x] **T038** Implement CompanyController
  - **File**: `packages/backend/src/company/company.controller.ts`
  - **Description**: Implement GET /companies/me, PATCH /companies/me, GET /companies/me/members, DELETE /companies/me/members/:id
  - **Dependencies**: T036, T032, T033

### User Module

- [x] **T039** Implement UserService

  - **File**: `packages/backend/src/user/user.service.ts`
  - **Description**: Implement findByEmail, findById, create, update, changePassword, soft delete
  - **Dependencies**: T005

- [x] **T040** Implement UserController
  - **File**: `packages/backend/src/user/user.controller.ts`
  - **Description**: Implement GET /users/me, PATCH /users/me, PATCH /users/me/password
  - **Dependencies**: T038, T031

### Invitation Module

- [x] **T041** Implement InvitationService

  - **File**: `packages/backend/src/invitation/invitation.service.ts`
  - **Description**: Implement create, validateToken, acceptInvitation, list, cancel, expire cleanup
  - **Dependencies**: T026, T007, T036, T038

- [x] **T042** Implement InvitationController
  - **File**: `packages/backend/src/invitation/invitation.controller.ts`
  - **Description**: Implement POST /invitations, GET /invitations, DELETE /invitations/:id, POST /invitations/accept/:token
  - **Dependencies**: T040, T033

### AuthController

- [x] **T043** Implement AuthController
  - **File**: `packages/backend/src/auth/auth.controller.ts`
  - **Description**: Implement POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
  - **Dependencies**: T030, T031

---

## Phase 7: DTOs & Validation

- [x] **T044** [P] Create auth DTOs

  - **File**: `packages/backend/src/auth/dto/*.dto.ts`
  - **Description**: Create RegisterDto, LoginDto, RefreshDto, AuthResponseDto with class-validator decorators
  - **Dependencies**: None

- [x] **T045** [P] Create company DTOs

  - **File**: `packages/backend/src/company/dto/*.dto.ts`
  - **Description**: Create UpdateCompanyDto, CompanyResponseDto with validation
  - **Dependencies**: None

- [x] **T046** [P] Create user DTOs

  - **File**: `packages/backend/src/user/dto/*.dto.ts`
  - **Description**: Create UpdateUserDto, ChangePasswordDto, UserResponseDto with validation
  - **Dependencies**: None

- [x] **T047** [P] Create invitation DTOs
  - **File**: `packages/backend/src/invitation/dto/*.dto.ts`
  - **Description**: Create CreateInvitationDto, AcceptInvitationDto, InvitationResponseDto with validation
  - **Dependencies**: None

---

## Phase 8: Module Integration

- [x] **T048** Create CompanyModule

  - **File**: `packages/backend/src/company/company.module.ts`
  - **Description**: Configure CompanyModule with TypeORM, export CompanyService
  - **Dependencies**: T004, T036, T037

- [x] **T049** Create UserModule

  - **File**: `packages/backend/src/user/user.module.ts`
  - **Description**: Configure UserModule with TypeORM, export UserService
  - **Dependencies**: T005, T038, T039

- [x] **T050** Create InvitationModule

  - **File**: `packages/backend/src/invitation/invitation.module.ts`
  - **Description**: Configure InvitationModule with TypeORM, import CompanyModule and UserModule
  - **Dependencies**: T007, T040, T041, T047, T048

- [x] **T051** Create AuthModule

  - **File**: `packages/backend/src/auth/auth.module.ts`
  - **Description**: Configure AuthModule with Passport, JWT, strategies, guards, import UserModule
  - **Dependencies**: T028-T035, T042, T048

- [x] **T052** Update AppModule
  - **File**: `packages/backend/src/app.module.ts`
  - **Description**: Import AuthModule, CompanyModule, UserModule, InvitationModule, configure ThrottlerModule
  - **Dependencies**: T047-T050

---

## Phase 9: Rate Limiting & Security

- [x] **T053** Configure ThrottlerModule

  - **File**: `packages/backend/src/app.module.ts`
  - **Description**: Add global rate limiting configuration (default limits)
  - **Dependencies**: T001, T051

- [x] **T054** Add rate limiting to auth endpoints

  - **File**: `packages/backend/src/auth/auth.controller.ts`
  - **Description**: Add @Throttle decorators to login (5/5min), register (3/hour)
  - **Dependencies**: T042, T052

- [x] **T055** Implement account locking logic
  - **File**: `packages/backend/src/auth/auth.service.ts`
  - **Description**: Add failed login tracking, lock account after 5 attempts, auto-unlock after 15min
  - **Dependencies**: T030

---

## Phase 10: Swagger Documentation

- [x] **T056** Add Swagger decorators to AuthController

  - **File**: `packages/backend/src/auth/auth.controller.ts`
  - **Description**: Add @ApiTags, @ApiOperation, @ApiResponse decorators to all endpoints
  - **Dependencies**: T042

- [x] **T057** Add Swagger decorators to CompanyController

  - **File**: `packages/backend/src/company/company.controller.ts`
  - **Description**: Add @ApiTags, @ApiOperation, @ApiResponse, @ApiBearerAuth decorators
  - **Dependencies**: T037

- [x] **T058** Add Swagger decorators to UserController

  - **File**: `packages/backend/src/user/user.controller.ts`
  - **Description**: Add @ApiTags, @ApiOperation, @ApiResponse, @ApiBearerAuth decorators
  - **Dependencies**: T039

- [ ] **T059** Add Swagger decorators to InvitationController
  - **File**: `packages/backend/src/invitation/invitation.controller.ts`
  - **Description**: Add @ApiTags, @ApiOperation, @ApiResponse, @ApiBearerAuth decorators
  - **Dependencies**: T041

---

## Phase 11: Integration & Testing

- [ ] **T060** Run Bruno API tests

  - **Command**: `bru run --env local tests/bruno/auth/`
  - **Description**: Execute all auth API tests and verify they pass
  - **Dependencies**: T017-T023, T042, T037, T039, T041

- [ ] **T061** Run Jest unit tests

  - **Command**: `pnpm test`
  - **Description**: Execute all unit tests for services and guards
  - **Dependencies**: T024-T027, T030, T036, T038, T040

- [ ] **T062** Write integration test for full auth flow

  - **File**: `packages/backend/src/auth/auth.integration.spec.ts`
  - **Description**: Test complete flow: register → login → access protected endpoint → refresh → logout
  - **Dependencies**: T059, T060

- [ ] **T063** Write integration test for company isolation

  - **File**: `packages/backend/src/company/company.integration.spec.ts`
  - **Description**: Test that User A cannot access Company B's data
  - **Dependencies**: T059, T060

- [ ] **T064** Write integration test for invitation flow
  - **File**: `packages/backend/src/invitation/invitation.integration.spec.ts`
  - **Description**: Test: create invitation → accept → user joins company with correct role
  - **Dependencies**: T059, T060

---

## Phase 12: Polish & Documentation

- [ ] **T065** Add audit logging

  - **File**: `packages/backend/src/auth/auth.service.ts`
  - **Description**: Log authentication events (login, logout, failed attempts, lockouts) to console/database
  - **Dependencies**: T030

- [ ] **T066** Update backend README

  - **File**: `packages/backend/README.md`
  - **Description**: Document authentication setup, environment variables, Guards usage
  - **Dependencies**: T059-T063

- [ ] **T067** Verify Swagger documentation
  - **URL**: `http://localhost:3000/docs`
  - **Description**: Open Swagger UI and verify all auth endpoints are documented with request/response schemas
  - **Dependencies**: T055-T058

---

## Parallel Execution Examples

### Phase 2: Entity Creation (All Parallel)

```bash
# All entities can be created in parallel
Task agent execute T004 T005 T006 T007 T008 T009 T010
```

### Phase 4: Bruno Tests (All Parallel)

```bash
# All Bruno test files can be written in parallel
Task agent execute T017 T018 T019 T020 T021 T022 T023
```

### Phase 7: DTOs (All Parallel)

```bash
# All DTO files can be created in parallel
Task agent execute T043 T044 T045 T046
```

### Phase 10: Swagger (All Parallel)

```bash
# All Swagger decorators can be added in parallel
Task agent execute T055 T056 T057 T058
```

---

## Task Dependencies

```
Setup:
T001 → T003
T002 → T003

Entities:
T004, T005, T006, T007, T008, T009, T010 (all parallel)

Migrations:
T004 → T011
T005, T011 → T012
T006, T012 → T013
T007, T011, T012 → T014
T008, T012 → T015
T011-T015 → T016

Bruno Tests:
T016 → T017-T023 (all parallel after T016)

Unit Tests:
T016 → T024-T027 (parallel)

Services:
T024 → T028, T029
T028, T029 → T030
T025 → T036
T005 → T038
T026 → T040

Guards:
T027 → T031-T034
T031 → T032, T033, T034

Controllers:
T030, T031 → T042
T036, T032, T033 → T037
T038, T031 → T039
T040, T033 → T041

DTOs:
T043-T046 (all parallel)

Modules:
T004, T036, T037 → T047
T005, T038, T039 → T048
T007, T040, T041, T047, T048 → T049
T028-T035, T042, T048 → T050
T047-T050 → T051

Rate Limiting:
T001, T051 → T052
T042, T052 → T053
T030 → T054

Swagger:
T042 → T055
T037 → T056
T039 → T057
T041 → T058

Testing:
T017-T023, T042, T037, T039, T041 → T059
T024-T027, T030, T036, T038, T040 → T060
T059, T060 → T061, T062, T063

Polish:
T030 → T064
T059-T063 → T065
T055-T058 → T066
```

---

## Success Criteria

- [ ] All 66 tasks completed
- [ ] All Bruno tests pass
- [ ] All Jest unit tests pass
- [ ] All integration tests pass
- [ ] Swagger documentation complete
- [ ] Company isolation verified
- [ ] Thread access control verified
- [ ] Rate limiting functional
- [ ] Account locking functional
- [ ] No TypeScript errors
- [ ] Code coverage > 80% for auth services

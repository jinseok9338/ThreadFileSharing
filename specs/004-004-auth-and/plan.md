# Implementation Plan: Authentication and Permissions System

**Branch**: `004-004-auth-and` | **Date**: 2025-10-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-004-auth-and/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → ✅ Found: Authentication and Permissions System specification
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Detect Project Type: Web (backend + frontend)
   → ✅ Set Structure Decision: NestJS backend with TypeORM
3. Fill the Constitution Check section
   → ✅ Authentication-First Architecture principle applies
   → ✅ Test-First Development required
   → ✅ Shared Type System for auth types
4. Evaluate Constitution Check section below
   → ✅ No violations: Auth-first approach aligns with constitution
   → ✅ Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✅ Technical choices: Passport.js, JWT, bcrypt, TypeORM
6. Execute Phase 1 → contracts, data-model.md, quickstart.md
   → ✅ API contracts, Database schema, Quick start guide
7. Re-evaluate Constitution Check section
   → ✅ No new violations: Design maintains constitution compliance
   → ✅ Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Implement a comprehensive authentication and authorization system with company-based multi-tenancy. Users can register and create companies, or join existing companies via email invitation. Authentication supports local email/password login with JWT tokens (access + refresh). Authorization enforces company-level isolation and thread-level access control through participant management. Three-tier permission system: Company roles (Owner/Admin/Member), Thread roles (Owner/Member/Viewer), and Team membership (optional). SSO integration (Google/Azure) deferred to post-MVP.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode), Node.js 20+ LTS  
**Primary Dependencies**: NestJS 10+, Passport.js, passport-jwt, bcrypt, TypeORM, PostgreSQL  
**Storage**: PostgreSQL for users, companies, teams, threads, participants, invitations  
**Testing**: Jest + NestJS Testing, Bruno for API tests  
**Target Platform**: Linux server (Docker), Web browser  
**Project Type**: Web (backend + frontend)  
**Performance Goals**: Auth <500ms p95, Authorization <100ms p95, 1000 concurrent users  
**Constraints**: JWT tokens (15min access, 7day refresh), bcrypt cost 12, HTTPS required  
**Scale/Scope**: 1000 companies, 100 users/company (free tier), multi-tenant architecture

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Test-First Development**:

- [x] Feature spec includes testable acceptance criteria (10 scenarios defined)
- [x] Bruno API tests planned for all auth endpoints
- [x] Test strategy defined for backend (Jest + NestJS Testing)
- [x] Integration test plan for authentication flow
- [x] E2E test plan deferred (frontend integration phase)

**Authentication-First Architecture**:

- [x] User roles and permissions defined (Company: Owner/Admin/Member, Thread: Owner/Member/Viewer)
- [x] JWT authentication strategy planned (Access + Refresh tokens)
- [x] NestJS Guards planned (AuthGuard, CompanyGuard, RoleGuard, ThreadParticipantGuard)
- [x] Secure password handling (bcrypt cost 12)

**Real-Time Communication**:

- [ ] N/A for authentication feature (will be addressed in chat system feature)

**Shared Type System**:

- [x] Shared types package structure exists (from previous projects)
- [x] API contract types to be defined (User, Company, Auth DTOs)
- [ ] Socket.io event interfaces N/A for this feature
- [x] Zod schemas planned for auth validation
- [x] TypeORM entity types to be exported to shared package

**File-Centric Design**:

- [ ] N/A for authentication feature (will be addressed in file upload feature)

**Data Integrity**:

- [x] Database entities identified (Company, User, Team, TeamMember, ThreadParticipant, CompanyInvitation, RefreshToken)
- [x] TypeORM migration strategy planned (sequential migrations)
- [x] Transaction boundaries considered (registration = Company + User creation)
- [x] Business rule constraints defined (unique emails, role enforcement)

**Screen-First Design**:

- [ ] User interface wireframes to be created in parallel frontend work
- [ ] Login/Register screens planned
- [ ] Company management screens planned
- [x] Responsive design requirements noted

**Deployment Readiness**:

- [x] Existing Dockerfile will be updated with new dependencies
- [x] Environment variables for JWT, SSO to be added
- [x] Docker Compose unchanged (uses existing PostgreSQL)

## Complexity Tracking

**Deviations from Constitution**: None

**Justified Exceptions**:

- Real-time communication N/A for auth feature
- File-centric design N/A for auth feature
- Screen-first design deferred to frontend phase

**Simpler Alternatives Considered**:

- No auth libraries (DIY JWT) → Rejected: Passport.js is industry standard, reduces security risk
- Single-tier permissions → Rejected: Business requires company AND thread isolation
- No refresh tokens → Rejected: Poor UX with 15min token expiration

---

## Phase 0: Research & Technical Decisions

### Technology Selection

**Authentication Library**: Passport.js + passport-jwt

- ✅ Industry standard, well-tested
- ✅ NestJS official integration (@nestjs/passport)
- ✅ Extensible for future SSO (passport-google-oauth20, passport-azure-ad)
- ✅ Strategy pattern for multiple auth methods

**Password Hashing**: bcrypt

- ✅ Industry standard, resistant to rainbow table attacks
- ✅ Configurable cost factor (12 for production)
- ✅ Automatic salt generation

**Token Strategy**: JWT (Access + Refresh)

- Access Token: 15 minutes, stateless, stored in frontend localStorage
- Refresh Token: 7 days, stored in backend database (hashed) and frontend localStorage
- Token blacklist via database for logout/revocation

**Multi-Tenancy Approach**: Row-Level Security (RLS) Pattern

- Every resource table includes `company_id`
- All queries filtered by authenticated user's company
- TypeORM QueryBuilder with automatic company filter
- Guards enforce company boundary

**Authorization Pattern**: Guard-Based (NestJS)

- AuthGuard: JWT validation
- CompanyGuard: Company membership check
- RoleGuard: Company role check (Owner/Admin/Member)
- ThreadParticipantGuard: Thread access check
- Composable guards for complex permissions

### Alternative Approaches Rejected

**Auth0 / Clerk / Supabase**: External auth service

- ❌ Vendor lock-in
- ❌ Monthly costs
- ❌ Less control over auth flow
- ✅ Fast implementation (pro)

**Session-based auth**: Server-side sessions with Redis

- ❌ Stateful, harder to scale
- ❌ Requires Redis for session store
- ✅ Simpler logout (pro)

**Multi-database multi-tenancy**: Separate database per company

- ❌ Operational complexity
- ❌ Backup/migration nightmare
- ❌ Cost prohibitive at scale

---

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` for complete entity schemas.

**Core Entities**:

1. Company (id, name, slug, plan, limits)
2. User (id, company_id, email, password_hash, company_role, SSO IDs)
3. Team (id, company_id, name) - Optional
4. TeamMember (team_id, user_id, role) - Optional
5. ThreadParticipant (thread_id, user_id, role, joined_at)
6. CompanyInvitation (company_id, email, token, role, status, expires_at)
7. RefreshToken (id, user_id, token_hash, expires_at, revoked)

**Key Relationships**:

- Company 1:N User
- Company 1:N Team
- Team N:M User (via TeamMember)
- Thread N:M User (via ThreadParticipant)
- Company 1:N CompanyInvitation
- User 1:N RefreshToken

### API Contracts

See `contracts/auth-api.json` for OpenAPI specification.

**Authentication Endpoints**:

- POST /api/v1/auth/register (public)
- POST /api/v1/auth/login (public)
- POST /api/v1/auth/logout (authenticated)
- POST /api/v1/auth/refresh (refresh token required)
- GET /api/v1/auth/me (authenticated)

**Company Endpoints**:

- GET /api/v1/companies/me (authenticated)
- PATCH /api/v1/companies/me (owner/admin)
- GET /api/v1/companies/me/members (authenticated)
- DELETE /api/v1/companies/me/members/:userId (owner/admin)

**Invitation Endpoints**:

- POST /api/v1/invitations (owner/admin)
- GET /api/v1/invitations (owner/admin)
- DELETE /api/v1/invitations/:id (owner/admin)
- GET /api/v1/invitations/validate/:token (public)
- POST /api/v1/invitations/accept/:token (public)

**User Endpoints**:

- GET /api/v1/users/me (authenticated)
- PATCH /api/v1/users/me (authenticated)
- PATCH /api/v1/users/me/password (authenticated, local auth only)

**Team Endpoints** (Optional):

- POST /api/v1/teams (admin)
- GET /api/v1/teams (authenticated)
- GET /api/v1/teams/:id (authenticated)
- PATCH /api/v1/teams/:id (admin/team leader)
- DELETE /api/v1/teams/:id (admin)
- POST /api/v1/teams/:id/members (admin/team leader)
- DELETE /api/v1/teams/:id/members/:userId (admin/team leader)

### Testing Strategy

**Unit Tests** (Jest):

- AuthService: password hashing, token generation, validation
- CompanyService: company creation, member management
- InvitationService: token generation, expiration logic
- Guards: AuthGuard, CompanyGuard, RoleGuard, ThreadParticipantGuard

**API Tests** (Bruno):

- Registration flow (success, email conflict, validation errors)
- Login flow (success, wrong password, account lock)
- Token refresh (success, expired token, revoked token)
- Company member management
- Invitation flow (create, accept, expire)

**Integration Tests** (Jest + Supertest):

- Full registration → login → access protected endpoint
- Invitation → register → auto-join company
- Company isolation (user A cannot access user B's company data)
- Thread access control (participant vs non-participant)

---

## Phase 2: Task Generation Plan

### Task Categories

**Setup Phase** (Sequential):

1. Install dependencies (@nestjs/passport, passport, passport-jwt, @nestjs/jwt, bcrypt)
2. Configure JWT module
3. Configure environment variables

**Database Phase** (TDD): 4. Create Company entity + migration 5. Create User entity + migration (with company_id FK) 6. Create RefreshToken entity + migration 7. Create CompanyInvitation entity + migration 8. Create ThreadParticipant entity + migration 9. Create Team, TeamMember entities + migration (optional)

**Test Phase** (Bruno + Jest): 10. Write Bruno tests for /auth/register 11. Write Bruno tests for /auth/login 12. Write Bruno tests for /auth/refresh 13. Write Bruno tests for company endpoints 14. Write Bruno tests for invitation endpoints 15. Write unit tests for AuthService 16. Write unit tests for Guards

**Core Implementation** (Following tests): 17. Implement AuthService (register, login, validateUser) 18. Implement JwtStrategy (passport-jwt) 19. Implement AuthGuard 20. Implement CompanyGuard 21. Implement RoleGuard 22. Implement ThreadParticipantGuard 23. Implement AuthController 24. Implement CompanyService 25. Implement CompanyController 26. Implement InvitationService 27. Implement InvitationController 28. Implement UserController 29. Implement TeamService + TeamController (optional)

**Integration Phase**: 30. Connect auth to existing DatabaseModule 31. Add auth Guards to future Thread endpoints 32. Configure CORS for frontend 33. Add Swagger documentation

**Polish Phase**: 34. Add rate limiting (login attempts) 35. Add account locking logic 36. Add audit logging 37. Update API documentation 38. Integration testing

### Parallel Execution Opportunities

- Company, User, RefreshToken, CompanyInvitation entities can be created in parallel [P]
- Bruno test files can be written in parallel [P]
- Service implementations can be parallelized if different files [P]

---

## Progress Tracking

**Phase 0: Research**

- [x] Technology selection complete
- [x] Alternative approaches evaluated
- [x] Architecture decisions documented

**Phase 1: Design & Contracts**

- [x] data-model.md created
- [x] contracts/auth-api.json created
- [x] quickstart.md created

**Phase 2: Tasks**

- [x] tasks.md generated (66 tasks created)

**Constitution Re-Check**:

- [ ] Post-design constitution check (after Phase 1)

---

## Next Steps

1. Continue to research.md creation
2. Then proceed to data-model.md, contracts/, quickstart.md
3. Run /tasks to generate tasks.md
4. Begin implementation with TDD approach

# Research: Authentication and Permissions System

**Feature**: 004-auth-and-permissions  
**Date**: 2025-10-01  
**Status**: Complete

## Overview

Research technical approaches for implementing a secure, scalable authentication and authorization system with company-based multi-tenancy, local authentication, optional SSO, and granular thread-level permissions.

---

## Authentication Strategy

### Decision: Passport.js + JWT

**Rationale**:

- Industry-standard library with proven security
- Official NestJS integration (`@nestjs/passport`)
- Strategy pattern allows multiple auth methods (local, Google, Azure)
- Large community, excellent documentation
- Extensible for future auth providers

**Implementation**:

```
@nestjs/passport: NestJS wrapper for Passport
passport: Core authentication middleware
passport-jwt: JWT strategy implementation
@nestjs/jwt: JWT token generation/verification
```

**Alternatives Considered**:

1. **Auth0 / Clerk / Supabase Auth**

   - Pros: Managed service, quick setup, built-in SSO
   - Cons: Vendor lock-in, monthly costs ($25-100/mo), less control
   - Decision: ❌ Avoid external dependency for core auth

2. **Custom JWT implementation**

   - Pros: Full control, no dependencies
   - Cons: Security risk (easy to get wrong), reinventing wheel
   - Decision: ❌ Use proven libraries

3. **Session-based auth (Passport.js + Redis)**
   - Pros: Simpler logout, easier to invalidate
   - Cons: Stateful, requires Redis, harder to scale
   - Decision: ❌ JWT is stateless and aligns with microservices

---

## Password Security

### Decision: bcrypt with cost factor 12

**Rationale**:

- Industry standard for password hashing
- Adaptive hashing (can increase cost over time)
- Automatic salt generation
- Resistant to GPU brute-force attacks

**Configuration**:

- Cost factor: 12 (recommended for 2024-2025)
- Hashing time: ~300-500ms (acceptable for auth)
- Future-proof: increase cost as hardware improves

**Alternatives Considered**:

1. **argon2**

   - Pros: Winner of Password Hashing Competition 2015, more secure
   - Cons: Less mature Node.js library, larger binary size
   - Decision: ❌ bcrypt is sufficient for MVP, well-tested

2. **scrypt**
   - Pros: Built into Node.js crypto module
   - Cons: Complex parameter tuning, less adoption than bcrypt
   - Decision: ❌ bcrypt is simpler

---

## Token Strategy

### Decision: Dual Token System (Access + Refresh)

**Access Token**:

- Lifetime: 15 minutes
- Storage: Frontend localStorage
- Content: user ID, company ID, company role
- Stateless: No database lookup per request

**Refresh Token**:

- Lifetime: 7 days
- Storage: Backend database (hashed), Frontend localStorage
- Content: Minimal (user ID, token family ID)
- Revocable: Can be invalidated in database

**Token Rotation**:

- Each refresh generates new access + refresh tokens
- Old refresh token invalidated
- Prevents token replay attacks

**Rationale**:

- Short-lived access tokens limit exposure window
- Refresh tokens enable long sessions without re-login
- Database-stored refresh tokens allow immediate revocation
- Rotation adds security layer

**Alternatives Considered**:

1. **Single long-lived access token**

   - Pros: Simpler implementation
   - Cons: Security risk if token leaked, cannot revoke
   - Decision: ❌ Unacceptable security risk

2. **Redis token store**
   - Pros: Fast token lookup, easy invalidation
   - Cons: Requires Redis infrastructure, added complexity
   - Decision: ❌ Database sufficient for MVP, Redis for post-MVP optimization

---

## Multi-Tenancy Architecture

### Decision: Shared Database with Company ID (Row-Level Security)

**Implementation**:

- Single PostgreSQL database
- Every table includes `company_id` column
- All queries automatically filtered by company
- TypeORM middleware/interceptor for automatic filtering

**Data Isolation**:

```typescript
// Example: Automatic company filtering in repository
@Injectable()
export class ThreadRepository {
  async findAllForUser(user: User) {
    return this.threadRepo.find({
      where: {
        company_id: user.company_id, // Automatic company filter
        // ... other conditions
      },
    });
  }
}
```

**Alternatives Considered**:

1. **Database per company (Schema-per-tenant)**

   - Pros: Complete data isolation, independent backups
   - Cons: Connection pool explosion, migration nightmare, high ops cost
   - Decision: ❌ Not feasible at scale

2. **Discriminator-based soft tenancy**

   - Pros: Simpler queries, no joins
   - Cons: Accidental cross-company data leakage risk
   - Decision: ❌ Too risky, prefer explicit foreign keys

3. **PostgreSQL Row-Level Security (RLS) policies**
   - Pros: Database-enforced security, automatic filtering
   - Cons: TypeORM doesn't support RLS well, complex migrations
   - Decision: ❌ Application-level filtering is more flexible

---

## Authorization & Permissions

### Decision: Multi-Layer Guard System

**Layer 1: Authentication (AuthGuard)**

- Validates JWT token
- Extracts user from token payload
- Attaches user to request object

**Layer 2: Company Boundary (CompanyGuard)**

- Verifies resource belongs to user's company
- Prevents cross-company data access
- Applied automatically to all resource endpoints

**Layer 3: Company Role (RoleGuard)**

- Checks user's company_role (Owner/Admin/Member)
- Decorators: `@Roles('admin', 'owner')`
- Used for company management endpoints

**Layer 4: Resource Access (ThreadParticipantGuard)**

- Checks ThreadParticipant table
- Verifies user is participant or admin
- Used for thread-specific endpoints

**Decorator Pattern**:

```typescript
@UseGuards(AuthGuard, CompanyGuard, RoleGuard)
@Roles('admin', 'owner')
@Post('invitations')
async inviteUser() { ... }

@UseGuards(AuthGuard, ThreadParticipantGuard)
@Get('threads/:id')
async getThread() { ... }
```

**Alternatives Considered**:

1. **CASL (Attribute-Based Access Control)**

   - Pros: Fine-grained permissions, flexible policies
   - Cons: Steeper learning curve, overengineered for MVP
   - Decision: ❌ Guard-based is simpler for MVP

2. **Single monolithic guard**
   - Pros: Simple, one place for all auth logic
   - Cons: Not composable, hard to test, violates SRP
   - Decision: ❌ Multi-layer is more maintainable

---

## Invitation System

### Decision: Token-Based Email Invitation

**Flow**:

1. Admin creates invitation (email, role)
2. System generates crypto-secure token
3. Invitation stored in database with expiration (7 days)
4. Email sent with registration link + token
5. User registers via invitation link
6. System validates token, creates user, marks invitation accepted

**Token Security**:

- UUID v4 or crypto.randomBytes(32).toString('hex')
- Stored in database with expiration timestamp
- Single-use (marked as accepted/expired after use)
- Cannot be guessed or brute-forced

**Email Delivery**:

- SMTP configuration (Gmail, SendGrid, or custom)
- Handlebars templates for invitation emails
- Retry logic for failed sends
- Track delivery status

**Alternatives Considered**:

1. **Magic link (passwordless)**

   - Pros: No password to remember
   - Cons: Email-dependent, phishing risk
   - Decision: ❌ Traditional password + invitation is more familiar

2. **Admin-created accounts**
   - Pros: Immediate access, no email needed
   - Cons: Admin knows user password, poor UX
   - Decision: ❌ Security risk, user privacy concern

---

## SSO Integration (Deferred to Post-MVP)

### Future: Google OAuth 2.0

**Library**: passport-google-oauth20  
**Flow**: Authorization Code Flow  
**Scopes**: email, profile  
**Account Linking**: By email address

### Future: Azure AD (Microsoft Entra ID)

**Library**: passport-azure-ad  
**Flow**: OpenID Connect  
**Scopes**: email, profile, openid  
**Account Linking**: By email address

**MVP Decision**: Defer SSO to separate feature (Day 3-4)

- Reduces Day 2 complexity
- Local auth is sufficient for initial users
- SSO can be added without breaking existing auth

---

## Rate Limiting & Security

### Decision: @nestjs/throttler + Custom Account Locking

**Rate Limiting**:

- Login endpoint: 5 attempts per 5 minutes per IP
- Registration endpoint: 3 attempts per hour per IP
- Password reset: 3 attempts per hour per email

**Account Locking**:

- After 5 failed login attempts within 5 minutes
- Lock duration: 15 minutes
- Unlock: Automatic after duration OR email-based unlock link

**Implementation**:

```typescript
@Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 per 5min
@Post('login')
async login() { ... }
```

**Alternatives Considered**:

1. **Redis-based rate limiting**

   - Pros: Distributed, faster
   - Cons: Requires Redis
   - Decision: ❌ Database is sufficient for MVP

2. **CAPTCHA (reCAPTCHA)**
   - Pros: Prevents automated attacks
   - Cons: Poor UX, external dependency
   - Decision: ⏳ Consider for post-MVP if abuse detected

---

## Database Schema Decisions

### Company Membership

**Decision**: One user, one company (MVP)

- User has single `company_id` foreign key
- Simplifies permissions logic
- Easier to implement and test

**Future**: Multi-company membership

- Requires UserCompanyMembership join table
- More complex permission resolution
- Workspace switching in UI

### Email Uniqueness

**Decision**: Globally unique emails

- No two users can have same email across all companies
- Simplifies SSO account matching
- Prevents confusion in invitation flow

**Alternative**: Email unique per company

- Allows john@gmail.com in Company A and Company B
- Complicates SSO (which company to join?)
- Decision: ❌ Global uniqueness is simpler

### Soft Delete

**Decision**: Soft delete for Company, User, Team

- Add `deleted_at` timestamp column
- Queries exclude deleted records by default
- 30-day grace period before hard delete
- Allows data recovery

**Rationale**:

- Accidental deletion protection
- Compliance requirements (data retention)
- User can restore within grace period

---

## Performance Considerations

### Password Hashing Optimization

**Challenge**: bcrypt hashing takes ~300-500ms
**Solution**: Async hashing, never block event loop

```typescript
await bcrypt.hash(password, 12); // Async
```

### Token Verification Optimization

**Challenge**: Database lookup for refresh token on every /auth/refresh
**Solution**:

- Index on `token_hash` column
- Cache user data in access token payload (reduces DB hits)
- Future: Redis cache for active refresh tokens

### Query Optimization

**Indexes**:

- `users.email` - unique index
- `users.company_id` - foreign key index
- `users.google_id, users.azure_id` - unique indexes (nullable)
- `refresh_tokens.token_hash` - index
- `refresh_tokens.user_id` - foreign key index
- `company_invitations.token` - unique index
- `company_invitations.email, company_invitations.company_id` - composite index
- `thread_participants(thread_id, user_id)` - unique composite index

---

## Security Measures

### JWT Security

1. **Strong Secret**: Minimum 256-bit random key
2. **Algorithm**: HS256 or RS256 (asymmetric for multi-service future)
3. **Payload**: Minimal data (user ID, company ID, role)
4. **No Sensitive Data**: Never include password, tokens in JWT

### CORS Configuration

```typescript
{
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
```

### Input Validation

- Use `class-validator` for DTO validation
- Validate email format, password strength
- Sanitize all inputs to prevent SQL injection
- Validate company slug format (alphanumeric + hyphens)

### HTTPS Enforcement

- Production: Enforce HTTPS only
- Development: Allow HTTP for localhost
- Cookie settings: `secure: true` in production

---

## Testing Strategy Details

### Test Data Isolation

- Each test creates its own company
- Use transaction rollback for test cleanup
- Factory functions for test entity creation

### Test Coverage Targets

- AuthService: 100% (critical security code)
- Guards: 100% (authorization logic)
- Controllers: 90% (API endpoints)
- Services: 85% (business logic)

### Bruno Test Organization

```
tests/bruno/auth/
├── register.bru          # Registration tests
├── login.bru             # Login tests
├── refresh.bru           # Token refresh tests
├── logout.bru            # Logout tests
├── profile.bru           # User profile tests
├── company.bru           # Company management tests
└── invitations.bru       # Invitation flow tests
```

---

## Migration Strategy

### Sequential Migrations

1. `CreateCompany` - Company table
2. `CreateUser` - User table with company_id FK
3. `CreateRefreshToken` - RefreshToken table
4. `CreateCompanyInvitation` - CompanyInvitation table
5. `CreateThreadParticipant` - ThreadParticipant table (if Thread exists)
6. `CreateTeam` - Team table (optional)
7. `CreateTeamMember` - TeamMember table (optional)

### Migration Naming Convention

`{timestamp}-{PascalCaseName}.ts`

Example: `1696234567890-CreateCompanyTable.ts`

---

## Environment Configuration

### Required Variables

```env
# JWT Configuration
JWT_SECRET=<256-bit-random-key>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Password Security
BCRYPT_ROUNDS=12

# Rate Limiting
LOGIN_RATE_LIMIT=5
LOGIN_RATE_TTL=300000  # 5 minutes in ms
ACCOUNT_LOCK_DURATION=900000  # 15 minutes in ms

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Company Defaults
DEFAULT_COMPANY_PLAN=free
DEFAULT_MAX_USERS=100
DEFAULT_MAX_STORAGE=5368709120  # 5GB

# Email (for invitations - optional for MVP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@threadsharing.com
```

### Google OAuth (Future)

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

### Azure AD (Future)

```env
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=
AZURE_CALLBACK_URL=http://localhost:3000/api/v1/auth/azure/callback
```

---

## Dependencies

### Backend Packages

**Required**:

```json
{
  "dependencies": {
    "@nestjs/passport": "^10.0.3",
    "@nestjs/jwt": "^10.2.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "@nestjs/throttler": "^5.1.2"
  },
  "devDependencies": {
    "@types/passport-jwt": "^4.0.1",
    "@types/bcrypt": "^5.0.2"
  }
}
```

**Optional (Email)**:

```json
{
  "dependencies": {
    "@nestjs-modules/mailer": "^1.11.2",
    "nodemailer": "^6.9.9",
    "handlebars": "^4.7.8"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.4.14"
  }
}
```

**Future (SSO)**:

```json
{
  "dependencies": {
    "passport-google-oauth20": "^2.0.0",
    "passport-azure-ad": "^4.3.5"
  },
  "devDependencies": {
    "@types/passport-google-oauth20": "^2.0.14"
  }
}
```

---

## Architecture Decisions

### Module Structure

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── company.guard.ts
│   │   ├── role.guard.ts
│   │   └── thread-participant.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   └── dto/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       ├── refresh.dto.ts
│       └── auth-response.dto.ts
├── company/
│   ├── company.module.ts
│   ├── company.controller.ts
│   ├── company.service.ts
│   ├── entities/
│   │   └── company.entity.ts
│   └── dto/
├── user/
│   ├── user.module.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── refresh-token.entity.ts
│   └── dto/
├── invitation/
│   ├── invitation.module.ts
│   ├── invitation.controller.ts
│   ├── invitation.service.ts
│   ├── entities/
│   │   └── company-invitation.entity.ts
│   └── dto/
└── team/  (optional)
    ├── team.module.ts
    ├── team.controller.ts
    ├── team.service.ts
    ├── entities/
    │   ├── team.entity.ts
    │   └── team-member.entity.ts
    └── dto/
```

### Dependency Injection

- AuthService depends on: UserService, JwtService
- CompanyService depends on: UserService, CompanyRepository
- InvitationService depends on: CompanyService, MailService (optional)
- Guards depend on: Reflector (for metadata), repositories

---

## Error Handling

### Authentication Errors

- `401 Unauthorized`: Invalid credentials, expired token
- `403 Forbidden`: Valid auth but insufficient permissions
- `429 Too Many Requests`: Rate limit exceeded
- `423 Locked`: Account temporarily locked

### User-Friendly Messages

```typescript
{
  "error": "invalid_credentials",
  "message": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "code": 401
}
```

**Security Note**: Never reveal whether email exists or not

- Wrong email OR wrong password → same error message
- Prevents email enumeration attacks

---

## Audit Logging

### Events to Log

- User registration (success, failure)
- Login attempts (success, failure, IP address)
- Logout events
- Password changes
- Account locks/unlocks
- Permission changes
- Company member additions/removals
- Invitation creations/acceptances

### Log Storage

- Database table: `audit_logs`
- Columns: event_type, user_id, company_id, ip_address, user_agent, metadata (JSON), created_at
- Retention: 90 days minimum (compliance)

---

## Risks & Mitigation

### Risk 1: JWT Secret Compromise

**Mitigation**:

- Store secret in environment variable, never commit
- Use strong random key (256-bit minimum)
- Rotate secret periodically (requires re-login)
- Consider asymmetric keys (RS256) for future

### Risk 2: Token Replay Attacks

**Mitigation**:

- Short access token lifetime (15min)
- Refresh token rotation
- IP address validation (optional)
- Device fingerprinting (optional)

### Risk 3: Cross-Company Data Leakage

**Mitigation**:

- Mandatory CompanyGuard on all resource endpoints
- Unit tests for company isolation
- Integration tests with multiple companies
- Code review checklist for company_id filtering

### Risk 4: Account Lockout Denial of Service

**Mitigation**:

- CAPTCHA after 3 failed attempts (future)
- Email-based unlock in addition to time-based
- Monitor for distributed lockout attacks
- IP-based rate limiting

---

## Performance Benchmarks

### Target Metrics

- Registration: < 1000ms (includes bcrypt hashing)
- Login: < 500ms p95
- Token refresh: < 200ms p95
- Authorization check: < 100ms p95

### Load Testing Plan

- 100 concurrent registrations
- 1000 concurrent logins
- 10,000 authorization checks per second

---

## Compliance & Privacy

### GDPR Considerations

- User can delete account (right to erasure)
- User can export data (right to data portability)
- Clear privacy policy and terms of service
- Consent tracking for data processing

### Password Policy Compliance

- Minimum 8 characters
- Mix of uppercase, lowercase, numbers
- Special characters encouraged
- No password history (MVP) - add later

---

## Decision Summary

| Decision Area      | Choice                  | Rationale                             |
| ------------------ | ----------------------- | ------------------------------------- |
| Auth Library       | Passport.js + JWT       | Industry standard, NestJS integration |
| Password Hash      | bcrypt (cost 12)        | Proven security, adaptive             |
| Token Type         | Dual (Access + Refresh) | Balance of security and UX            |
| Multi-Tenancy      | Shared DB + company_id  | Scalable, cost-effective              |
| Authorization      | Multi-layer Guards      | Composable, testable                  |
| Invitation         | Token-based email       | Secure, standard UX                   |
| SSO                | Deferred to post-MVP    | Reduce Day 2 complexity               |
| Email Verification | Optional for MVP        | Can add later                         |
| Rate Limiting      | @nestjs/throttler       | Simple, effective                     |

---

## Open Questions (Resolved)

None - all technical decisions made for MVP scope.

---

## Next Phase

Proceed to **Phase 1: Design & Contracts**

- data-model.md: Complete entity schemas
- contracts/auth-api.json: OpenAPI specification
- quickstart.md: Developer quick start guide

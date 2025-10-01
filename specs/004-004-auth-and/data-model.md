# Data Model: Authentication and Permissions System

**Feature**: 004-auth-and-permissions  
**Date**: 2025-10-01  
**Status**: Design Complete

## Entity Relationship Diagram (Text)

```
Company
  ├─ has many → User
  ├─ has many → Team (optional)
  ├─ has many → Thread (from future features)
  └─ has many → CompanyInvitation

User
  ├─ belongs to → Company
  ├─ member of many → Team (via TeamMember, optional)
  ├─ participant in many → Thread (via ThreadParticipant)
  └─ has many → RefreshToken

Team (optional)
  ├─ belongs to → Company
  └─ has many → User (via TeamMember)

ThreadParticipant
  ├─ belongs to → Thread
  └─ belongs to → User

CompanyInvitation
  ├─ belongs to → Company
  └─ created by → User

RefreshToken
  └─ belongs to → User
```

---

## Core Entities

### 1. Company

**Purpose**: Root entity for multi-tenancy, contains all users and data for an organization

**Attributes**:

- `id` (UUID, PK): Unique identifier
- `name` (VARCHAR(255), NOT NULL): Company display name
- `slug` (VARCHAR(100), UNIQUE, NOT NULL): URL-friendly identifier (e.g., "acme-corp")
- `plan` (ENUM, NOT NULL): Subscription tier - 'free', 'pro', 'enterprise'
- `max_users` (INTEGER, DEFAULT 100): Maximum users allowed
- `max_storage_bytes` (BIGINT, DEFAULT 5368709120): Storage limit in bytes (5GB default)
- `created_at` (TIMESTAMP, NOT NULL): Creation timestamp
- `updated_at` (TIMESTAMP, NOT NULL): Last update timestamp
- `deleted_at` (TIMESTAMP, NULL): Soft delete timestamp

**Relationships**:

- `users` (1:N to User)
- `teams` (1:N to Team)
- `invitations` (1:N to CompanyInvitation)
- `threads` (1:N to Thread) - from future feature

**Constraints**:

- `slug` must be unique globally
- `slug` must match pattern: `^[a-z0-9-]+$`
- `max_users` must be >= 1
- `max_storage_bytes` must be >= 0

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE INDEX (slug)
- INDEX (plan) - for analytics
- INDEX (deleted_at) - for soft delete queries

**Business Rules**:

- Cannot delete if active threads exist
- First user becomes company owner automatically
- Deleting company soft-deletes all users, teams, threads

---

### 2. User

**Purpose**: Individual user account with authentication credentials and company membership

**Attributes**:

- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK to Company, NOT NULL): Company membership
- `email` (VARCHAR(255), UNIQUE, NOT NULL): Email address (globally unique)
- `username` (VARCHAR(50), NULL): Optional display name
- `full_name` (VARCHAR(255), NULL): User's full name
- `avatar_url` (VARCHAR(500), NULL): Profile picture URL
- `password_hash` (VARCHAR(255), NULL): bcrypt hashed password (null for SSO-only)
- `google_id` (VARCHAR(255), UNIQUE, NULL): Google OAuth ID
- `azure_id` (VARCHAR(255), UNIQUE, NULL): Azure AD ID
- `company_role` (ENUM, NOT NULL): 'owner', 'admin', 'member'
- `email_verified` (BOOLEAN, DEFAULT FALSE): Email verification status
- `is_active` (BOOLEAN, DEFAULT TRUE): Account active status
- `failed_login_attempts` (INTEGER, DEFAULT 0): Counter for account locking
- `locked_until` (TIMESTAMP, NULL): Account lock expiration
- `last_login_at` (TIMESTAMP, NULL): Last successful login
- `created_at` (TIMESTAMP, NOT NULL): Registration timestamp
- `updated_at` (TIMESTAMP, NOT NULL): Last update timestamp
- `deleted_at` (TIMESTAMP, NULL): Soft delete timestamp

**Relationships**:

- `company` (N:1 to Company)
- `refresh_tokens` (1:N to RefreshToken)
- `team_memberships` (N:M to Team via TeamMember)
- `thread_participations` (N:M to Thread via ThreadParticipant)
- `created_invitations` (1:N to CompanyInvitation as creator)

**Constraints**:

- `email` must be valid email format
- `email` must be unique globally (across all companies)
- `google_id` must be unique if not null
- `azure_id` must be unique if not null
- `password_hash` OR (`google_id` OR `azure_id`) must be present
- `company_role` must be one of: 'owner', 'admin', 'member'
- Each company must have exactly one 'owner'

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE INDEX (email)
- UNIQUE INDEX (google_id) WHERE google_id IS NOT NULL
- UNIQUE INDEX (azure_id) WHERE azure_id IS NOT NULL
- INDEX (company_id, company_role) - for company member queries
- INDEX (email_verified) - for filtering
- INDEX (deleted_at) - for soft delete queries

**Business Rules**:

- Company owner cannot be removed
- Company owner can promote/demote admins
- User can only access data within their company
- Deleting user removes all ThreadParticipant entries

---

### 3. RefreshToken

**Purpose**: Store refresh tokens for JWT token renewal with revocation capability

**Attributes**:

- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK to User, NOT NULL): Token owner
- `token_hash` (VARCHAR(255), UNIQUE, NOT NULL): bcrypt hashed token
- `expires_at` (TIMESTAMP, NOT NULL): Token expiration (7 days from issue)
- `revoked` (BOOLEAN, DEFAULT FALSE): Revocation status
- `revoked_at` (TIMESTAMP, NULL): When token was revoked
- `created_at` (TIMESTAMP, NOT NULL): Issue timestamp
- `last_used_at` (TIMESTAMP, NULL): Last refresh usage

**Relationships**:

- `user` (N:1 to User)

**Constraints**:

- `expires_at` must be in future when created
- `token_hash` must be unique

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE INDEX (token_hash)
- INDEX (user_id, revoked, expires_at) - for lookup
- INDEX (expires_at) - for cleanup of expired tokens

**Business Rules**:

- Token can only be used once (rotation)
- Expired tokens are ignored
- Revoked tokens cannot be used
- Cleanup job removes tokens expired > 30 days

---

### 4. CompanyInvitation

**Purpose**: Manage email invitations for new company members

**Attributes**:

- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK to Company, NOT NULL): Target company
- `invited_by_user_id` (UUID, FK to User, NOT NULL): Inviter
- `email` (VARCHAR(255), NOT NULL): Invitee email
- `role` (ENUM, NOT NULL): Invited role - 'admin' or 'member' (owner cannot be invited)
- `token` (VARCHAR(255), UNIQUE, NOT NULL): Secure invitation token
- `status` (ENUM, NOT NULL): 'pending', 'accepted', 'expired', 'cancelled'
- `expires_at` (TIMESTAMP, NOT NULL): Expiration date (7 days from creation)
- `accepted_at` (TIMESTAMP, NULL): When invitation was accepted
- `accepted_by_user_id` (UUID, FK to User, NULL): Who accepted (for audit)
- `created_at` (TIMESTAMP, NOT NULL): Creation timestamp
- `updated_at` (TIMESTAMP, NOT NULL): Last update timestamp

**Relationships**:

- `company` (N:1 to Company)
- `invited_by` (N:1 to User as creator)
- `accepted_by` (N:1 to User as acceptor)

**Constraints**:

- `token` must be unique and cryptographically secure
- `role` must be 'admin' or 'member' (not 'owner')
- `expires_at` must be >= 7 days from created_at
- `status` must be one of: 'pending', 'accepted', 'expired', 'cancelled'

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE INDEX (token)
- INDEX (company_id, email, status) - for checking duplicates
- INDEX (status, expires_at) - for cleanup
- INDEX (email) - for lookup

**Business Rules**:

- Only Owner/Admin can create invitations
- Same email can have multiple invitations (resend scenario)
- Token expires after 7 days
- Accepted invitations cannot be reused
- Cancelled invitations cannot be accepted

---

### 5. ThreadParticipant

**Purpose**: Many-to-many relationship between users and threads with role-based permissions

**Attributes**:

- `id` (UUID, PK): Unique identifier
- `thread_id` (UUID, FK to Thread, NOT NULL): Thread reference
- `user_id` (UUID, FK to User, NOT NULL): Participant reference
- `role` (ENUM, NOT NULL): 'owner', 'member', 'viewer'
- `can_invite` (BOOLEAN, DEFAULT TRUE): Can add more participants
- `joined_at` (TIMESTAMP, NOT NULL): When user joined thread
- `last_read_at` (TIMESTAMP, NULL): Last message read timestamp (for unread count)
- `created_at` (TIMESTAMP, NOT NULL): Record creation

**Relationships**:

- `thread` (N:1 to Thread)
- `user` (N:1 to User)

**Constraints**:

- `(thread_id, user_id)` must be unique (composite unique)
- `role` must be one of: 'owner', 'member', 'viewer'
- Each thread must have at least one 'owner'

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE INDEX (thread_id, user_id)
- INDEX (user_id) - for user's threads lookup
- INDEX (thread_id, role) - for permission checks

**Business Rules**:

- Thread creator automatically becomes owner
- Owner can add/remove participants
- Owner can delete thread
- Member can send messages and upload files
- Viewer can only read (shared access)
- Cannot remove last owner
- Removing participant removes their access immediately

---

### 6. Team (Optional)

**Purpose**: Logical grouping of users within a company for easier collaboration

**Attributes**:

- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK to Company, NOT NULL): Company membership
- `name` (VARCHAR(100), NOT NULL): Team name
- `description` (TEXT, NULL): Team description
- `created_at` (TIMESTAMP, NOT NULL): Creation timestamp
- `updated_at` (TIMESTAMP, NOT NULL): Last update timestamp
- `deleted_at` (TIMESTAMP, NULL): Soft delete timestamp

**Relationships**:

- `company` (N:1 to Company)
- `members` (N:M to User via TeamMember)

**Constraints**:

- `(company_id, name)` must be unique (unique team names per company)

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE INDEX (company_id, name)
- INDEX (deleted_at)

**Business Rules**:

- Only Admin can create/delete teams
- Team names must be unique within company
- Deleting team removes all TeamMember entries

---

### 7. TeamMember (Optional)

**Purpose**: Many-to-many relationship between teams and users with roles

**Attributes**:

- `id` (UUID, PK): Unique identifier
- `team_id` (UUID, FK to Team, NOT NULL): Team reference
- `user_id` (UUID, FK to User, NOT NULL): User reference
- `role` (ENUM, NOT NULL): 'leader', 'member'
- `joined_at` (TIMESTAMP, NOT NULL): When user joined team
- `created_at` (TIMESTAMP, NOT NULL): Record creation

**Relationships**:

- `team` (N:1 to Team)
- `user` (N:1 to User)

**Constraints**:

- `(team_id, user_id)` must be unique
- `role` must be 'leader' or 'member'
- User and Team must belong to same company

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE INDEX (team_id, user_id)
- INDEX (user_id) - for user's teams lookup

**Business Rules**:

- Team can have multiple leaders
- Team leader can add/remove members
- Admin can manage all teams

---

## Validation Rules

### User Registration

```typescript
// Email
- Required: true
- Format: RFC 5322 email format
- Max length: 255 characters
- Unique: globally

// Password (if local auth)
- Required: true (unless SSO)
- Min length: 8 characters
- Must contain: uppercase, lowercase, number
- Recommended: special character
- Max length: 100 characters

// Company Name (for first user)
- Required: true (for owner registration)
- Min length: 2 characters
- Max length: 255 characters
- Pattern: alphanumeric, spaces, hyphens

// Company Slug (auto-generated)
- Generated from company name
- Pattern: lowercase, alphanumeric, hyphens
- Unique: globally
- Example: "Acme Corp" → "acme-corp"

// Full Name
- Optional: true
- Max length: 255 characters
```

### Login

```typescript
// Email
- Required: true
- Format: email

// Password
- Required: true
- Min length: 1 (don't reveal min length to attackers)
```

### Invitation

```typescript
// Email
- Required: true
- Format: RFC 5322 email format
- Must not already be company member

// Role
- Required: true
- Allowed values: 'admin', 'member'
- Cannot invite as 'owner'
```

---

## TypeORM Entity Examples

### Company Entity (Conceptual)

```typescript
// Attributes only - no implementation
{
  id: UUID (primary, auto-generated)
  name: string (not null, 2-255 chars)
  slug: string (unique, not null, lowercase)
  plan: 'free' | 'pro' | 'enterprise' (not null, default 'free')
  max_users: number (not null, default 100)
  max_storage_bytes: bigint (not null, default 5GB)
  created_at: Date (auto-generated)
  updated_at: Date (auto-updated)
  deleted_at: Date | null (soft delete)

  // Relations
  users: User[]
  teams: Team[]
  invitations: CompanyInvitation[]
}
```

### User Entity (Conceptual)

```typescript
{
  id: UUID (primary, auto-generated)
  company_id: UUID (foreign key, not null, indexed)
  email: string (unique globally, not null, indexed)
  username: string | null (50 chars max)
  full_name: string | null (255 chars max)
  avatar_url: string | null (500 chars max)
  password_hash: string | null (bcrypt, 255 chars)
  google_id: string | null (unique, indexed)
  azure_id: string | null (unique, indexed)
  company_role: 'owner' | 'admin' | 'member' (not null)
  email_verified: boolean (default false)
  is_active: boolean (default true)
  failed_login_attempts: number (default 0)
  locked_until: Date | null
  last_login_at: Date | null
  created_at: Date (auto-generated)
  updated_at: Date (auto-updated)
  deleted_at: Date | null (soft delete)

  // Relations
  company: Company (many-to-one)
  refresh_tokens: RefreshToken[]
  team_memberships: TeamMember[]
  thread_participations: ThreadParticipant[]
  created_invitations: CompanyInvitation[] (as invited_by)
}
```

### RefreshToken Entity (Conceptual)

```typescript
{
  id: UUID (primary, auto-generated)
  user_id: UUID (foreign key, not null, indexed)
  token_hash: string (unique, not null, bcrypt)
  expires_at: Date (not null, indexed)
  revoked: boolean (default false, indexed)
  revoked_at: Date | null
  created_at: Date (auto-generated)
  last_used_at: Date | null

  // Relations
  user: User (many-to-one)
}
```

### CompanyInvitation Entity (Conceptual)

```typescript
{
  id: UUID (primary, auto-generated)
  company_id: UUID (foreign key, not null)
  invited_by_user_id: UUID (foreign key, not null)
  email: string (not null, 255 chars, indexed)
  role: 'admin' | 'member' (not null)
  token: string (unique, not null, 64 chars)
  status: 'pending' | 'accepted' | 'expired' | 'cancelled' (not null)
  expires_at: Date (not null, 7 days from creation)
  accepted_at: Date | null
  accepted_by_user_id: UUID | null (foreign key)
  created_at: Date (auto-generated)
  updated_at: Date (auto-updated)

  // Relations
  company: Company (many-to-one)
  invited_by: User (many-to-one)
  accepted_by: User | null (many-to-one)
}
```

### ThreadParticipant Entity (Conceptual)

```typescript
{
  id: UUID (primary, auto-generated)
  thread_id: UUID (foreign key, not null)
  user_id: UUID (foreign key, not null)
  role: 'owner' | 'member' | 'viewer' (not null)
  can_invite: boolean (default true)
  joined_at: Date (not null)
  last_read_at: Date | null
  created_at: Date (auto-generated)

  // Relations
  thread: Thread (many-to-one) - from future feature
  user: User (many-to-one)

  // Composite unique constraint
  UNIQUE(thread_id, user_id)
}
```

### Team Entity (Optional, Conceptual)

```typescript
{
  id: UUID (primary, auto-generated)
  company_id: UUID (foreign key, not null)
  name: string (not null, 100 chars)
  description: string | null (text)
  created_at: Date (auto-generated)
  updated_at: Date (auto-updated)
  deleted_at: Date | null (soft delete)

  // Relations
  company: Company (many-to-one)
  members: TeamMember[]

  // Composite unique constraint
  UNIQUE(company_id, name)
}
```

### TeamMember Entity (Optional, Conceptual)

```typescript
{
  id: UUID (primary, auto-generated)
  team_id: UUID (foreign key, not null)
  user_id: UUID (foreign key, not null)
  role: 'leader' | 'member' (not null)
  joined_at: Date (not null)
  created_at: Date (auto-generated)

  // Relations
  team: Team (many-to-one)
  user: User (many-to-one)

  // Composite unique constraint
  UNIQUE(team_id, user_id)
}
```

---

## Database Migrations

### Migration Sequence

1. **CreateCompanyTable** (timestamp: 1)

   - Create companies table with all columns
   - Add indexes (slug, plan, deleted_at)

2. **CreateUserTable** (timestamp: 2)

   - Create users table with all columns
   - Add foreign key to companies (company_id)
   - Add indexes (email, company_id, google_id, azure_id, deleted_at)

3. **CreateRefreshTokenTable** (timestamp: 3)

   - Create refresh_tokens table
   - Add foreign key to users (user_id)
   - Add indexes (token_hash, user_id, expires_at)

4. **CreateCompanyInvitationTable** (timestamp: 4)

   - Create company_invitations table
   - Add foreign keys (company_id, invited_by_user_id, accepted_by_user_id)
   - Add indexes (token, company_id, email, status, expires_at)

5. **CreateThreadParticipantTable** (timestamp: 5)

   - Create thread_participants table (if Thread exists)
   - Add foreign keys (thread_id, user_id)
   - Add composite unique index (thread_id, user_id)

6. **CreateTeamTable** (timestamp: 6, optional)

   - Create teams table
   - Add foreign key to companies (company_id)
   - Add composite unique index (company_id, name)

7. **CreateTeamMemberTable** (timestamp: 7, optional)
   - Create team_members table
   - Add foreign keys (team_id, user_id)
   - Add composite unique index (team_id, user_id)

---

## Data Access Patterns

### Company Isolation Query Pattern

```typescript
// All queries must filter by company_id
const threads = await threadRepo.find({
  where: {
    company_id: currentUser.company_id,
    // ... other conditions
  },
});
```

### Thread Access Check

```typescript
// Check if user can access thread
const canAccess =
  // Is Admin/Owner (audit access)
  currentUser.company_role === "admin" ||
  currentUser.company_role === "owner" ||
  // Is thread participant
  (await threadParticipantRepo.exists({
    where: {
      thread_id: threadId,
      user_id: currentUser.id,
    },
  }));
```

### Invitation Validation

```typescript
// Find valid invitation
const invitation = await invitationRepo.findOne({
  where: {
    token: inviteToken,
    status: "pending",
    expires_at: MoreThan(new Date()),
  },
  relations: ["company"],
});
```

---

## State Transitions

### User Account States

```
[New] → Register → [Unverified Email] → Verify → [Active]
[Active] → Too many failed logins → [Locked]
[Locked] → Wait 15min OR unlock email → [Active]
[Active] → Delete → [Soft Deleted]
[Soft Deleted] → 30 days → [Hard Deleted]
```

### Invitation States

```
[Created] → status: 'pending', expires_at set
[Pending] → Accepted → status: 'accepted', user created
[Pending] → 7 days pass → status: 'expired'
[Pending] → Cancelled by admin → status: 'cancelled'
```

### Refresh Token States

```
[Created] → revoked: false, expires_at set
[Active] → Used for refresh → [Revoked] (rotation)
[Active] → User logout → [Revoked]
[Active] → Expires → [Expired]
[Expired/Revoked] → 30 days → [Deleted]
```

---

## Query Optimization

### Critical Queries

1. **Find user by email**

   - Frequency: Every login
   - Index: email (unique)
   - Expected: O(log n) with B-tree index

2. **Check thread participation**

   - Frequency: Every thread access
   - Index: (thread_id, user_id) composite unique
   - Expected: O(log n)

3. **Get user's threads**

   - Frequency: Thread list page
   - Index: user_id in thread_participants
   - Join: threads table on thread_id
   - Expected: < 100ms for 1000 threads

4. **Find valid invitation**
   - Frequency: Invitation acceptance
   - Index: token (unique)
   - Filter: status, expires_at
   - Expected: O(log n)

---

## Data Integrity Constraints

### Foreign Key Cascades

```sql
-- User deletion
company_id ON DELETE CASCADE  -- Delete users when company deleted
user_id in refresh_tokens ON DELETE CASCADE
user_id in thread_participants ON DELETE CASCADE
user_id in team_members ON DELETE CASCADE

-- Thread deletion (future)
thread_id in thread_participants ON DELETE CASCADE

-- Team deletion
team_id in team_members ON DELETE CASCADE
```

### Check Constraints

```sql
-- Company
CHECK (max_users >= 1)
CHECK (max_storage_bytes >= 0)
CHECK (slug ~ '^[a-z0-9-]+$')

-- User
CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL OR azure_id IS NOT NULL)
CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')

-- CompanyInvitation
CHECK (expires_at > created_at)
CHECK (role IN ('admin', 'member'))

-- ThreadParticipant
CHECK (role IN ('owner', 'member', 'viewer'))
```

---

## Security Considerations

### Password Storage

- Never store plaintext passwords
- Use bcrypt with cost factor 12
- Salt automatically generated per password
- Hash stored in `password_hash` column (60 chars for bcrypt)

### Token Storage

- Access Token: NOT stored in database (stateless JWT)
- Refresh Token: Stored hashed (bcrypt) in database
- Invitation Token: Stored as plain text (single-use, expiring)

### Sensitive Data

- Password hashes: Never included in API responses
- Refresh tokens: Never returned in API (httpOnly cookie)
- Email: Included in responses (not sensitive after registration)

---

## Audit & Compliance

### Audit Log Data Model (Future)

```typescript
{
  id: UUID;
  event_type: string; // 'user.login', 'user.register', 'invitation.created', etc.
  user_id: UUID | null;
  company_id: UUID | null;
  ip_address: string;
  user_agent: string;
  metadata: JSON; // Event-specific data
  created_at: Date;
}
```

### GDPR Compliance

- User deletion: Hard delete after 30-day soft delete period
- Data export: API endpoint to export user data
- Consent tracking: Terms of service acceptance timestamp
- Right to access: User can view their data via profile endpoint

---

## Performance Targets

### Database Queries

- User lookup by email: < 10ms
- Thread participation check: < 50ms
- Company member list (100 users): < 100ms
- Invitation validation: < 20ms

### API Endpoints

- POST /auth/register: < 1000ms (bcrypt hashing included)
- POST /auth/login: < 500ms p95
- POST /auth/refresh: < 200ms p95
- GET /users/me: < 100ms p95

### Concurrent Load

- 100 simultaneous registrations
- 1000 concurrent logins
- 10,000 authorization checks/second

---

## Future Enhancements

### Post-MVP Features

1. **Multi-Company Membership**

   - UserCompanyMembership join table
   - Workspace switcher in UI
   - Current company selection

2. **Advanced SSO**

   - SAML 2.0 for enterprise
   - LDAP integration
   - Custom OAuth providers

3. **Advanced Security**

   - Two-Factor Authentication (2FA)
   - Biometric authentication
   - Security keys (FIDO2/WebAuthn)

4. **Advanced Permissions**

   - Custom role creation
   - Permission templates
   - Granular thread permissions

5. **Audit & Compliance**
   - Complete audit log system
   - SOC 2 compliance
   - HIPAA compliance (if needed)

---

## Implementation Notes

### Transaction Boundaries

**Registration Transaction**:

```
BEGIN TRANSACTION
  1. Create Company
  2. Create User (with company_id)
  3. Commit or rollback both
END TRANSACTION
```

**Invitation Acceptance Transaction**:

```
BEGIN TRANSACTION
  1. Validate invitation token
  2. Create User
  3. Update invitation status to 'accepted'
  4. Commit or rollback all
END TRANSACTION
```

### Error Handling

- Database errors → 500 Internal Server Error
- Validation errors → 400 Bad Request with details
- Auth errors → 401 Unauthorized
- Permission errors → 403 Forbidden
- Rate limit → 429 Too Many Requests
- Account locked → 423 Locked

---

## Dependencies from Other Features

### Depends On (Completed)

- ✅ 001-backend-db-postgres: Database connection, TypeORM setup

### Provides To (Future Features)

- 002-file-upload: User authentication, company isolation
- 003-thread-management: ThreadParticipant entity, access guards
- 004-chat-system: User authentication, real-time auth

---

## Research Complete

All technical decisions finalized. Ready for Phase 1 (Design & Contracts).

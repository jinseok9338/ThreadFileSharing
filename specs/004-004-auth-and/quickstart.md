# Quickstart: Authentication and Permissions System

**Feature**: 004-auth-and-permissions  
**Date**: 2025-10-01  
**Status**: Ready for Implementation

## Overview

This quickstart demonstrates the authentication and permission system with company-based multi-tenancy, local authentication, and thread-level access control.

---

## Prerequisites

- Backend server running (from 001-backend-db-postgres)
- PostgreSQL database accessible
- Node.js 20+ and pnpm installed
- Bruno CLI installed (`npm install -g @usebruno/cli`)

---

## Quick Setup

### 1. Install Dependencies

```bash
cd packages/backend

# Install authentication packages
pnpm add @nestjs/passport passport @nestjs/jwt passport-jwt bcrypt @nestjs/throttler

# Install dev dependencies
pnpm add -D @types/passport-jwt @types/bcrypt
```

### 2. Configure Environment Variables

```bash
# Add to packages/backend/.env
JWT_SECRET=your-super-secret-change-in-production-min-256-bit
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
BCRYPT_ROUNDS=12
FRONTEND_URL=http://localhost:5173
```

### 3. Run Database Migrations

```bash
# Create migrations (after entities are implemented)
pnpm run migration:generate -- src/migrations/CreateCompanyTable
pnpm run migration:generate -- src/migrations/CreateUserTable
pnpm run migration:generate -- src/migrations/CreateRefreshTokenTable
pnpm run migration:generate -- src/migrations/CreateCompanyInvitationTable
pnpm run migration:generate -- src/migrations/CreateThreadParticipantTable

# Run migrations
pnpm run migration:run
```

---

## API Usage Examples

### Scenario 1: Company Owner Registration

**Request**:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@acme.com",
    "password": "SecurePass123!",
    "fullName": "John Doe",
    "companyName": "Acme Corporation"
  }'
```

**Response** (201 Created):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "expiresIn": 900,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "owner@acme.com",
    "fullName": "John Doe",
    "companyRole": "owner",
    "emailVerified": false,
    "isActive": true,
    "createdAt": "2025-10-01T10:00:00Z"
  },
  "company": {
    "id": "987fcdeb-51a2-43e7-b456-426614174111",
    "name": "Acme Corporation",
    "slug": "acme-corporation",
    "plan": "free",
    "maxUsers": 100,
    "maxStorageBytes": 5368709120,
    "createdAt": "2025-10-01T10:00:00Z"
  }
}
```

---

### Scenario 2: Login

**Request**:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@acme.com",
    "password": "SecurePass123!"
  }'
```

**Response** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "660e8400-e29b-41d4-a716-446655440111",
  "expiresIn": 900,
  "user": {
    /* same as register */
  },
  "company": {
    /* same as register */
  }
}
```

---

### Scenario 3: Invite Team Member

**Request** (Owner/Admin only):

```bash
curl -X POST http://localhost:3000/api/v1/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "email": "member@example.com",
    "role": "member"
  }'
```

**Response** (201 Created):

```json
{
  "id": "abc12345-e89b-12d3-a456-426614174222",
  "email": "member@example.com",
  "role": "member",
  "token": "inv_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "status": "pending",
  "expiresAt": "2025-10-08T10:00:00Z",
  "createdAt": "2025-10-01T10:00:00Z"
}
```

**Note**: Invitation email sent to member@example.com with link:
`http://localhost:5173/invite/inv_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

### Scenario 4: Accept Invitation

**Request**:

```bash
curl -X POST http://localhost:3000/api/v1/invitations/accept/inv_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewMemberPass123!",
    "fullName": "Jane Smith"
  }'
```

**Response** (201 Created):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "770e8400-e29b-41d4-a716-446655440333",
  "expiresIn": 900,
  "user": {
    "id": "new-user-uuid",
    "email": "member@example.com",
    "fullName": "Jane Smith",
    "companyRole": "member",
    "emailVerified": false,
    "isActive": true,
    "createdAt": "2025-10-01T11:00:00Z"
  },
  "company": {
    "id": "987fcdeb-51a2-43e7-b456-426614174111",
    "name": "Acme Corporation",
    "slug": "acme-corporation"
  }
}
```

---

### Scenario 5: Refresh Access Token

**Request**:

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "660e8400-e29b-41d4-a716-446655440111"
  }'
```

**Response** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "880e8400-e29b-41d4-a716-446655440444",
  "expiresIn": 900
}
```

**Note**: Old refresh token is revoked (token rotation)

---

### Scenario 6: Get My Profile

**Request**:

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response** (200 OK):

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "owner@acme.com",
  "fullName": "John Doe",
  "companyRole": "owner",
  "emailVerified": false,
  "isActive": true,
  "lastLoginAt": "2025-10-01T10:00:00Z",
  "createdAt": "2025-10-01T10:00:00Z",
  "company": {
    "id": "987fcdeb-51a2-43e7-b456-426614174111",
    "name": "Acme Corporation",
    "slug": "acme-corporation"
  }
}
```

---

### Scenario 7: Logout

**Request**:

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "refreshToken": "880e8400-e29b-41d4-a716-446655440444"
  }'
```

**Response** (200 OK):

```json
{
  "message": "Logged out successfully"
}
```

---

## Bruno Test Examples

### Test 1: Complete Registration Flow

```
POST {{baseUrl}}/auth/register
{
  "email": "test-{{$timestamp}}@example.com",
  "password": "TestPass123!",
  "fullName": "Test User",
  "companyName": "Test Company"
}

Tests:
- Status code is 201
- Response has accessToken
- Response has refreshToken
- user.companyRole === "owner"
- company.name === "Test Company"
- company.plan === "free"
```

### Test 2: Login Flow

```
POST {{baseUrl}}/auth/login
{
  "email": "{{email}}",
  "password": "{{password}}"
}

Tests:
- Status code is 200
- Response has accessToken
- Response has refreshToken
- accessToken is JWT format
```

### Test 3: Invalid Credentials

```
POST {{baseUrl}}/auth/login
{
  "email": "owner@acme.com",
  "password": "WrongPassword"
}

Tests:
- Status code is 401
- Response error message does not reveal if email exists
```

### Test 4: Company Isolation

```
# Create Company A and User A
POST {{baseUrl}}/auth/register { ... }
Save: tokenA, companyA_id

# Create Company B and User B
POST {{baseUrl}}/auth/register { ... }
Save: tokenB, companyB_id

# User A tries to access Company B data
GET {{baseUrl}}/companies/{{companyB_id}}
Authorization: Bearer {{tokenA}}

Tests:
- Status code is 403 or 404
- User A cannot access Company B data
```

### Test 5: Thread Participant Access

```
# User A (thread owner) creates thread
POST {{baseUrl}}/threads
Authorization: Bearer {{tokenA}}
Save: thread_id

# User B (same company, not participant) tries to access
GET {{baseUrl}}/threads/{{thread_id}}
Authorization: Bearer {{tokenB}}

Tests:
- Status code is 403
- Non-participant cannot access thread

# User A adds User B as participant
POST {{baseUrl}}/threads/{{thread_id}}/participants
Authorization: Bearer {{tokenA}}
{ "userId": "{{userB_id}}", "role": "member" }

# User B tries to access again
GET {{baseUrl}}/threads/{{thread_id}}
Authorization: Bearer {{tokenB}}

Tests:
- Status code is 200
- Participant can access thread
```

---

## Development Workflow

### Step 1: Run Backend Server

```bash
cd packages/backend
pnpm run start:dev
```

Server starts on http://localhost:3000

### Step 2: Test with Bruno

```bash
cd tests/bruno
bru run --env local auth/
```

All auth tests should pass.

### Step 3: Manual Testing

1. Open http://localhost:5173 (frontend)
2. Click "Register"
3. Fill in company name, email, password
4. Submit → Should receive tokens and redirect to dashboard
5. Verify company was created in database
6. Verify user has company_role = 'owner'

---

## Database Verification

### Check Company Creation

```sql
SELECT * FROM companies WHERE slug = 'acme-corporation';
```

Expected: 1 row with plan='free', max_users=100

### Check User Creation

```sql
SELECT id, email, company_id, company_role, email_verified
FROM users
WHERE email = 'owner@acme.com';
```

Expected: 1 row with company_role='owner', email_verified=false

### Check Refresh Token

```sql
SELECT id, user_id, revoked, expires_at
FROM refresh_tokens
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC
LIMIT 1;
```

Expected: 1 row with revoked=false, expires_at ~7 days in future

### Check Thread Participant

```sql
SELECT tp.*, u.email, t.name as thread_name
FROM thread_participants tp
JOIN users u ON tp.user_id = u.id
JOIN threads t ON tp.thread_id = t.id
WHERE u.email = 'owner@acme.com';
```

Expected: Rows showing user's thread participations with roles

---

## Troubleshooting

### Issue: "Email already exists"

**Cause**: Email is globally unique, already registered  
**Solution**: Use different email or check if user should join existing company via invitation

### Issue: "Invalid credentials"

**Cause**: Wrong password or email  
**Solution**: Verify email exists in database, check password hash

### Issue: "Account locked"

**Cause**: 5 failed login attempts  
**Solution**: Wait 15 minutes or implement email unlock

### Issue: "Invalid refresh token"

**Cause**: Token expired, revoked, or doesn't exist  
**Solution**: User must log in again

### Issue: "Forbidden - cannot access thread"

**Cause**: User is not thread participant  
**Solution**: Add user as participant or check company membership

---

## Security Testing

### Test 1: Password Hashing

```sql
SELECT password_hash FROM users WHERE email = 'owner@acme.com';
```

Expected: Starts with `$2b$12$` (bcrypt with cost 12)

### Test 2: JWT Token Validation

Decode access token at https://jwt.io

Expected payload:

```json
{
  "sub": "user-uuid",
  "email": "owner@acme.com",
  "companyId": "company-uuid",
  "companyRole": "owner",
  "iat": 1696234567,
  "exp": 1696235467
}
```

### Test 3: Company Isolation

```bash
# User A creates thread
POST {{baseUrl}}/threads (as User A)

# User B (different company) tries to access
GET {{baseUrl}}/threads/{{thread_id}} (as User B)
```

Expected: 403 Forbidden or 404 Not Found

### Test 4: Rate Limiting

```bash
# Attempt login 6 times with wrong password
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

Expected: 6th attempt returns 429 Too Many Requests

---

## Performance Benchmarks

### Registration Performance

```bash
# Benchmark 100 registrations
time for i in {1..100}; do
  curl -X POST http://localhost:3000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user$i@test.com\",\"password\":\"Pass123!\",\"companyName\":\"Company $i\"}" &
done
wait
```

Expected: Complete within 100 seconds (< 1s per registration)

### Login Performance

```bash
# Benchmark 1000 logins
ab -n 1000 -c 10 \
  -p login.json \
  -T "application/json" \
  http://localhost:3000/api/v1/auth/login
```

Expected: p95 < 500ms

---

## Integration Test Scenarios

### Test Suite 1: Full Registration to Thread Access

```typescript
describe("Auth to Thread Access Flow", () => {
  it("should complete full user journey", async () => {
    // 1. Register owner
    const registerRes = await request(app)
      .post("/auth/register")
      .send({
        email: "owner@test.com",
        password: "Pass123!",
        companyName: "Test Co",
      });

    expect(registerRes.status).toBe(201);
    const { accessToken, user, company } = registerRes.body;

    // 2. Create thread
    const threadRes = await request(app)
      .post("/threads")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Test Thread" });

    expect(threadRes.status).toBe(201);
    const { id: threadId } = threadRes.body;

    // 3. Verify thread participant created
    const participants = await threadParticipantRepo.find({
      where: { thread_id: threadId },
    });
    expect(participants).toHaveLength(1);
    expect(participants[0].user_id).toBe(user.id);
    expect(participants[0].role).toBe("owner");

    // 4. Invite another user
    const inviteRes = await request(app)
      .post("/invitations")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email: "member@test.com", role: "member" });

    expect(inviteRes.status).toBe(201);
    const { token: inviteToken } = inviteRes.body;

    // 5. Accept invitation
    const acceptRes = await request(app)
      .post(`/invitations/accept/${inviteToken}`)
      .send({ password: "MemberPass123!", fullName: "Member User" });

    expect(acceptRes.status).toBe(201);
    const { accessToken: memberToken, user: memberUser } = acceptRes.body;

    // 6. Verify member in same company
    expect(memberUser.companyId).toBe(company.id);
    expect(memberUser.companyRole).toBe("member");

    // 7. Member cannot access thread yet
    const threadAccessRes = await request(app)
      .get(`/threads/${threadId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(threadAccessRes.status).toBe(403);

    // 8. Owner adds member to thread
    await request(app)
      .post(`/threads/${threadId}/participants`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId: memberUser.id, role: "member" });

    // 9. Member can now access thread
    const threadAccess2Res = await request(app)
      .get(`/threads/${threadId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(threadAccess2Res.status).toBe(200);
  });
});
```

---

## Common Patterns

### Pattern 1: Authenticated Request

```typescript
// Frontend (using ky or axios)
import API from "~/api/ky";

const getProfile = async () => {
  const response = await API.get("users/me").json();
  return response;
};

// Token automatically added by interceptor
// Automatic refresh if 401
```

### Pattern 2: Role-Based Access

```typescript
// Frontend
import { useUserStore } from "~/stores/userStore";

function AdminPanel() {
  const { user } = useUserStore();

  if (user.companyRole !== "admin" && user.companyRole !== "owner") {
    return <Redirect to="/dashboard" />;
  }

  return <AdminContent />;
}
```

### Pattern 3: Thread Access Check

```typescript
// Backend (in service)
async canAccessThread(userId: string, threadId: string): Promise<boolean> {
  const user = await userRepo.findOne({ where: { id: userId } });

  // Admin can access all threads
  if (user.company_role === 'admin' || user.company_role === 'owner') {
    return true;
  }

  // Check participation
  const participant = await threadParticipantRepo.findOne({
    where: { thread_id: threadId, user_id: userId }
  });

  return !!participant;
}
```

---

## Next Steps

1. ✅ Review this quickstart guide
2. ✅ Run `/tasks` to generate implementation tasks
3. ✅ Follow TDD: Write tests first
4. ✅ Implement entities and migrations
5. ✅ Implement services and controllers
6. ✅ Test with Bruno
7. ✅ Integrate with frontend

---

## Reference

- [Spec](./spec.md) - Feature specification
- [Plan](./plan.md) - Implementation plan
- [Research](./research.md) - Technical decisions
- [Data Model](./data-model.md) - Complete entity schemas
- [API Contract](./contracts/auth-api.json) - OpenAPI specification

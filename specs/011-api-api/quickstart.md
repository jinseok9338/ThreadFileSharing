# Quickstart: Comprehensive API Testing Suite

**Feature**: 011-api-api  
**Date**: 2025-10-04  
**Status**: Implementation Ready

## Overview

This quickstart guide provides step-by-step instructions for executing the comprehensive API testing suite. The testing suite covers all API endpoints, success/failure scenarios, permission levels, and generates automated test scripts for documentation.

## Prerequisites

### System Requirements

- Node.js 20+ and npm/yarn
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 6+
- Bruno API Testing Framework

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd ThreadFileSharing

# Install dependencies
npm install

# Start services
docker-compose up -d postgres redis

# Run database migrations
cd packages/backend
npm run migration:run

# Start backend server
npm run start:dev
```

## Test Execution Workflow

### Phase 1: Test Environment Setup

1. **Initialize Test Database**

   ```bash
   # Create test database
   createdb threadfilesharing_test

   # Run test migrations
   npm run migration:run -- --env test

   # Seed test data
   npm run seed:test
   ```

2. **Configure Test Environment**

   ```bash
   # Set environment variables
   export NODE_ENV=test
   export DATABASE_URL=postgresql://user:pass@localhost:5432/threadfilesharing_test
   export REDIS_URL=redis://localhost:6379/1
   export JWT_SECRET=test-secret-key
   ```

3. **Start Test Services**

   ```bash
   # Start test backend
   npm run start:test

   # Verify services are running
   curl http://localhost:3001/api/v1/health
   ```

### Phase 2: Authentication & Authorization Testing

#### 2.1 User Registration Testing

```bash
# Test 1: Successful user registration
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_owner@example.com",
    "password": "password123",
    "fullName": "Test Owner",
    "companyName": "Test Company"
  }'

# Expected: 201 Created with user, company, and tokens

# Test 2: Duplicate email registration
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_owner@example.com",
    "password": "password123",
    "fullName": "Test Owner 2",
    "companyName": "Test Company 2"
  }'

# Expected: 409 Conflict

# Test 3: Invalid email format
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "fullName": "Test User",
    "companyName": "Test Company"
  }'

# Expected: 400 Bad Request
```

#### 2.2 User Login Testing

```bash
# Test 1: Successful login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_owner@example.com",
    "password": "password123"
  }'

# Expected: 200 OK with user and tokens

# Test 2: Invalid credentials
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_owner@example.com",
    "password": "wrongpassword"
  }'

# Expected: 401 Unauthorized

# Test 3: Non-existent user
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'

# Expected: 401 Unauthorized
```

#### 2.3 Token Validation Testing

```bash
# Extract token from login response
TOKEN="your-jwt-token-here"

# Test 1: Valid token access
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with user information

# Test 2: Invalid token
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized

# Test 3: Expired token (test with expired token)
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer expired-token"

# Expected: 401 Unauthorized
```

### Phase 3: User Management Testing

#### 3.1 Create User Testing

```bash
# Test 1: Admin creates user successfully
curl -X POST http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_member@example.com",
    "password": "password123",
    "fullName": "Test Member",
    "role": "MEMBER"
  }'

# Expected: 201 Created

# Test 2: Regular user attempts to create user
curl -X POST http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_member2@example.com",
    "password": "password123",
    "fullName": "Test Member 2",
    "role": "MEMBER"
  }'

# Expected: 403 Forbidden

# Test 3: Invalid user data
curl -X POST http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123",
    "fullName": "",
    "role": "INVALID_ROLE"
  }'

# Expected: 400 Bad Request
```

#### 3.2 Update User Testing

```bash
# Test 1: Admin updates user
curl -X PUT http://localhost:3001/api/v1/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Test Member",
    "username": "updated_member"
  }'

# Expected: 200 OK

# Test 2: User updates own profile
curl -X PUT http://localhost:3001/api/v1/users/$USER_ID \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "My Updated Name"
  }'

# Expected: 200 OK

# Test 3: User attempts to update other user
curl -X PUT http://localhost:3001/api/v1/users/$OTHER_USER_ID \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Unauthorized Update"
  }'

# Expected: 403 Forbidden
```

### Phase 4: Company Management Testing

#### 4.1 Company Information Testing

```bash
# Test 1: Owner gets company information
curl -X GET http://localhost:3001/api/v1/companies/me \
  -H "Authorization: Bearer $OWNER_TOKEN"

# Expected: 200 OK with company details

# Test 2: Member gets company information
curl -X GET http://localhost:3001/api/v1/companies/me \
  -H "Authorization: Bearer $MEMBER_TOKEN"

# Expected: 200 OK with company details

# Test 3: Non-member attempts to access company
curl -X GET http://localhost:3001/api/v1/companies/me \
  -H "Authorization: Bearer $OTHER_COMPANY_TOKEN"

# Expected: 404 Not Found
```

#### 4.2 Company Update Testing

```bash
# Test 1: Owner updates company
curl -X PUT http://localhost:3001/api/v1/companies/me \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Company",
    "domain": "updated-test.com"
  }'

# Expected: 200 OK

# Test 2: Admin updates company
curl -X PUT http://localhost:3001/api/v1/companies/me \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Updated Company"
  }'

# Expected: 200 OK

# Test 3: Member attempts to update company
curl -X PUT http://localhost:3001/api/v1/companies/me \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Update"
  }'

# Expected: 403 Forbidden
```

### Phase 5: Chatroom Management Testing

#### 5.1 Create Chatroom Testing

```bash
# Test 1: Company member creates chatroom
curl -X POST http://localhost:3001/api/v1/chatrooms \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Chatroom",
    "description": "Test chatroom description",
    "isPrivate": false
  }'

# Expected: 201 Created

# Test 2: Non-member attempts to create chatroom
curl -X POST http://localhost:3001/api/v1/chatrooms \
  -H "Authorization: Bearer $OTHER_COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Chatroom",
    "description": "Should not be created"
  }'

# Expected: 403 Forbidden

# Test 3: Invalid chatroom data
curl -X POST http://localhost:3001/api/v1/chatrooms \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "description": "x".repeat(501)
  }'

# Expected: 400 Bad Request
```

#### 5.2 Chatroom Access Testing

```bash
# Test 1: Chatroom member accesses chatroom
curl -X GET http://localhost:3001/api/v1/chatrooms/$CHATROOM_ID \
  -H "Authorization: Bearer $MEMBER_TOKEN"

# Expected: 200 OK

# Test 2: Non-member attempts to access chatroom
curl -X GET http://localhost:3001/api/v1/chatrooms/$CHATROOM_ID \
  -H "Authorization: Bearer $OTHER_COMPANY_TOKEN"

# Expected: 403 Forbidden

# Test 3: Non-existent chatroom
curl -X GET http://localhost:3001/api/v1/chatrooms/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $MEMBER_TOKEN"

# Expected: 404 Not Found
```

### Phase 6: Thread Management Testing

#### 6.1 Create Thread Testing

```bash
# Test 1: Chatroom member creates thread
curl -X POST http://localhost:3001/api/v1/threads \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatroomId": "'$CHATROOM_ID'",
    "title": "Test Thread",
    "description": "Test thread description"
  }'

# Expected: 201 Created

# Test 2: Non-member attempts to create thread
curl -X POST http://localhost:3001/api/v1/threads \
  -H "Authorization: Bearer $OTHER_COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatroomId": "'$CHATROOM_ID'",
    "title": "Unauthorized Thread"
  }'

# Expected: 403 Forbidden

# Test 3: Thread in non-existent chatroom
curl -X POST http://localhost:3001/api/v1/threads \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatroomId": "00000000-0000-0000-0000-000000000000",
    "title": "Invalid Thread"
  }'

# Expected: 404 Not Found
```

### Phase 7: Message System Testing

#### 7.1 Send Message Testing

```bash
# Test 1: Chatroom member sends message
curl -X POST http://localhost:3001/api/v1/messages \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatroomId": "'$CHATROOM_ID'",
    "content": "Hello, this is a test message!"
  }'

# Expected: 201 Created

# Test 2: Non-member attempts to send message
curl -X POST http://localhost:3001/api/v1/messages \
  -H "Authorization: Bearer $OTHER_COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatroomId": "'$CHATROOM_ID'",
    "content": "Unauthorized message"
  }'

# Expected: 403 Forbidden

# Test 3: Message with thread reference
curl -X POST http://localhost:3001/api/v1/messages \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatroomId": "'$CHATROOM_ID'",
    "content": "Please check #Test Thread for more details"
  }'

# Expected: 201 Created with threadReferences array
```

#### 7.2 Get Messages Testing

```bash
# Test 1: Get chatroom messages
curl -X GET "http://localhost:3001/api/v1/messages/chatroom/$CHATROOM_ID?limit=10" \
  -H "Authorization: Bearer $MEMBER_TOKEN"

# Expected: 200 OK with messages array

# Test 2: Get thread messages
curl -X GET "http://localhost:3001/api/v1/messages/thread/$THREAD_ID?limit=10" \
  -H "Authorization: Bearer $MEMBER_TOKEN"

# Expected: 200 OK with messages array

# Test 3: Non-member attempts to get messages
curl -X GET "http://localhost:3001/api/v1/messages/chatroom/$CHATROOM_ID" \
  -H "Authorization: Bearer $OTHER_COMPANY_TOKEN"

# Expected: 403 Forbidden
```

### Phase 8: File Management Testing

#### 8.1 File Upload Testing

```bash
# Test 1: Initiate file upload
curl -X POST http://localhost:3001/api/v1/files/upload/initiate \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test-file.txt",
    "size": 1024,
    "mimeType": "text/plain",
    "chatroomId": "'$CHATROOM_ID'"
  }'

# Expected: 201 Created with upload session

# Test 2: Upload file chunk
curl -X POST http://localhost:3001/api/v1/files/upload/chunk \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -F "sessionId=$SESSION_ID" \
  -F "chunk=@test-file.txt" \
  -F "chunkIndex=0"

# Expected: 200 OK with upload progress

# Test 3: File too large
curl -X POST http://localhost:3001/api/v1/files/upload/initiate \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "huge-file.txt",
    "size": 1073741824,
    "mimeType": "text/plain"
  }'

# Expected: 413 Payload Too Large
```

#### 8.2 File Access Testing

```bash
# Test 1: Get file metadata
curl -X GET http://localhost:3001/api/v1/files/$FILE_ID \
  -H "Authorization: Bearer $MEMBER_TOKEN"

# Expected: 200 OK with file details

# Test 2: Download file
curl -X GET http://localhost:3001/api/v1/files/download/$FILE_ID \
  -H "Authorization: Bearer $MEMBER_TOKEN"

# Expected: 200 OK with file content

# Test 3: Non-member attempts to access file
curl -X GET http://localhost:3001/api/v1/files/$FILE_ID \
  -H "Authorization: Bearer $OTHER_COMPANY_TOKEN"

# Expected: 403 Forbidden
```

### Phase 9: Security Testing

#### 9.1 SQL Injection Testing

```bash
# Test 1: SQL injection in search parameter
curl -X GET "http://localhost:3001/api/v1/users?search='; DROP TABLE users; --" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: 400 Bad Request or safe handling

# Test 2: SQL injection in path parameter
curl -X GET "http://localhost:3001/api/v1/users/1'; DROP TABLE users; --" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: 400 Bad Request or safe handling
```

#### 9.2 XSS Prevention Testing

```bash
# Test 1: XSS in message content
curl -X POST http://localhost:3001/api/v1/messages \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatroomId": "'$CHATROOM_ID'",
    "content": "<script>alert('XSS')</script>"
  }'

# Expected: 201 Created with sanitized content

# Test 2: XSS in user profile
curl -X PUT http://localhost:3001/api/v1/users/$USER_ID \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "<script>alert('XSS')</script>"
  }'

# Expected: 200 OK with sanitized content
```

#### 9.3 Rate Limiting Testing

```bash
# Test 1: Rapid login attempts
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpassword"
    }'
done

# Expected: Rate limiting after threshold

# Test 2: Rapid API requests
for i in {1..100}; do
  curl -X GET http://localhost:3001/api/v1/auth/me \
    -H "Authorization: Bearer $TOKEN"
done

# Expected: Rate limiting after threshold
```

### Phase 10: Performance Testing

#### 10.1 Load Testing

```bash
# Test 1: Concurrent user creation
for i in {1..50}; do
  curl -X POST http://localhost:3001/api/v1/users \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"test_user_$i@example.com\",
      \"password\": \"password123\",
      \"fullName\": \"Test User $i\",
      \"role\": \"MEMBER\"
    }" &
done
wait

# Expected: All requests processed within acceptable time

# Test 2: Concurrent message sending
for i in {1..100}; do
  curl -X POST http://localhost:3001/api/v1/messages \
    -H "Authorization: Bearer $MEMBER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"chatroomId\": \"$CHATROOM_ID\",
      \"content\": \"Test message $i\"
    }" &
done
wait

# Expected: All messages processed correctly
```

## Test Validation Checklist

### Success Criteria

- [ ] All API endpoints respond with expected status codes
- [ ] Authentication and authorization work correctly
- [ ] Permission matrix is properly enforced
- [ ] Data validation prevents invalid inputs
- [ ] Security measures block malicious requests
- [ ] Performance meets acceptable thresholds
- [ ] Error handling provides meaningful messages
- [ ] File operations work correctly
- [ ] Real-time features function properly
- [ ] Thread reference system works as expected

### Failure Scenarios

- [ ] Invalid credentials return 401
- [ ] Insufficient permissions return 403
- [ ] Missing resources return 404
- [ ] Invalid data returns 400
- [ ] Server errors return 500
- [ ] Rate limiting works correctly
- [ ] Security measures block attacks
- [ ] File size limits are enforced
- [ ] Concurrent access is handled properly

## Test Data Cleanup

### After Test Execution

```bash
# Clean up test database
dropdb threadfilesharing_test

# Clean up test files
rm -rf uploads/test/*

# Clean up Redis test data
redis-cli -n 1 FLUSHDB

# Stop test services
docker-compose down
```

## Automated Test Script Generation

### Generate Test Scripts

```bash
# Run Bruno tests and generate documentation
cd tests/bruno
bruno test --format json --output test-results.json

# Generate test scripts from results
node automation/script-generator.js test-results.json

# Generate comprehensive documentation
node automation/documentation-generator.js test-results.json
```

### Output Files

- `test-scripts.md` - Executable test scripts for documentation
- `test-results.html` - Detailed test execution results
- `test-coverage.json` - Test coverage analysis
- `api-documentation.md` - Complete API documentation with examples

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify PostgreSQL is running and accessible
2. **Authentication Failures**: Check JWT secret and token expiration
3. **Permission Errors**: Verify user roles and company associations
4. **File Upload Issues**: Check file size limits and storage permissions
5. **Rate Limiting**: Adjust rate limit settings for testing
6. **Memory Issues**: Monitor memory usage during load testing

### Debug Commands

```bash
# Check service status
curl http://localhost:3001/api/v1/health

# Check database connection
psql -h localhost -U postgres -d threadfilesharing_test -c "SELECT 1"

# Check Redis connection
redis-cli ping

# View application logs
tail -f packages/backend/server.log

# Check memory usage
ps aux | grep node
```

## Conclusion

This comprehensive API testing suite validates all aspects of the ThreadFileSharing application, ensuring reliability, security, and performance. The automated test script generation provides complete documentation for all test scenarios, making it easy to maintain and extend the testing coverage.

For additional information, refer to the detailed test documentation generated by the automation scripts.

# Quickstart: API Scenario Test Improvements

**Feature**: 012- API Scenario Test Improvements  
**Date**: 2025-01-05  
**Status**: Ready for Implementation

## Overview

This quickstart guide provides step-by-step instructions for improving existing API scenario tests to accurately reflect the current backend implementation. The focus is on updating test expectations for features that are actually implemented but incorrectly expected to fail.

## Prerequisites

- Backend server running on `http://localhost:3001`
- Test database properly configured
- Existing test infrastructure (Bruno, Jest, ApiTestHelper)
- Access to test files in `tests/scenarios/api/`

## Quick Validation Steps

### Step 1: Verify Backend Implementation Status

Before updating tests, validate which features are actually implemented:

```bash
# Check if file deletion API is implemented
curl -X DELETE http://localhost:3001/api/v1/files/test-file-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check if thread-file association API is implemented
curl -X GET http://localhost:3001/api/v1/threads/test-thread-id/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check if user role management API is implemented
curl -X PUT http://localhost:3001/api/v1/users/test-user-id/role \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

### Step 2: Run Existing Scenario Tests

Execute the current scenario tests to see which ones are failing due to incorrect expectations:

```bash
# Run all scenario tests
cd tests/scenarios/api
npm test

# Run specific scenario tests
node thread-file-sharing-flow.test.js
node file-upload-auto-thread.test.js
node role-permission-flow.test.js
```

### Step 3: Identify Test Improvements Needed

Based on the unimplemented features report and backend analysis, focus on these priority areas:

1. **File Management Tests** (HIGH Priority)

   - Update file deletion tests to expect success (200) instead of error (404)
   - Update file upload completion tests to expect success (200) instead of error (404)

2. **Thread-File Relationship Tests** (HIGH Priority)

   - Update thread file list retrieval tests to expect success (200) instead of error (404)
   - Update file association tests to expect success (201) instead of error (404)
   - Update file removal tests to expect success (200) instead of error (404)

3. **User Role Management Tests** (HIGH Priority)

   - Update user role update tests to expect success (200) instead of error (404)
   - Add proper validation for role-based access control

4. **Company Member Management Tests** (MEDIUM Priority)

   - Update company member list tests to expect success (200) instead of error (404)
   - Update member addition tests to expect success (201) instead of error (404)

5. **Storage Quota Management Tests** (MEDIUM Priority)
   - Update storage quota retrieval tests to expect success (200) instead of error (404)
   - Update quota recalculation tests to expect success (200) instead of error (404)

## Implementation Workflow

### Phase 1: Individual Test Updates

For each test file that needs improvement:

1. **Backup the original test file**

   ```bash
   cp thread-file-sharing-flow.test.js thread-file-sharing-flow.test.js.backup
   ```

2. **Update test expectations**

   - Change status code expectations from 404/500 to 200/201
   - Update response schema validations
   - Add proper success data validation

3. **Run the updated test**

   ```bash
   node thread-file-sharing-flow.test.js
   ```

4. **Validate results**
   - Ensure test passes with new expectations
   - Verify response data matches expected schema
   - Confirm no regression in other test cases

### Phase 2: Integration Validation

1. **Run full test suite**

   ```bash
   cd tests/scenarios/api
   npm test
   ```

2. **Check test coverage**

   - Ensure all implemented features are properly tested
   - Verify no test coverage regression
   - Confirm improved test reliability

3. **Validate API contracts**
   - Run Bruno API tests to validate contracts
   - Ensure all endpoints return expected responses
   - Verify authentication and authorization work correctly

## Specific Test Updates

### File Deletion Test Update

**Before (Incorrect Expectation):**

```javascript
// Expected 404 error for unimplemented feature
const validation = this.helper.validateErrorResponse(result.result, 404);
```

**After (Correct Expectation):**

```javascript
// Expect 200 success for implemented feature
const validation = this.helper.validateResponse(result.result, 200, [
  "status",
  "data.fileId",
  "data.message",
]);
```

### Thread-File Association Test Update

**Before (Incorrect Expectation):**

```javascript
// Expected 404 error for unimplemented feature
const validation = this.helper.validateErrorResponse(result.result, 404);
```

**After (Correct Expectation):**

```javascript
// Expect 201 success for implemented feature
const validation = this.helper.validateResponse(result.result, 201, [
  "status",
  "data.threadId",
  "data.fileId",
]);
```

### User Role Management Test Update

**Before (Incorrect Expectation):**

```javascript
// Expected 404 error for unimplemented feature
const validation = this.helper.validateErrorResponse(result.result, 404);
```

**After (Correct Expectation):**

```javascript
// Expect 200 success for implemented feature
const validation = this.helper.validateResponse(result.result, 200, [
  "status",
  "data.userId",
  "data.role",
]);
```

## Validation Checklist

After implementing test improvements, verify:

- [ ] All updated tests pass with new expectations
- [ ] No existing passing tests were broken
- [ ] Test execution time remains reasonable
- [ ] Test coverage is maintained or improved
- [ ] API contracts match actual backend behavior
- [ ] Error handling tests still work for genuinely unimplemented features
- [ ] Authentication and authorization tests are properly validated

## Troubleshooting

### Common Issues

1. **Test still fails after expectation update**

   - Verify backend is actually implemented for that endpoint
   - Check if authentication/authorization is properly configured
   - Ensure test data is valid and accessible

2. **Response schema mismatch**

   - Compare actual API response with expected schema
   - Update schema expectations to match backend implementation
   - Validate all required fields are present

3. **Authentication errors**
   - Ensure JWT tokens are valid and not expired
   - Check if user has proper permissions for the operation
   - Verify authentication headers are correctly set

### Debug Commands

```bash
# Check backend logs for errors
docker logs backend-container

# Test API endpoint directly
curl -v -X GET http://localhost:3001/api/v1/threads/test-thread-id/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Run specific test with debug output
DEBUG=* node thread-file-sharing-flow.test.js
```

## Success Criteria

The test improvements are successful when:

1. **Test Accuracy**: All tests accurately reflect backend implementation status
2. **Test Reliability**: Fewer false failures due to incorrect expectations
3. **Feature Validation**: Implemented features are properly tested and validated
4. **Maintainability**: Tests are easier to understand and maintain
5. **Coverage**: Test coverage is maintained or improved

## Next Steps

After completing test improvements:

1. **Document Changes**: Update test documentation with new expectations
2. **CI/CD Integration**: Ensure updated tests pass in CI/CD pipeline
3. **Team Communication**: Inform team about test expectation changes
4. **Monitoring**: Monitor test reliability and performance over time
5. **Future Updates**: Establish process for keeping tests in sync with backend changes

## Support

For questions or issues with test improvements:

1. Check the unimplemented features report for context
2. Review backend API documentation
3. Consult the test improvement contracts
4. Refer to the data model for test structure guidance

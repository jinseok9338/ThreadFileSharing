# Quickstart: 백엔드 API 문서 개선 및 Swagger 응답 스키마 보완

**Date**: 2025-10-06  
**Branch**: `016-api-swagger-cursor`  
**Target**: Complete API documentation with consistent pagination

## Prerequisites

### Required Tools

- **Node.js**: v18+ (for backend development)
- **Docker**: v20+ (for containerized services)
- **Git**: v2.30+ (for version control)
- **VS Code**: Recommended IDE with TypeScript support

### Required Dependencies

```bash
# Backend dependencies (already installed)
@nestjs/swagger: ^7.0.0
class-validator: ^0.14.0
class-transformer: ^0.5.1
```

### Environment Setup

```bash
# Clone and setup
git clone <repository-url>
cd ThreadFileSharing
npm install

# Start backend services
docker-compose up -d postgres redis
cd packages/backend
npm run start:dev
```

## Quick Start Guide

### 1. Access Current Swagger Documentation

**Swagger UI**: http://localhost:3001/docs  
**Swagger JSON**: http://localhost:3001/docs-json

### 2. Identify Documentation Gaps

**Current Issues to Fix**:

- Missing response schemas in many endpoints
- Inconsistent pagination parameters (`cursor` vs `lastIndex`)
- Incomplete error response documentation
- Missing examples for complex endpoints

### 3. Controller Analysis Order

Follow alphabetical order for systematic review:

1. **AuthController** (`/api/v1/auth/*`)
2. **ChatroomController** (`/api/v1/chatrooms/*`)
3. **CompanyController** (`/api/v1/companies/*`)
4. **FileController** (`/api/v1/files/*`)
5. **MessageController** (`/api/v1/messages/*`)
6. **ThreadController** (`/api/v1/threads/*`)

### 4. Documentation Standards

**Response Schema Pattern**:

```typescript
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Operation completed successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Success message' },
      data: { $ref: '#/components/schemas/YourResponseDto' }
    }
  }
})
```

**Error Response Pattern**:

```typescript
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Bad Request - Validation error',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Validation failed' },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          details: { type: 'array', items: { type: 'object' } }
        }
      }
    }
  }
})
```

**Pagination Parameter Pattern**:

```typescript
@ApiQuery({
  name: 'lastIndex',
  description: 'Cursor for pagination - Base64 encoded JSON containing createdAt and id',
  required: false,
  example: 'eyJjcmVhdGVkQXQiOiIyMDI1LTEwLTA2VDEyOjAwOjAwLjAwMFoiLCJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCJ9'
})
```

## Implementation Steps

### Step 1: Parameter Standardization

**Fix Cursor Pagination Parameters**:

```bash
# Find all pagination endpoints
grep -r "cursor" packages/backend/src --include="*.ts"
grep -r "lastIndex" packages/backend/src --include="*.ts"

# Update inconsistent parameters
# Replace @ApiQuery({ name: 'cursor' }) with @ApiQuery({ name: 'lastIndex' })
```

**Files to Update**:

- `packages/backend/src/file/controllers/file.controller.ts`
- `packages/backend/src/thread/controllers/thread.controller.ts`
- Any other controllers using `cursor` parameter

### Step 2: Response Schema Completion

**Add Missing @ApiResponse Decorators**:

```typescript
// Example: Complete response documentation
@Get(':id')
@ApiOperation({ summary: 'Get resource by ID' })
@ApiParam({ name: 'id', description: 'Resource ID' })
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Resource retrieved successfully',
  schema: { $ref: '#/components/schemas/ResourceResponseDto' }
})
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Resource not found',
  schema: { $ref: '#/components/schemas/ErrorResponse' }
})
async getResource(@Param('id') id: string): Promise<any> {
  // Implementation
}
```

### Step 3: Error Response Documentation

**Document All Error Cases**:

```typescript
// Standard error responses for all endpoints
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Internal Server Error' })
```

### Step 4: Example Enhancement

**Add Working Examples**:

```typescript
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Success response',
  schema: { $ref: '#/components/schemas/ResponseDto' },
  examples: {
    success: {
      summary: 'Successful response example',
      value: {
        success: true,
        message: 'Operation completed',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Example Resource'
        }
      }
    }
  }
})
```

## Validation & Testing

### Step 1: Swagger UI Validation

**Check Documentation Completeness**:

1. Open http://localhost:3001/docs
2. Navigate through all controllers
3. Verify all endpoints have complete documentation
4. Test all examples in Swagger UI
5. Check pagination parameters are consistent

### Step 2: API Response Validation

**Verify Response Schemas**:

```bash
# Test API endpoints and verify responses match documentation
curl -X GET "http://localhost:3001/api/v1/messages/chatroom/123?lastIndex=eyJjcmVhdGVkQXQiOiIyMDI1LTEwLTA2VDEyOjAwOjAwLjAwMFoiLCJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCJ9" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Error Response Testing

**Test Error Scenarios**:

```bash
# Test 400 Bad Request
curl -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Test 401 Unauthorized
curl -X GET "http://localhost:3001/api/v1/users/me"

# Test 404 Not Found
curl -X GET "http://localhost:3001/api/v1/users/nonexistent-id" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expected Outcomes

### Documentation Completeness

- ✅ All 6 controllers have complete response schemas
- ✅ All pagination endpoints use `lastIndex` parameter
- ✅ All error cases (400, 401, 403, 404, 500) are documented
- ✅ All endpoints have working examples

### Developer Experience

- ✅ Swagger UI loads in < 1s
- ✅ All examples work correctly
- ✅ No missing or incorrect documentation
- ✅ Consistent patterns across all controllers

### API Consistency

- ✅ Uniform parameter naming across all endpoints
- ✅ Consistent error response formats
- ✅ Standardized pagination implementation
- ✅ Complete response schema documentation

## Troubleshooting

### Common Issues

**Swagger UI Not Loading**:

```bash
# Check if backend is running
curl http://localhost:3001/health

# Restart backend if needed
cd packages/backend
npm run start:dev
```

**Missing Response Schemas**:

```bash
# Check for missing @ApiResponse decorators
grep -r "@ApiResponse" packages/backend/src --include="*.ts" | wc -l
grep -r "@Get\|@Post\|@Put\|@Delete" packages/backend/src --include="*.ts" | wc -l
# These numbers should be similar
```

**Pagination Parameter Issues**:

```bash
# Find inconsistent pagination parameters
grep -r "cursor" packages/backend/src --include="*.ts"
grep -r "lastIndex" packages/backend/src --include="*.ts"
```

### Performance Issues

**Slow Swagger UI**:

- Check for circular references in response schemas
- Verify all DTOs have proper @ApiProperty decorators
- Ensure examples are not too large or complex

**Documentation Generation Errors**:

- Check for missing imports in DTOs
- Verify all referenced schemas exist
- Ensure proper TypeScript types are used

## Next Steps

After completing the quickstart:

1. **Run Full Test Suite**: Execute all API tests to ensure no regressions
2. **Performance Testing**: Verify Swagger UI performance meets requirements
3. **Documentation Review**: Review all documentation for accuracy and completeness
4. **Deployment**: Deploy updated documentation to staging/production

---

**Quickstart Complete** - Ready for detailed implementation tasks

# Research: 백엔드 API 문서 개선 및 Swagger 응답 스키마 보완

**Date**: 2025-10-06  
**Branch**: `016-api-swagger-cursor`  
**Phase**: 0 - Research & Analysis

## Executive Summary

백엔드 API 문서의 완전성을 향상시키고 Swagger 응답 스키마를 보완하여 개발자 경험을 개선하는 프로젝트입니다. 현재 Swagger 문서에서 많은 엔드포인트의 응답 스키마가 누락되어 있고, cursor pagination 파라미터가 `cursor`와 `lastIndex`로 혼재되어 사용되고 있어 일관성이 부족한 상황입니다.

## Current State Analysis

### Controllers Overview

**1. AuthController** (`/api/v1/auth/*`)

- **Endpoints**: 8개 (register, login, refresh, logout, me, change-password, forgot-password, reset-password)
- **Documentation Status**: 부분적 - 일부 응답 스키마 누락
- **Pagination**: 없음
- **Issues**: Error response documentation 불완전

**2. ChatroomController** (`/api/v1/chatrooms/*`)

- **Endpoints**: 6개 (create, list, get, update, delete, members)
- **Documentation Status**: 양호 - 대부분 문서화됨
- **Pagination**: 없음
- **Issues**: Member management response schemas 불완전

**3. CompanyController** (`/api/v1/companies/*`)

- **Endpoints**: 8개 (create, list, get, update, delete, members, invitations, roles)
- **Documentation Status**: 부분적 - 복잡한 nested objects 문서화 부족
- **Pagination**: 없음
- **Issues**: Company member management response schemas 복잡

**4. FileController** (`/api/v1/files/*`)

- **Endpoints**: 12개 (upload, list, get, delete, download, storage, quota 등)
- **Documentation Status**: 불완전 - 많은 응답 스키마 누락
- **Pagination**: 있음 (list endpoint)
- **Issues**: File upload response schemas 복잡, pagination parameter 불일치

**5. MessageController** (`/api/v1/messages/*`)

- **Endpoints**: 8개 (send, list, get, update, delete, replies, search 등)
- **Documentation Status**: 부분적 - pagination response schemas 불완전
- **Pagination**: 있음 (chatroom messages, thread messages)
- **Issues**: Cursor pagination parameter 불일치 (`cursor` vs `lastIndex`)

**6. ThreadController** (`/api/v1/threads/*`)

- **Endpoints**: 10개 (create, list, get, update, delete, archive, files, participants 등)
- **Documentation Status**: 불완전 - thread-file relationship schemas 누락
- **Pagination**: 있음 (list endpoint)
- **Issues**: Thread participant management response schemas 복잡

### Cursor Pagination Analysis

**Current Implementation**:

- **MessageController**: `/api/v1/messages/chatroom/{chatroomId}` - Uses `lastIndex`
- **FileController**: `/api/v1/files` - Uses `cursor` (inconsistent)
- **ThreadController**: `/api/v1/threads` - Uses `cursor` (inconsistent)

**Parameter Format**:

- `lastIndex`: Base64 encoded JSON `{"createdAt": "ISO string", "id": "UUID"}`
- `cursor`: Same format but different parameter name

**Response Format**:

- `nextCursor`: Base64 encoded JSON for next page
- `hasMore`: boolean indicating more pages available

### Documentation Gaps

**Missing Response Schemas**:

1. **AuthController**: Password reset, forgot password responses
2. **ChatroomController**: Member management responses
3. **CompanyController**: Invitation system responses
4. **FileController**: Upload progress, storage quota responses
5. **MessageController**: Search results, reply threads
6. **ThreadController**: File associations, participant management

**Inconsistent Error Documentation**:

- Some endpoints document 400, 401, 403, 404, 500
- Others only document 200 success cases
- Error message formats vary across controllers

**Missing Examples**:

- Complex nested objects lack examples
- Pagination usage examples missing
- File upload flow examples incomplete

## Technical Architecture

### Swagger Configuration

**Current Setup**:

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle("Thread File Sharing API")
  .setDescription("API for thread-based file sharing system")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("docs", app, document);
```

**Response Interceptor**:

```typescript
// All responses wrapped in standard format
{
  success: boolean,
  message: string,
  data: any,
  meta?: {
    pagination?: {
      nextCursor?: string,
      hasMore: boolean,
      total?: number
    }
  }
}
```

### DTO Structure

**Response DTOs**:

- Most controllers have response DTOs
- Some complex nested objects lack proper DTOs
- Error response DTOs are inconsistent

**Validation DTOs**:

- Request DTOs are well documented
- Query parameter DTOs exist but documentation incomplete
- Pagination DTOs need standardization

## Research Findings

### Best Practices Identified

**1. Consistent Parameter Naming**:

- Use `lastIndex` consistently across all pagination endpoints
- Remove `cursor` parameter references from documentation
- Standardize pagination response format

**2. Complete Response Documentation**:

- All endpoints need `@ApiResponse` decorators
- Response DTOs need `@ApiProperty` decorators
- Error responses need consistent documentation

**3. Example-Driven Documentation**:

- Provide working examples for all endpoints
- Include pagination usage examples
- Show error response examples

### Implementation Strategy

**Phase 1: Parameter Standardization**:

- Update all pagination endpoints to use `lastIndex`
- Remove `cursor` parameter from documentation
- Update query DTOs to use consistent naming

**Phase 2: Response Schema Completion**:

- Add missing `@ApiResponse` decorators
- Complete response DTO documentation
- Standardize error response formats

**Phase 3: Example Enhancement**:

- Add comprehensive examples to all endpoints
- Create pagination usage examples
- Document error scenarios with examples

**Phase 4: Validation & Testing**:

- Validate all endpoints against documented schemas
- Test Swagger UI functionality
- Ensure backward compatibility

## Risk Assessment

**Low Risk**:

- Documentation improvements only
- No breaking changes to API contracts
- Backward compatibility maintained

**Medium Risk**:

- Parameter name changes might affect existing clients
- Response schema changes could break client expectations
- Swagger UI might have display issues with complex schemas

**Mitigation Strategies**:

- Maintain backward compatibility for parameter names
- Gradual rollout of documentation improvements
- Comprehensive testing of Swagger UI

## Success Metrics

**Documentation Completeness**:

- 100% of endpoints have complete response schemas
- 100% of pagination endpoints use `lastIndex`
- 100% of error cases documented

**Developer Experience**:

- Swagger UI loads in < 1s
- All examples work correctly
- No missing or incorrect documentation

**Consistency**:

- Uniform parameter naming across all endpoints
- Consistent error response formats
- Standardized pagination implementation

## Next Steps

1. **Controller Analysis**: Systematic review of all 6 controllers
2. **Gap Documentation**: Create comprehensive gap analysis
3. **Implementation Planning**: Define detailed implementation tasks
4. **Testing Strategy**: Plan validation and testing approach

---

**Research Phase Complete** - Ready for Phase 1: Design & Contracts

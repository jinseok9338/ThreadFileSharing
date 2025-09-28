# Main Layout Wireframe

<!-- 메인 레이아웃의 와이어프레임을 ASCII 아트로 문서화합니다 -->

## Backend API Layout Structure

<!-- API 엔드포인트 구조 설계 -->

### Health Check Endpoints

```
GET /health              - Basic health status
GET /health/database     - Database connection status
GET /health/ready        - Readiness probe
GET /health/live         - Liveness probe
```

### API Response Structure

```json
{
  "status": "ok|error",
  "timestamp": "ISO-8601",
  "data": {},
  "error": {
    "message": "string",
    "details": {}
  }
}
```

## Component Specifications

<!-- API 컴포넌트별 상세 명세 -->

### Health Check Components

- Status monitoring endpoints
- Database connectivity validation
- Application readiness indicators
- Error response formatting

## State Management

<!-- API 상태 관리 -->

### Application States

- Healthy/Unhealthy status
- Database connection state
- Migration execution status
- Environment configuration state

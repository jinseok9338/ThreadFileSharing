# Research: 웹소켓 단위 테스트 보완 및 개선

**Feature**: 013-websocket-unit-test-improvements  
**Date**: 2025-10-06  
**Status**: Complete

## Research Questions & Findings

### 1. 기존 웹소켓 테스트 파일들의 현재 상태 분석

**Decision**: 7개 테스트 파일이 존재하며, 각각 특정 웹소켓 기능을 테스트함

**Rationale**:

- `test-websocket-simple.js`: 기본 연결 테스트
- `test-websocket-auth.js`: JWT 인증 테스트
- `test-websocket-events.js`: 기본 이벤트 테스트
- `test-websocket-events-detailed.js`: 상세 이벤트 테스트
- `test-file-upload-websocket.js`: 파일 업로드 연동 테스트
- `test-websocket-with-new-chatroom.js`: 새 채팅방 생성 테스트
- `test-storage-fix.js`: 스토리지 할당량 테스트

**Alternatives considered**:

- 새로운 테스트 파일 생성 → 기존 구조 유지로 결정
- 기존 파일 삭제 후 재작성 → 점진적 개선으로 결정

### 2. 백엔드 WebSocket Gateway 구현과의 차이점 식별

**Decision**: 백엔드는 완전한 WebSocket Gateway가 구현되어 있음

**Rationale**:

- `packages/backend/src/websocket/gateway/websocket.gateway.ts`: 537줄의 완전한 구현
- Socket.io 기반으로 연결, 인증, 룸 관리, 메시지 처리 모두 구현됨
- `WebSocketAuthService`, `WebSocketRoomService` 등 지원 서비스도 완비
- 37개의 DTO가 정의되어 다양한 이벤트 타입 지원

**Alternatives considered**:

- 백엔드 구현 부족 가정 → 실제로는 완전히 구현됨을 확인
- 부분적 구현 가정 → 전체 기능이 구현되어 있음을 확인

### 3. 동적 토큰 생성 구현 방법 연구

**Decision**: 기존 API 테스트 헬퍼의 registerUser/loginUser 메서드 활용

**Rationale**:

- `tests/scenarios/api/helpers/api-test-helper.js`에 이미 구현된 인증 헬퍼 활용
- JWT 토큰 발급 API (`/api/v1/auth/register`, `/api/v1/auth/login`) 사용
- 하드코딩된 토큰을 동적으로 생성된 토큰으로 교체

**Alternatives considered**:

- Mock 인증 방식 → 실제 백엔드와 통신하는 방식 선택
- 새로운 인증 시스템 구축 → 기존 헬퍼 재사용으로 결정

### 4. 비즈니스 로직 검증 방법 정의

**Decision**: 연결 + 데이터 + 비즈니스 로직 3단계 검증

**Rationale**:

- **연결 검증**: WebSocket 연결 성공/실패, 인증 통과/실패
- **데이터 검증**: 이벤트 데이터 구조, 필수 필드 존재, 타입 검증
- **비즈니스 로직 검증**: 메시지 전달, 권한 검증, 룸 조인/나가기, 상태 관리

**Alternatives considered**:

- 연결만 검증 → 비즈니스 로직까지 검증하는 것으로 확장
- 전체 통합 검증 → 단계적 검증으로 복잡도 관리

### 5. 테스트 실행 환경 및 의존성 분석

**Decision**: 기존 package.json 구조 유지하며 socket.io-client 의존성 활용

**Rationale**:

- `tests/websocket_test/package.json`에 이미 필요한 의존성 설치됨
- socket.io-client 4.8.1, axios, form-data, jsonwebtoken 등
- Docker Compose 환경에서 백엔드 서버와 통신

**Alternatives considered**:

- 새로운 의존성 추가 → 기존 의존성으로 충분함을 확인
- 다른 WebSocket 클라이언트 라이브러리 → Socket.io 표준 유지

### 6. 테스트 개선 우선순위 및 범위

**Decision**: 이벤트 처리 테스트 우선, 전반적 테스트 재검토

**Rationale**:

- 이벤트 처리가 웹소켓의 핵심 기능
- `test-websocket-events.js`, `test-websocket-events-detailed.js` 우선 개선
- 모든 7개 파일을 순차적으로 개선하여 전체 커버리지 확보

**Alternatives considered**:

- 인증 테스트 우선 → 이벤트 처리 테스트 우선으로 변경
- 파일 업로드 테스트 우선 → 이벤트 처리 테스트 우선으로 변경

## Technical Decisions

### 1. 테스트 구조 유지

- 기존 7개 테스트 파일 구조 유지
- Node.js 스크립트 방식 유지 (Jest 프레임워크 도입하지 않음)
- 점진적 개선 방식 채택

### 2. 인증 방식 개선

- 하드코딩된 JWT 토큰 제거
- 동적 토큰 생성 (API 호출을 통한 토큰 발급)
- 기존 ApiTestHelper 활용

### 3. 검증 수준 강화

- 연결 성공/실패 검증
- 이벤트 데이터 구조 검증
- 비즈니스 로직 검증 (권한, 메시지 전달, 상태 관리)

### 4. 백엔드 연동

- 실제 백엔드 WebSocket Gateway와 통신
- Docker Compose 환경에서 테스트 실행
- 실제 데이터베이스와 연동

## Dependencies & Constraints

### Required Services

- NestJS 백엔드 서버 (포트 3001)
- PostgreSQL 데이터베이스
- Redis (세션 저장용)

### Test Dependencies

- socket.io-client 4.8.1+
- axios 1.7.0+
- form-data 4.0.1+
- jsonwebtoken 9.0.2+

### Environment Requirements

- Node.js 18+
- Docker & Docker Compose
- 네트워크 연결 (localhost:3001)

## Risk Assessment

### Low Risk

- 기존 테스트 구조 유지로 안정성 확보
- 백엔드 구현이 완료되어 있어 통신 가능
- 필요한 의존성이 이미 설치되어 있음

### Medium Risk

- 하드코딩된 토큰 제거 시 테스트 안정성 영향
- 동적 토큰 생성으로 인한 테스트 실행 시간 증가

### Mitigation Strategies

- 백업 파일 생성 후 점진적 개선
- 토큰 캐싱으로 성능 최적화
- 에러 처리 강화로 안정성 확보

## Next Steps

1. **Phase 1 실행**: 데이터 모델 및 계약 정의
2. **Task 생성**: 구체적인 구현 작업 정의
3. **단계별 구현**: 이벤트 처리 테스트부터 순차적 개선
4. **통합 검증**: 전체 테스트 스위트 실행 및 검증

---

**Research Status**: Complete  
**Ready for Phase 1**: Yes  
**Blockers**: None

# Data Model: 웹소켓 단위 테스트 보완 및 개선

**Feature**: 013-websocket-unit-test-improvements  
**Date**: 2025-10-06  
**Status**: Complete

## Core Entities

### WebSocketConnection

웹소켓 클라이언트와 서버 간의 실시간 양방향 통신 연결을 나타냄

**Attributes**:

- `id`: string - 연결 고유 식별자
- `userId`: string - 연결된 사용자 ID
- `companyId`: string - 사용자가 속한 회사 ID
- `status`: ConnectionStatus - 연결 상태 (CONNECTED, DISCONNECTED, RECONNECTING)
- `authenticated`: boolean - 인증 상태
- `joinedRooms`: Set<string> - 참여 중인 룸 목록
- `lastActivity`: Date - 마지막 활동 시간
- `connectionTime`: Date - 연결 시작 시간

**Relationships**:

- belongs to User (userId)
- belongs to Company (companyId)
- has many WebSocketMessages
- participates in many WebSocketRooms

**State Transitions**:

```
DISCONNECTED → CONNECTING → CONNECTED
CONNECTED → DISCONNECTING → DISCONNECTED
CONNECTED → RECONNECTING → CONNECTED
```

### WebSocketMessage

실시간으로 전송되는 데이터 패킷

**Attributes**:

- `id`: string - 메시지 고유 식별자
- `type`: MessageType - 메시지 타입 (TEXT, FILE, SYSTEM, ERROR)
- `event`: string - Socket.io 이벤트 이름
- `data`: object - 메시지 페이로드
- `timestamp`: Date - 전송 시간
- `fromUserId`: string - 발신자 ID
- `toRoomId`: string - 대상 룸 ID (선택적)
- `acknowledged`: boolean - 수신 확인 여부

**Relationships**:

- belongs to WebSocketConnection (fromUserId)
- belongs to WebSocketRoom (toRoomId, optional)

**Validation Rules**:

- event는 필수 필드
- data는 JSON 직렬화 가능해야 함
- timestamp는 현재 시간보다 과거일 수 없음

### WebSocketRoom

웹소켓 연결이 참여할 수 있는 논리적 그룹

**Attributes**:

- `id`: string - 룸 고유 식별자
- `type`: RoomType - 룸 타입 (COMPANY, CHATROOM, THREAD, USER_SESSION)
- `name`: string - 룸 이름
- `participants`: Set<string> - 참여자 사용자 ID 목록
- `createdAt`: Date - 룸 생성 시간
- `metadata`: object - 룸별 추가 메타데이터

**Relationships**:

- has many WebSocketConnections (participants)
- has many WebSocketMessages (toRoomId)

**Business Rules**:

- COMPANY 룸은 회사 전체 사용자가 자동 참여
- CHATROOM/THREAD 룸은 명시적 조인 필요
- USER_SESSION 룸은 개별 사용자 전용

### WebSocketTestSuite

웹소켓 기능을 검증하는 테스트 모음

**Attributes**:

- `id`: string - 테스트 스위트 고유 식별자
- `name`: string - 테스트 스위트 이름
- `description`: string - 테스트 설명
- `testCases`: WebSocketTestCase[] - 포함된 테스트 케이스 목록
- `executionTime`: number - 실행 시간 (밀리초)
- `successRate`: number - 성공률 (0-1)
- `lastRun`: Date - 마지막 실행 시간

**Relationships**:

- contains many WebSocketTestCase
- generates many WebSocketTestResult

### WebSocketTestCase

개별 웹소켓 테스트 케이스

**Attributes**:

- `id`: string - 테스트 케이스 고유 식별자
- `name`: string - 테스트 케이스 이름
- `description`: string - 테스트 설명
- `steps`: TestStep[] - 테스트 실행 단계
- `expectedResults`: ExpectedResult[] - 예상 결과
- `timeout`: number - 타임아웃 (밀리초)
- `retryCount`: number - 재시도 횟수

**Relationships**:

- belongs to WebSocketTestSuite
- generates many WebSocketTestResult

### WebSocketTestResult

테스트 실행 결과

**Attributes**:

- `id`: string - 결과 고유 식별자
- `testCaseId`: string - 테스트 케이스 ID
- `status`: TestStatus - 테스트 상태 (PASSED, FAILED, TIMEOUT, ERROR)
- `executionTime`: number - 실행 시간 (밀리초)
- `errorMessage`: string - 에러 메시지 (실패 시)
- `actualResults`: object - 실제 결과
- `timestamp`: Date - 테스트 실행 시간

**Relationships**:

- belongs to WebSocketTestCase

## Authentication & Authorization

### TestUser

테스트 실행용 사용자 계정

**Attributes**:

- `email`: string - 사용자 이메일
- `password`: string - 사용자 비밀번호
- `companyName`: string - 회사 이름
- `role`: UserRole - 사용자 역할 (OWNER, MEMBER)
- `accessToken`: string - JWT 액세스 토큰
- `refreshToken`: string - JWT 리프레시 토큰
- `tokenExpiry`: Date - 토큰 만료 시간

**Relationships**:

- creates many WebSocketConnection
- participates in many WebSocketRoom

**Business Rules**:

- 테스트용 계정은 동적으로 생성
- 토큰 만료 시 자동 갱신
- 테스트 완료 후 정리

## Enums & Constants

### ConnectionStatus

```typescript
enum ConnectionStatus {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTING = "DISCONNECTING",
  DISCONNECTED = "DISCONNECTED",
  RECONNECTING = "RECONNECTING",
  ERROR = "ERROR",
}
```

### MessageType

```typescript
enum MessageType {
  TEXT = "TEXT",
  FILE = "FILE",
  SYSTEM = "SYSTEM",
  ERROR = "ERROR",
  ACKNOWLEDGMENT = "ACKNOWLEDGMENT",
}
```

### RoomType

```typescript
enum RoomType {
  COMPANY = "COMPANY",
  CHATROOM = "CHATROOM",
  THREAD = "THREAD",
  USER_SESSION = "USER_SESSION",
  UPLOAD_SESSION = "UPLOAD_SESSION",
}
```

### TestStatus

```typescript
enum TestStatus {
  PASSED = "PASSED",
  FAILED = "FAILED",
  TIMEOUT = "TIMEOUT",
  ERROR = "ERROR",
  SKIPPED = "SKIPPED",
}
```

### UserRole

```typescript
enum UserRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
  READ_ONLY = "READ_ONLY",
}
```

## Data Validation Rules

### WebSocketConnection

- userId는 UUID 형식이어야 함
- companyId는 UUID 형식이어야 함
- status는 ConnectionStatus 열거형 값이어야 함
- joinedRooms은 중복되지 않은 문자열 배열이어야 함

### WebSocketMessage

- event는 비어있지 않은 문자열이어야 함
- data는 JSON 직렬화 가능한 객체여야 함
- timestamp는 유효한 Date 객체여야 함
- fromUserId는 UUID 형식이어야 함

### WebSocketRoom

- id는 고유한 문자열이어야 함
- type은 RoomType 열거형 값이어야 함
- participants는 중복되지 않은 UUID 배열이어야 함

## Performance Considerations

### Connection Limits

- 동시 연결 수: 최대 100개 (테스트 환경)
- 메시지 처리 속도: 초당 1000개 메시지
- 연결 타임아웃: 10초

### Memory Management

- 연결당 최대 메모리 사용량: 1MB
- 메시지 히스토리 보관: 최대 100개
- 자동 가비지 컬렉션: 5분마다

### Test Execution

- 테스트 타임아웃: 30초
- 재시도 횟수: 최대 3회
- 병렬 테스트: 최대 5개 동시 실행

---

**Data Model Status**: Complete  
**Ready for Contracts**: Yes  
**Validation**: All entities and relationships defined with proper constraints

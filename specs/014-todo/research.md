# Research: 백엔드 TODO 항목 구현 완료

**Date**: 2025-10-06  
**Feature**: 백엔드 TODO 항목 구현 완료  
**Status**: Complete

## Research Findings

### 1. WebSocket 메시지 저장 패턴 및 트랜잭션 관리

**Decision**: NestJS WebSocket Gateway에서 메시지 저장 시 트랜잭션 관리 패턴 사용

**Rationale**:

- WebSocket 이벤트는 실시간성이 중요하므로 메시지 저장 실패 시에도 클라이언트에게 적절한 에러 응답 필요
- 데이터베이스 저장과 WebSocket 이벤트 전송을 분리하여 안정성 확보
- 트랜잭션 롤백 시 클라이언트에게 에러 이벤트 전송

**Alternatives considered**:

- 동기식 저장: 성능 저하 및 실시간성 저해
- 비동기식 저장: 데이터 일관성 문제
- 이벤트 소싱: 복잡성 증가로 인한 과도한 설계

**Implementation Pattern**:

```typescript
// 1. 메시지 저장 시도
try {
  const message = await this.messageService.createMessage(messageData);
  // 2. 성공 시 WebSocket 이벤트 전송
  client.emit("message_saved", { messageId: message.id });
} catch (error) {
  // 3. 실패 시 에러 이벤트 전송
  client.emit("message_error", { error: error.message });
}
```

### 2. 실제 역할 조회를 위한 서비스 통합 방법

**Decision**: ThreadService와 CompanyService를 WebSocket Gateway에 주입하여 실제 역할 조회

**Rationale**:

- 기존 서비스 로직 재사용으로 코드 중복 방지
- 일관된 역할 관리 시스템 유지
- 테스트 가능한 구조 유지

**Alternatives considered**:

- 직접 데이터베이스 쿼리: 서비스 로직 중복
- 별도 역할 서비스: 불필요한 복잡성
- 캐싱 시스템: 실시간 역할 변경 반영 지연

**Implementation Pattern**:

```typescript
// WebSocket Gateway에서 서비스 주입
constructor(
  private threadService: ThreadService,
  private companyService: CompanyService,
) {}

// 실제 역할 조회
const threadRole = await this.threadService.getUserRole(threadId, userId);
const companyRole = await this.companyService.getUserRole(companyId, userId);
```

### 3. 멤버십 검증을 위한 권한 시스템 설계

**Decision**: 기존 ChatroomService와 ThreadService의 멤버십 검증 메서드 활용

**Rationale**:

- 기존 권한 시스템과 일관성 유지
- 중복 코드 방지
- 테스트된 로직 재사용

**Alternatives considered**:

- 새로운 권한 서비스: 기존 시스템과 불일치
- 직접 데이터베이스 쿼리: 권한 로직 분산
- 외부 권한 시스템: 과도한 복잡성

**Implementation Pattern**:

```typescript
// 채팅방 멤버십 검증
const isMember = await this.chatroomService.isUserMember(chatroomId, userId);
if (!isMember) {
  throw new ForbiddenException("Not a member of this chatroom");
}

// 스레드 참여 검증
const isParticipant = await this.threadService.isUserParticipant(
  threadId,
  userId
);
if (!isParticipant) {
  throw new ForbiddenException("Not a participant of this thread");
}
```

### 4. 체크섬 검증을 위한 암호화 해시 함수 구현

**Decision**: Node.js crypto 모듈의 SHA-256 해시 함수 사용

**Rationale**:

- 표준 암호화 알고리즘으로 보안성 확보
- Node.js 내장 모듈로 의존성 최소화
- 파일 무결성 검증에 적합한 성능

**Alternatives considered**:

- MD5: 보안 취약점
- SHA-1: 보안 취약점
- 외부 암호화 라이브러리: 불필요한 의존성

**Implementation Pattern**:

```typescript
import * as crypto from 'crypto';

private calculateChunkChecksum(chunkData: Buffer): string {
  return crypto.createHash('sha256').update(chunkData).digest('hex');
}

private validateChunkChecksum(chunkData: Buffer, expectedChecksum: string): boolean {
  const calculatedChecksum = this.calculateChunkChecksum(chunkData);
  return calculatedChecksum === expectedChecksum;
}
```

### 5. 자동 생성 기능을 위한 서비스 간 통신 패턴

**Decision**: 기존 MessageService와 ThreadService를 FileUploadService에 주입하여 직접 호출

**Rationale**:

- 간단하고 직관적인 서비스 간 통신
- 트랜잭션 관리 용이
- 에러 처리 단순화

**Alternatives considered**:

- 이벤트 기반 통신: 복잡성 증가
- 메시지 큐: 과도한 설계
- 별도 통합 서비스: 불필요한 레이어

**Implementation Pattern**:

```typescript
// FileUploadService에서 다른 서비스 주입
constructor(
  private messageService: MessageService,
  private threadService: ThreadService,
) {}

// 파일 업로드 완료 시 자동 생성
if (uploadRequest.chatroomId && !uploadRequest.createThread) {
  const message = await this.messageService.createMessage({
    chatroomId: uploadRequest.chatroomId,
    content: `파일이 업로드되었습니다: ${file.originalName}`,
    messageType: 'FILE_SHARE',
    senderId: userId,
  });
}

if (uploadRequest.createThread) {
  const thread = await this.threadService.createThread({
    title: uploadRequest.threadTitle || file.originalName,
    description: uploadRequest.threadDescription || `${file.originalName}에 대한 논의`,
    createdBy: userId,
  });
}
```

### 6. WebSocket 브로드캐스팅 패턴

**Decision**: UploadProgressService에서 WebSocket Gateway를 주입하여 직접 브로드캐스팅

**Rationale**:

- 실시간 업로드 진행률 알림
- 기존 WebSocket 인프라 재사용
- 단순한 구현 패턴

**Alternatives considered**:

- 이벤트 기반 브로드캐스팅: 복잡성 증가
- 별도 WebSocket 서비스: 중복 코드
- HTTP 폴링: 실시간성 저해

**Implementation Pattern**:

```typescript
// UploadProgressService에서 WebSocket Gateway 주입
constructor(
  private websocketGateway: WebSocketGateway,
) {}

// 업로드 진행률 브로드캐스팅
async broadcastUploadProgress(sessionId: string, progress: number) {
  this.websocketGateway.server.to(`upload_session:${sessionId}`).emit('file_upload_progress', {
    sessionId,
    progress,
    timestamp: new Date(),
  });
}
```

## 우선순위별 구현 전략

### 높은 우선순위 (핵심 기능)

1. **메시지 저장 및 ID 생성**: WebSocket Gateway에서 MessageService 통합
2. **실제 역할 조회**: ThreadService, CompanyService 주입 및 활용
3. **멤버십 검증**: 기존 서비스 메서드 활용
4. **체크섬 검증**: crypto 모듈을 사용한 SHA-256 구현

### 중간 우선순위 (기능 완성)

1. **채팅방/스레드 자동 생성**: FileUploadService에서 다른 서비스 주입
2. **답글 데이터 조회**: MessageService에 답글 조회 메서드 추가
3. **WebSocket 브로드캐스팅**: UploadProgressService에서 Gateway 주입

### 낮은 우선순위 (최적화)

1. **회사 기반 접근 제어**: 기존 권한 시스템 확장
2. **스레드 메시지 필터링**: MessageService에 필터링 로직 추가

## 기술적 제약사항

1. **기존 API 호환성**: WebSocket 이벤트 구조 변경 시 기존 클라이언트 호환성 유지
2. **성능 최적화**: 메시지 저장 시 트랜잭션 시간 최소화
3. **에러 처리**: 모든 TODO 구현 시 적절한 에러 처리 및 로깅
4. **테스트 커버리지**: 모든 새로운 기능에 대한 단위 테스트 및 통합 테스트 작성

## 결론

모든 TODO 항목은 기존 서비스 아키텍처를 활용하여 구현 가능하며, 새로운 복잡성을 추가하지 않고 시스템의 완전성을 확보할 수 있습니다. 우선순위에 따른 단계적 구현을 통해 시스템 안정성을 유지하면서 기능을 완성할 수 있습니다.

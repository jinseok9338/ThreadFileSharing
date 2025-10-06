# Quickstart Guide: 백엔드 TODO 항목 구현 완료

**Date**: 2025-10-06  
**Feature**: 백엔드 TODO 항목 구현 완료  
**Status**: Ready for Implementation

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/ThreadFileSharing

# 의존성 설치
npm install

# Docker 서비스 시작
docker-compose up -d

# 백엔드 서비스 시작
cd packages/backend
npm run start:dev
```

### 2. 구현 우선순위

#### 🔥 높은 우선순위 (핵심 기능)

**1. WebSocket 메시지 저장 및 ID 생성**

```typescript
// WebSocket Gateway에서 MessageService 통합
@SubscribeMessage('send_chatroom_message')
async handleSendChatroomMessage(
  @ConnectedSocket() client: AuthenticatedSocket,
  @MessageBody() data: SendChatroomMessageDto,
) {
  try {
    // 실제 메시지 저장
    const message = await this.messageService.createMessage({
      chatroomId: data.chatroomId,
      senderId: client.userId,
      content: data.content,
      messageType: data.messageType || 'TEXT',
      replyToId: data.replyToId,
    });

    // 실제 메시지 ID로 이벤트 전송
    client.emit('chatroom_message_received', {
      messageId: message.id, // 실제 ID 사용
      chatroomId: data.chatroomId,
      sender: this.authService.getSocketInfo(client),
      content: data.content,
      messageType: data.messageType || 'TEXT',
      createdAt: message.createdAt,
    });
  } catch (error) {
    client.emit('error', { message: error.message });
  }
}
```

**2. 실제 역할 조회**

```typescript
// ThreadService에서 실제 역할 조회
async getUserRole(threadId: string, userId: string): Promise<string> {
  const participation = await this.threadParticipationRepository.findOne({
    where: { threadId, userId },
  });

  return participation?.role || 'MEMBER';
}

// WebSocket Gateway에서 실제 역할 사용
const threadRole = await this.threadService.getUserRole(data.threadId, client.userId);
client.emit('user_joined_thread', {
  threadId: data.threadId,
  user: this.authService.getSocketInfo(client),
  threadRole: threadRole, // 실제 역할 사용
  joinedAt: new Date(),
});
```

**3. 멤버십 검증**

```typescript
// ChatroomService에서 멤버십 검증
async isUserMember(chatroomId: string, userId: string): Promise<boolean> {
  const membership = await this.chatroomMembershipRepository.findOne({
    where: { chatroomId, userId, status: 'ACTIVE' },
  });

  return !!membership;
}

// WebSocket Room Service에서 실제 검증
case 'chatroom':
  const isMember = await this.chatroomService.isUserMember(id, socket.userId);
  if (!isMember) {
    throw new ForbiddenException('Not a member of this chatroom');
  }
  break;
```

**4. 체크섬 검증**

```typescript
// ChunkedUploadService에서 실제 체크섬 검증
import * as crypto from 'crypto';

private calculateChunkChecksum(chunkData: Buffer): string {
  return crypto.createHash('sha256').update(chunkData).digest('hex');
}

async validateChunk(chunkDto: ChunkDto): Promise<void> {
  const chunkBuffer = Buffer.from(chunkDto.chunkData, 'base64');
  const calculatedChecksum = this.calculateChunkChecksum(chunkBuffer);

  if (calculatedChecksum !== chunkDto.chunkChecksum) {
    throw new BadRequestException('Chunk checksum validation failed');
  }
}
```

#### ⚡ 중간 우선순위 (기능 완성)

**5. 채팅방/스레드 자동 생성**

```typescript
// FileUploadService에서 자동 생성
async createAutoActions(file: File, uploadRequest: any, userId: string) {
  const autoActions = {};

  // 채팅방 메시지 자동 생성
  if (uploadRequest.chatroomId && !uploadRequest.createThread) {
    const message = await this.messageService.createMessage({
      chatroomId: uploadRequest.chatroomId,
      senderId: userId,
      content: `파일이 업로드되었습니다: ${file.originalName}`,
      messageType: 'FILE_SHARE',
    });

    autoActions.chatroomMessage = {
      messageId: message.id, // 실제 ID 사용
      content: message.content,
      messageType: message.messageType,
    };
  }

  // 스레드 자동 생성
  if (uploadRequest.createThread) {
    const thread = await this.threadService.createThread({
      title: uploadRequest.threadTitle || file.originalName,
      description: uploadRequest.threadDescription || `${file.originalName}에 대한 논의`,
      createdBy: userId,
    });

    autoActions.threadCreated = {
      threadId: thread.id, // 실제 ID 사용
      title: thread.title,
      description: thread.description,
    };
  }

  return autoActions;
}
```

**6. 답글 데이터 조회**

```typescript
// MessageService에서 답글 데이터 조회
async getReplyData(messageId: string): Promise<ReplyData> {
  const message = await this.messageRepository.findOne({
    where: { id: messageId },
    relations: ['sender', 'replyTo', 'replyTo.sender'],
  });

  if (!message?.replyTo) {
    throw new NotFoundException('Reply data not found');
  }

  return {
    originalMessage: {
      id: message.replyTo.id,
      content: message.replyTo.content,
      sender: message.replyTo.sender,
      createdAt: message.replyTo.createdAt,
    },
    replyMessage: {
      id: message.id,
      content: message.content,
      sender: message.sender,
      createdAt: message.createdAt,
    },
  };
}
```

**7. WebSocket 브로드캐스팅**

```typescript
// UploadProgressService에서 WebSocket 브로드캐스팅
constructor(
  private websocketGateway: WebSocketGateway,
) {}

async broadcastUploadProgress(sessionId: string, progress: number) {
  this.websocketGateway.server
    .to(`upload_session:${sessionId}`)
    .emit('file_upload_progress', {
      sessionId,
      progress,
      timestamp: new Date(),
    });
}
```

### 3. 테스트 실행

#### 단위 테스트

```bash
# 백엔드 단위 테스트
cd packages/backend
npm run test

# 특정 서비스 테스트
npm run test -- --testPathPattern=message.service.spec.ts
npm run test -- --testPathPattern=thread.service.spec.ts
npm run test -- --testPathPattern=file-upload.service.spec.ts
```

#### 통합 테스트

```bash
# WebSocket 통합 테스트
cd tests/websocket_test
node test-websocket-messages.js
node test-role-membership.js
node test-file-upload-validation.js
```

#### API 테스트 (Bruno)

```bash
# 메시지 API 테스트
bruno run tests/bruno/messages/

# 역할 및 멤버십 API 테스트
bruno run tests/bruno/roles/

# 파일 업로드 API 테스트
bruno run tests/bruno/file-upload/
```

### 4. 검증 체크리스트

#### ✅ WebSocket 메시지 저장

- [ ] 채팅방 메시지가 데이터베이스에 저장됨
- [ ] 스레드 메시지가 데이터베이스에 저장됨
- [ ] 실제 메시지 ID가 WebSocket 이벤트에 포함됨
- [ ] 메시지 저장 실패 시 에러 이벤트 전송됨

#### ✅ 실제 역할 조회

- [ ] 스레드 역할이 ThreadService에서 조회됨
- [ ] 회사 역할이 CompanyService에서 조회됨
- [ ] 역할이 없는 경우 기본값(MEMBER) 사용됨
- [ ] WebSocket 이벤트에 실제 역할이 포함됨

#### ✅ 멤버십 검증

- [ ] 채팅방 멤버십이 실제로 검증됨
- [ ] 스레드 참여가 실제로 검증됨
- [ ] 업로드 세션 접근이 실제로 검증됨
- [ ] 권한 없는 접근 시 적절한 에러 반환됨

#### ✅ 체크섬 검증

- [ ] SHA-256 체크섬이 올바르게 계산됨
- [ ] 체크섬 불일치 시 업로드 실패 처리됨
- [ ] 체크섬 검증이 모든 청크에 적용됨
- [ ] 체크섬 계산 성능이 적절함

#### ✅ 자동 생성 기능

- [ ] 파일 업로드 완료 시 채팅방 메시지 자동 생성됨
- [ ] 스레드 생성 요청 시 실제 스레드 생성됨
- [ ] 생성된 메시지/스레드의 실제 ID가 반환됨
- [ ] 자동 생성 실패 시 적절한 에러 처리됨

### 5. 성능 최적화

#### 메시지 저장 최적화

```typescript
// 트랜잭션 최적화
@Transactional()
async createMessage(messageData: CreateMessageDto): Promise<Message> {
  // 메시지 저장과 관련 작업을 하나의 트랜잭션으로 처리
  const message = await this.messageRepository.save(messageData);

  // 관련 알림, 인덱스 업데이트 등을 동일 트랜잭션에서 처리
  await this.updateMessageIndexes(message);

  return message;
}
```

#### 역할 조회 캐싱

```typescript
// Redis 캐싱을 통한 역할 조회 최적화
@Injectable()
export class RoleCacheService {
  constructor(private redis: Redis) {}

  async getUserRole(threadId: string, userId: string): Promise<string> {
    const cacheKey = `role:thread:${threadId}:user:${userId}`;
    const cachedRole = await this.redis.get(cacheKey);

    if (cachedRole) {
      return cachedRole;
    }

    const role = await this.getRoleFromDatabase(threadId, userId);
    await this.redis.setex(cacheKey, 300, role); // 5분 캐시

    return role;
  }
}
```

### 6. 문제 해결

#### 일반적인 문제들

**1. 메시지 저장 실패**

```bash
# 데이터베이스 연결 확인
docker-compose logs postgres

# 메시지 서비스 로그 확인
docker-compose logs backend | grep MessageService
```

**2. 역할 조회 실패**

```bash
# ThreadService 로그 확인
docker-compose logs backend | grep ThreadService

# 데이터베이스에서 역할 데이터 확인
docker-compose exec postgres psql -U postgres -d threadsharing -c "SELECT * FROM thread_roles LIMIT 10;"
```

**3. 체크섬 검증 실패**

```bash
# 파일 업로드 서비스 로그 확인
docker-compose logs backend | grep ChunkedUploadService

# 체크섬 계산 테스트
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('test').digest('hex'));"
```

**4. WebSocket 연결 문제**

```bash
# WebSocket Gateway 로그 확인
docker-compose logs backend | grep WebSocketGateway

# WebSocket 테스트
cd tests/websocket_test
node test-websocket-connection.js
```

### 7. 모니터링

#### 성능 메트릭

- 메시지 저장 응답 시간: < 100ms
- 역할 조회 응답 시간: < 50ms
- 체크섬 검증 응답 시간: < 200ms
- WebSocket 이벤트 전송 시간: < 50ms

#### 에러 모니터링

- 메시지 저장 실패율: < 1%
- 역할 조회 실패율: < 0.5%
- 체크섬 검증 실패율: < 2%
- WebSocket 연결 실패율: < 5%

---

**구현 완료 후**: 모든 TODO 항목이 제거되고 시스템이 완전히 작동하는지 확인하세요.

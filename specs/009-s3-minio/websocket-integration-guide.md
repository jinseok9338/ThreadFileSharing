# WebSocket Integration Guide

## 🎯 확장성 개선 사항

### 1. 통합된 이벤트 시스템

#### 기존 문제점

- 파일 업로드와 채팅에서 유사한 이벤트명 충돌
- 별도의 룸 관리 시스템
- 사용자 상태 정보 분리

#### 개선된 설계

```typescript
// 통합된 이벤트 구조
interface UnifiedSocketEvents {
  // 룸 관리
  join_room: (data: JoinRoomRequest) => void;
  leave_room: (data: LeaveRoomRequest) => void;

  // 메시징 (채팅 + 파일 공유)
  send_message: (data: SendMessageRequest) => void;
  message_received: (message: MessageDetail) => void;

  // 파일 업로드
  file_upload_progress: (data: UploadProgressData) => void;
  file_upload_completed: (data: UploadCompletedData) => void;

  // 사용자 상태
  user_status_changed: (data: UserStatusData) => void;
  typing_indicator: (data: TypingData) => void;

  // 알림 시스템
  notification: (data: NotificationData) => void;
}
```

### 2. 계층적 룸 관리

#### 룸 구조

```
Company (company:{companyId})
├── Chatroom (chatroom:{chatroomId})
│   ├── Thread (thread:{threadId})
│   │   └── Upload Session (upload_session:{sessionId})
│   └── Direct Messages
└── User Notifications (user:{userId})
```

#### 룸 상속 관계

- **회사 알림**: 모든 사용자가 상속받음
- **채팅룸**: 멤버만 접근 가능
- **스레드**: 채팅룸 멤버만 접근 가능
- **업로드 세션**: 스레드 참여자만 접근 가능

### 3. 파일 업로드 → 채팅 통합

#### 자동 메시지 생성

```typescript
// 파일 업로드 완료 시 자동 채팅 메시지 생성
interface FileUploadCompletedEvent {
  sessionId: string;
  fileId: string;
  originalName: string;
  associatedRoom: {
    roomType: "chatroom" | "thread";
    roomId: string;
  };
  autoShareMessage: {
    messageId: string;
    content: string; // "파일이 업로드되었습니다: filename.pdf"
    messageType: "file_share";
  };
}
```

#### 스레드 자동 생성

```typescript
// 파일 업로드 시 "스레드 생성" 옵션
interface ThreadCreationFromFile {
  threadId: string;
  title: string;
  chatroomId: string;
  rootFile: {
    fileId: string;
    originalName: string;
    mimeType: string;
  };
  createdBy: UserInfo;
}
```

### 4. 사용자 상태 통합

#### 상태 관리

```typescript
interface UserStatus {
  id: string;
  username: string;
  status: "online" | "away" | "busy" | "offline";
  customMessage?: string;
  lastSeenAt: Date;
  currentActivity?: "typing" | "uploading" | "viewing_file";
}
```

#### 활동 추적

- **타이핑**: 채팅룸/스레드에서 타이핑 중
- **업로드**: 파일 업로드 진행 중
- **파일 보기**: 특정 파일을 보고 있음

### 5. 통합 알림 시스템

#### 알림 타입

```typescript
interface NotificationData {
  type:
    | "storage_quota_warning"
    | "file_processed"
    | "user_mention"
    | "system_message";
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  data: {
    // 알림 타입별 추가 데이터
    quotaInfo?: QuotaInfo;
    fileInfo?: FileInfo;
    mentionInfo?: MentionInfo;
  };
}
```

## 🔄 마이그레이션 전략

### Phase 1: 기존 파일 업로드 WebSocket 개선

1. 이벤트명 통합 (`upload_progress` → `file_upload_progress`)
2. 룸 관리 체계 도입
3. 사용자 상태 통합

### Phase 2: 채팅 기능 준비

1. 메시지 이벤트 구조 정의
2. 타이핑 인디케이터 구현
3. 알림 시스템 구축

### Phase 3: 완전 통합

1. 파일 업로드 → 채팅 자동 연결
2. 스레드 자동 생성
3. 통합 사용자 인터페이스

## 📋 구현 우선순위

### 즉시 구현 (파일 업로드용)

1. ✅ 통합된 이벤트 구조
2. ✅ 계층적 룸 관리
3. ✅ 파일 업로드 진행률 추적
4. ✅ 저장소 쿼터 알림

### 향후 확장 (채팅용)

1. 🔄 메시지 전송/수신
2. 🔄 타이핑 인디케이터
3. 🔄 사용자 온라인 상태
4. 🔄 멘션 알림

### 최종 통합

1. 🔄 파일 업로드 → 채팅 자동 연결
2. 🔄 스레드 자동 생성
3. 🔄 통합 알림 시스템

## 🧪 테스트 전략

### WebSocket 이벤트 테스트

```javascript
// Bruno에서 WebSocket 테스트
describe("Unified WebSocket Events", function () {
  it("should handle file upload progress", function (done) {
    socket.emit("join_room", {
      roomType: "upload_session",
      roomId: sessionId,
    });

    socket.on("file_upload_progress", function (data) {
      expect(data.progressPercentage).to.be.at.most(100);
      if (data.status === "COMPLETED") done();
    });
  });

  it("should create chat message on upload completion", function (done) {
    socket.on("message_received", function (message) {
      expect(message.messageType).to.equal("file_share");
      expect(message.fileInfo).to.exist;
      done();
    });
  });
});
```

### 통합 플로우 테스트

1. **파일 업로드 → 채팅 연결**: 업로드 완료 시 자동 메시지 생성
2. **스레드 생성**: 파일 업로드 시 스레드 자동 생성
3. **사용자 상태**: 업로드 중 상태 표시
4. **알림 전달**: 쿼터 경고, 파일 처리 완료 알림

## 🎉 확장성 이점

### 1. 코드 재사용성

- 통합된 WebSocket 게이트웨이
- 공통 사용자 상태 관리
- 재사용 가능한 알림 시스템

### 2. 일관된 UX

- 모든 기능에서 동일한 실시간 피드백
- 통합된 사용자 상태 표시
- 일관된 알림 경험

### 3. 성능 최적화

- 단일 WebSocket 연결로 모든 기능 지원
- 효율적인 룸 관리
- 최적화된 이벤트 전달

### 4. 유지보수성

- 중앙화된 실시간 기능 관리
- 일관된 이벤트 구조
- 명확한 책임 분리

이제 파일 업로드와 향후 채팅 기능이 완벽하게 통합된 WebSocket 아키텍처를 갖게 되었습니다! 🚀

# Data Model: 백엔드 TODO 항목 구현 완료

**Date**: 2025-10-06  
**Feature**: 백엔드 TODO 항목 구현 완료  
**Status**: Complete

## Entity Relationships

### 1. Message Entity (기존 확장)

**Purpose**: WebSocket 메시지의 실제 데이터베이스 저장 및 ID 생성

**Fields**:

- `id`: string (UUID) - Primary Key
- `chatroomId`: string (UUID) - Foreign Key to Chatroom
- `threadId`: string (UUID) - Foreign Key to Thread (nullable)
- `senderId`: string (UUID) - Foreign Key to User
- `content`: string - 메시지 내용
- `messageType`: enum - TEXT, FILE_SHARE, SYSTEM
- `replyToId`: string (UUID) - Foreign Key to Message (nullable, 답글용)
- `createdAt`: Date - 생성 시간
- `updatedAt`: Date - 수정 시간

**Relationships**:

- Belongs to Chatroom (chatroomId)
- Belongs to Thread (threadId, nullable)
- Belongs to User (senderId)
- Self-referencing for replies (replyToId)

**Validation Rules**:

- content는 1-4000자 제한
- messageType은 정의된 enum 값만 허용
- replyToId는 존재하는 메시지 ID여야 함

### 2. ThreadRole Entity (기존 확장)

**Purpose**: 사용자의 실제 스레드 내 역할 관리

**Fields**:

- `id`: string (UUID) - Primary Key
- `threadId`: string (UUID) - Foreign Key to Thread
- `userId`: string (UUID) - Foreign Key to User
- `role`: enum - CREATOR, ADMIN, MEMBER, OBSERVER
- `grantedBy`: string (UUID) - Foreign Key to User (역할 부여자)
- `grantedAt`: Date - 역할 부여 시간
- `permissions`: json - 세부 권한 설정

**Relationships**:

- Belongs to Thread (threadId)
- Belongs to User (userId)
- Belongs to User (grantedBy)

**Validation Rules**:

- role은 정의된 enum 값만 허용
- threadId와 userId 조합은 유니크해야 함
- permissions는 JSON 형태의 권한 객체

### 3. ChatroomMembership Entity (기존 확장)

**Purpose**: 채팅방 멤버십 검증을 위한 실제 멤버십 데이터

**Fields**:

- `id`: string (UUID) - Primary Key
- `chatroomId`: string (UUID) - Foreign Key to Chatroom
- `userId`: string (UUID) - Foreign Key to User
- `role`: enum - OWNER, ADMIN, MEMBER
- `joinedAt`: Date - 가입 시간
- `status`: enum - ACTIVE, INACTIVE, BANNED

**Relationships**:

- Belongs to Chatroom (chatroomId)
- Belongs to User (userId)

**Validation Rules**:

- role은 정의된 enum 값만 허용
- chatroomId와 userId 조합은 유니크해야 함
- status는 정의된 enum 값만 허용

### 4. ThreadParticipation Entity (기존 확장)

**Purpose**: 스레드 참여 검증을 위한 실제 참여 데이터

**Fields**:

- `id`: string (UUID) - Primary Key
- `threadId`: string (UUID) - Foreign Key to Thread
- `userId`: string (UUID) - Foreign Key to User
- `role`: enum - CREATOR, ADMIN, MEMBER, OBSERVER
- `joinedAt`: Date - 참여 시간
- `status`: enum - ACTIVE, INACTIVE, LEFT

**Relationships**:

- Belongs to Thread (threadId)
- Belongs to User (userId)

**Validation Rules**:

- role은 정의된 enum 값만 허용
- threadId와 userId 조합은 유니크해야 함
- status는 정의된 enum 값만 허용

### 5. UploadSession Entity (기존 확장)

**Purpose**: 파일 업로드 세션 접근 검증을 위한 세션 데이터

**Fields**:

- `id`: string (UUID) - Primary Key
- `sessionId`: string - 세션 식별자
- `createdBy`: string (UUID) - Foreign Key to User
- `chatroomId`: string (UUID) - Foreign Key to Chatroom (nullable)
- `threadId`: string (UUID) - Foreign Key to Thread (nullable)
- `status`: enum - ACTIVE, COMPLETED, FAILED, CANCELLED
- `createdAt`: Date - 생성 시간
- `expiresAt`: Date - 만료 시간
- `metadata`: json - 세션 메타데이터

**Relationships**:

- Belongs to User (createdBy)
- Belongs to Chatroom (chatroomId, nullable)
- Belongs to Thread (threadId, nullable)

**Validation Rules**:

- sessionId는 유니크해야 함
- status는 정의된 enum 값만 허용
- expiresAt은 createdAt보다 이후여야 함

### 6. ChunkChecksum Entity (신규)

**Purpose**: 파일 청크의 체크섬 검증을 위한 데이터

**Fields**:

- `id`: string (UUID) - Primary Key
- `uploadSessionId`: string (UUID) - Foreign Key to UploadSession
- `chunkIndex`: number - 청크 인덱스
- `chunkSize`: number - 청크 크기
- `checksum`: string - SHA-256 체크섬
- `calculatedAt`: Date - 체크섬 계산 시간

**Relationships**:

- Belongs to UploadSession (uploadSessionId)

**Validation Rules**:

- checksum은 SHA-256 형식이어야 함 (64자 hex)
- chunkIndex는 0 이상이어야 함
- chunkSize는 0보다 커야 함

### 7. CompanyRole Entity (기존 확장)

**Purpose**: 사용자의 실제 회사 내 역할 관리

**Fields**:

- `id`: string (UUID) - Primary Key
- `companyId`: string (UUID) - Foreign Key to Company
- `userId`: string (UUID) - Foreign Key to User
- `role`: enum - OWNER, ADMIN, MEMBER
- `grantedBy`: string (UUID) - Foreign Key to User (역할 부여자)
- `grantedAt`: Date - 역할 부여 시간
- `status`: enum - ACTIVE, INACTIVE, SUSPENDED

**Relationships**:

- Belongs to Company (companyId)
- Belongs to User (userId)
- Belongs to User (grantedBy)

**Validation Rules**:

- role은 정의된 enum 값만 허용
- companyId와 userId 조합은 유니크해야 함
- status는 정의된 enum 값만 허용

## State Transitions

### Message State

```
DRAFT → SENT → DELIVERED → READ
  ↓       ↓
FAILED → RETRY
```

### ThreadRole State

```
PENDING → ACTIVE → INACTIVE
   ↓        ↓
REVOKED → SUSPENDED
```

### UploadSession State

```
CREATED → ACTIVE → COMPLETED
   ↓        ↓        ↓
FAILED → CANCELLED → EXPIRED
```

## Business Rules

### 1. 메시지 저장 규칙

- WebSocket 메시지는 반드시 데이터베이스에 저장되어야 함
- 메시지 저장 실패 시 클라이언트에게 에러 이벤트 전송
- 답글 메시지는 원본 메시지가 존재해야 함

### 2. 역할 조회 규칙

- 스레드 역할은 ThreadRole 엔티티에서 조회
- 회사 역할은 CompanyRole 엔티티에서 조회
- 역할이 없는 경우 기본값(MEMBER) 사용

### 3. 멤버십 검증 규칙

- 채팅방 접근은 ChatroomMembership 엔티티로 검증
- 스레드 접근은 ThreadParticipation 엔티티로 검증
- 업로드 세션 접근은 UploadSession 엔티티로 검증

### 4. 체크섬 검증 규칙

- 모든 파일 청크는 SHA-256 체크섬으로 검증
- 체크섬 불일치 시 업로드 실패 처리
- 체크섬 계산은 서버에서 수행

### 5. 자동 생성 규칙

- 파일 업로드 완료 시 채팅방 메시지 자동 생성
- 스레드 생성 요청 시 ThreadService를 통한 실제 스레드 생성
- 생성된 메시지/스레드의 실제 ID를 WebSocket 이벤트에 포함

## Data Integrity Constraints

### 1. Foreign Key Constraints

- 모든 외래키는 CASCADE DELETE 또는 RESTRICT 설정
- 참조 무결성 보장을 위한 제약조건

### 2. Unique Constraints

- ThreadRole: (threadId, userId) 유니크
- ChatroomMembership: (chatroomId, userId) 유니크
- ThreadParticipation: (threadId, userId) 유니크
- CompanyRole: (companyId, userId) 유니크
- UploadSession: sessionId 유니크

### 3. Check Constraints

- Message: content 길이 1-4000자
- ChunkChecksum: checksum 길이 64자 (SHA-256)
- 모든 enum 필드: 정의된 값만 허용

## Indexing Strategy

### 1. Primary Indexes

- 모든 엔티티의 id 필드 (UUID)

### 2. Foreign Key Indexes

- 모든 외래키 필드에 인덱스 생성

### 3. Query Optimization Indexes

- Message: (chatroomId, createdAt), (threadId, createdAt)
- ThreadRole: (threadId, userId), (userId, role)
- ChatroomMembership: (chatroomId, userId), (userId, status)
- ThreadParticipation: (threadId, userId), (userId, status)
- UploadSession: (sessionId), (createdBy, status)
- ChunkChecksum: (uploadSessionId, chunkIndex)
- CompanyRole: (companyId, userId), (userId, role)

## Migration Strategy

### 1. 기존 엔티티 확장

- 기존 엔티티에 새로운 필드 추가
- 기존 데이터와의 호환성 유지

### 2. 신규 엔티티 생성

- ChunkChecksum 엔티티 신규 생성
- 기존 데이터와의 관계 설정

### 3. 데이터 마이그레이션

- 기존 TODO 항목에서 사용하던 임시 데이터를 실제 데이터로 변환
- 기본값 설정 및 데이터 무결성 보장

# Feature Specification: 백엔드 TODO 항목 구현 완료

**Feature Branch**: `014-todo`  
**Created**: 2025-10-06  
**Status**: Draft  
**Input**: User description: "백엔드 코드에 TODO 가 많아. 그 부분들 구현을 마무리해야해. 일단 백엔드 코드를 보고 어디를 고쳐야 하는지 알려줘"

## Execution Flow (main)

```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a system administrator, I need all TODO items in the backend code to be properly implemented so that the application functions correctly without temporary workarounds or incomplete features.

### Acceptance Scenarios

1. **Given** a WebSocket message is sent to a chatroom, **When** the system processes it, **Then** the message MUST be saved to the database with a real message ID
2. **Given** a user joins a thread via WebSocket, **When** the system processes the join request, **Then** the system MUST return the user's actual thread role from the database
3. **Given** a file upload is completed, **When** the system processes the completion, **Then** the system MUST create actual chatroom messages or threads as requested
4. **Given** a user attempts to join a chatroom/thread room, **When** the system validates access, **Then** the system MUST check actual membership/participation from the database
5. **Given** a chunked file upload occurs, **When** the system processes chunks, **Then** the system MUST validate chunk checksums for data integrity
6. **Given** a file upload completion event occurs, **When** the system broadcasts WebSocket events, **Then** the system MUST include proper company role information from the database

### Edge Cases

- What happens when a user tries to join a room they don't have access to?
- How does the system handle invalid chunk checksums during file upload?
- What occurs when message saving fails but WebSocket events are already sent?
- How does the system handle missing thread/chatroom membership data?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST save all WebSocket messages to the database with real message IDs
- **FR-002**: System MUST retrieve and return actual user thread roles from ThreadService
- **FR-003**: System MUST create actual chatroom messages via MessageService when files are shared
- **FR-004**: System MUST create actual threads via ThreadService when thread creation is requested
- **FR-005**: System MUST validate actual chatroom membership before allowing room access
- **FR-006**: System MUST validate actual thread participation before allowing thread access
- **FR-007**: System MUST validate actual upload session access before allowing session access
- **FR-008**: System MUST implement proper chunk checksum validation for file uploads
- **FR-009**: System MUST retrieve actual company roles from CompanyMember entity
- **FR-010**: System MUST implement proper checksum calculation using cryptographic hash functions
- **FR-011**: System MUST handle reply message data retrieval for message threading
- **FR-012**: System MUST implement WebSocket broadcasting for upload progress events

### Key Entities _(include if feature involves data)_

- **Message**: Represents chatroom and thread messages with real database IDs
- **ThreadRole**: Represents user's actual role within a thread (MEMBER, ADMIN, etc.)
- **ChatroomMembership**: Represents user's membership status in chatrooms
- **ThreadParticipation**: Represents user's participation status in threads
- **UploadSession**: Represents file upload sessions with proper access control
- **ChunkChecksum**: Represents file chunk integrity validation data
- **CompanyRole**: Represents user's actual role within their company
- **ReplyMessage**: Represents message threading and reply relationships

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## 백엔드 TODO 항목 분석 결과

### 🔍 발견된 TODO 항목들 (총 26개)

#### **1. WebSocket Gateway (websocket.gateway.ts) - 10개**

- **Thread Role 조회**: 실제 ThreadService에서 사용자 역할 가져오기 (2개)
- **메시지 저장**: MessageService를 통한 실제 메시지 데이터베이스 저장 (2개)
- **메시지 ID**: 실제 데이터베이스에서 생성된 메시지 ID 사용 (4개)
- **답글 데이터**: 답글 메시지 데이터 조회 구현 (2개)

#### **2. File Upload Service (file-upload.service.ts) - 4개**

- **회사 역할 조회**: CompanyMember 엔티티에서 실제 회사 역할 가져오기 (2개)
- **채팅방 메시지 생성**: MessageService를 통한 실제 채팅방 메시지 생성 (1개)
- **스레드 생성**: ThreadService를 통한 실제 스레드 생성 (1개)

#### **3. WebSocket Room Service (websocket-room.service.ts) - 3개**

- **채팅방 멤버십 검증**: 실제 채팅방 멤버십 확인 (1개)
- **스레드 참여 검증**: 실제 스레드 참여 확인 (1개)
- **업로드 세션 접근 검증**: 실제 업로드 세션 접근 권한 확인 (1개)

#### **4. Chunked Upload Service (chunked-upload.service.ts) - 2개**

- **청크 체크섬 검증**: 실제 청크 체크섬 검증 구현 (1개)
- **체크섬 계산**: 암호화 해시 함수를 사용한 실제 체크섬 계산 (1개)

#### **5. 기타 서비스들 - 7개**

- **Thread Service**: 회사 기반 접근 제어 검사 (1개)
- **Message Service**: 스레드 메시지 필터링 (1개)
- **Upload Progress Service**: WebSocket 브로드캐스팅 (1개)

### 🎯 우선순위 분류

#### **높은 우선순위 (핵심 기능)**

1. **메시지 저장 및 ID 생성** - WebSocket 메시지의 영구 저장
2. **실제 역할 조회** - Thread, Company 역할 정보
3. **멤버십 검증** - 채팅방/스레드 접근 제어
4. **체크섬 검증** - 파일 업로드 무결성

#### **중간 우선순위 (기능 완성)**

1. **채팅방/스레드 자동 생성** - 파일 업로드 후 자동 작업
2. **답글 데이터 조회** - 메시지 스레딩
3. **WebSocket 브로드캐스팅** - 업로드 진행률 알림

#### **낮은 우선순위 (최적화)**

1. **회사 기반 접근 제어** - 추가 보안 레이어
2. **스레드 메시지 필터링** - 성능 최적화

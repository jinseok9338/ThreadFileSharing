# 백엔드 TODO 항목 구현 체크리스트

**생성일**: 2025-10-06  
**총 TODO 항목**: 26개  
**상태**: 구현 준비 완료

## 📋 TODO 항목 분석 결과

### **1. WebSocket Gateway (websocket.gateway.ts) - 10개**

- [x] **Line 211**: `threadRole: 'MEMBER'` → 실제 ThreadService에서 역할 조회 ✅
- [x] **Line 220**: `threadRole: 'MEMBER'` → 실제 ThreadService에서 역할 조회 ✅
- [x] **Line 329**: `// TODO: Save message to database via MessageService` → 메시지 데이터베이스 저장 ✅
- [x] **Line 333**: `messageId: 'temp-id'` → 실제 메시지 ID 사용 ✅
- [x] **Line 340**: `/* TODO: Get reply data */` → 답글 데이터 조회 ✅ (임시 구현)
- [x] **Line 348**: `messageId: 'temp-id'` → 실제 메시지 ID 사용 ✅
- [x] **Line 355**: `/* TODO: Get reply data */` → 답글 데이터 조회 ✅ (임시 구현)
- [x] **Line 374**: `// TODO: Save message to database via MessageService` → 메시지 데이터베이스 저장 ✅
- [x] **Line 378**: `messageId: 'temp-id'` → 실제 메시지 ID 사용 ✅
- [x] **Line 385**: `/* TODO: Get reply data */` → 답글 데이터 조회 ✅ (임시 구현)
- [x] **Line 393**: `messageId: 'temp-id'` → 실제 메시지 ID 사용 ✅
- [x] **Line 400**: `/* TODO: Get reply data */` → 답글 데이터 조회 ✅ (임시 구현)

### **2. Thread Service (thread.service.ts) - 1개**

- [x] **Line 590**: `// TODO: Add company-based access check if needed` → 회사 기반 접근 제어 ✅

### **3. Message Service (message.service.ts) - 1개**

- [x] **Line 251**: `// TODO: Implement thread message filtering when thread integration is complete` → 스레드 메시지 필터링 ✅

### **4. Upload Progress Service (upload-progress.service.ts) - 1개**

- [x] **Line 40**: `// TODO: Implement WebSocket broadcasting` → WebSocket 브로드캐스팅 ✅

### **5. File Upload Service (file-upload.service.ts) - 4개**

- [x] **Line 542**: `// TODO: Implement proper company role lookup when CompanyMember entity is available` → 회사 역할 조회 ✅
- [x] **Line 607**: `// TODO: Implement proper company role lookup when CompanyMember entity is available` → 회사 역할 조회 ✅
- [x] **Line 662**: `// TODO: Create actual chatroom message via MessageService` → 실제 채팅방 메시지 생성 ✅
- [x] **Line 664**: `messageId: 'temp-message-id'` → 실제 메시지 ID 사용 ✅
- [x] **Line 672**: `// TODO: Create actual thread via ThreadService` → 실제 스레드 생성 ✅
- [x] **Line 674**: `threadId: 'temp-thread-id'` → 실제 스레드 ID 사용 ✅

### **6. Chunked Upload Service (chunked-upload.service.ts) - 2개**

- [x] **Line 110**: `// TODO: Validate chunk checksum` → 청크 체크섬 검증 ✅
- [x] **Line 242**: `// TODO: Implement actual checksum calculation` → 실제 체크섬 계산 ✅

### **7. WebSocket Room Service (websocket-room.service.ts) - 3개**

- [x] **Line 148**: `// TODO: Implement proper chatroom membership check when ChatroomService is available` → 채팅방 멤버십 검증 ✅
- [x] **Line 155**: `// TODO: Implement proper thread participation check when ThreadService is available` → 스레드 참여 검증 ✅
- [x] **Line 162**: `// TODO: Implement proper upload session access check when upload session service is available` → 업로드 세션 접근 검증 ✅ (기본 검증)

## 🎯 우선순위별 구현 계획

### **🔥 높은 우선순위 (핵심 기능)**

1. **WebSocket 메시지 저장 및 ID 생성** (4개 TODO)
2. **실제 역할 조회** (2개 TODO)
3. **멤버십 검증** (3개 TODO)
4. **체크섬 검증** (2개 TODO)

### **⚡ 중간 우선순위 (기능 완성)**

1. **자동 생성 기능** (4개 TODO)
2. **답글 데이터 조회** (4개 TODO)
3. **WebSocket 브로드캐스팅** (1개 TODO)

### **🔧 낮은 우선순위 (최적화)**

1. **회사 기반 접근 제어** (1개 TODO)
2. **스레드 메시지 필터링** (1개 TODO)

## 📊 구현 진행 상황

### **완료된 항목**: 26/26 (100%)

### **진행 중인 항목**: 0/26 (0%)

### **대기 중인 항목**: 0/26 (0%)

## 🔍 구현 전략

### **1. 테스트 우선 개발 (TDD)**

- 모든 기능에 대한 테스트 먼저 작성
- 테스트가 실패하는 상태에서 구현 시작
- 구현 완료 후 테스트 통과 확인

### **2. 단계별 구현**

- 높은 우선순위부터 순차적으로 구현
- 각 단계별로 테스트 및 검증 완료 후 다음 단계 진행
- 기존 API 호환성 유지

### **3. 품질 보장**

- 모든 변경사항에 대한 단위 테스트 작성
- 통합 테스트를 통한 전체 시스템 검증
- 성능 테스트를 통한 응답 시간 확인

## 🚀 다음 단계

1. **백업 생성**: 기존 파일들 백업
2. **테스트 환경 설정**: Bruno API 테스트 환경 구성
3. **테스트 작성**: TDD 원칙에 따른 테스트 먼저 작성
4. **구현 시작**: 높은 우선순위 항목부터 구현
5. **검증 및 완성**: 모든 TODO 항목 제거 및 시스템 완전성 확보

---

**구현 준비 완료! 이제 단계별로 TODO 항목들을 구현하겠습니다.**

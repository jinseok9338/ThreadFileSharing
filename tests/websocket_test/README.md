# WebSocket 테스트 스위트

이 디렉토리는 ThreadFileSharing 프로젝트의 WebSocket 기능에 대한 포괄적인 테스트 스위트를 포함합니다.

## 📁 디렉토리 구조

```
tests/websocket_test/
├── helpers/                    # 테스트 헬퍼 클래스
│   ├── auth-helper.js         # 동적 인증 관리
│   └── event-helper.js        # 이벤트 처리 및 검증
├── backups/                   # 원본 테스트 파일 백업
├── test-*.js                  # 개별 테스트 파일들
└── README.md                  # 이 문서
```

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
cd tests/websocket_test
npm install
```

### 2. 백엔드 서비스 실행

```bash
cd /path/to/project
docker-compose up -d backend
```

### 3. 테스트 실행

```bash
# 최종 테스트 스위트 실행
node test-final-suite.js

# 개별 테스트 실행
node test-websocket-auth.js
node test-chatroom-thread-integration.js
node test-storage-performance.js
```

## 📋 테스트 파일 설명

### 🔧 헬퍼 클래스

#### `AuthHelper`

- **목적**: 동적 사용자 등록 및 인증 토큰 관리
- **주요 기능**:
  - 테스트 사용자 자동 등록
  - JWT 토큰 생성 및 관리
  - 사용자 정리 및 정리

#### `EventHelper`

- **목적**: WebSocket 이벤트 처리 및 검증
- **주요 기능**:
  - 이벤트 전송 및 수신 대기
  - 비즈니스 로직 검증
  - 성능 테스트 지원
  - 메모리 사용량 모니터링

### 🧪 테스트 파일들

#### `test-websocket-auth.js`

- **목적**: WebSocket 인증 테스트
- **테스트 항목**:
  - 동적 사용자 등록
  - JWT 토큰 기반 인증
  - 연결 상태 검증

#### `test-websocket-simple.js`

- **목적**: 기본 WebSocket 연결 테스트
- **테스트 항목**:
  - 기본 연결
  - 연결 상태 확인

#### `test-multiple-users.js`

- **목적**: 다중 사용자 동시 연결 테스트
- **테스트 항목**:
  - 3명 동시 연결
  - 각 사용자별 독립적인 인증
  - 동시 메시지 전송

#### `test-websocket-events-improved.js`

- **목적**: 개선된 이벤트 처리 테스트
- **테스트 항목**:
  - 회사 룸 조인
  - 메시지 전송 및 수신
  - 타이핑 인디케이터

#### `test-chatroom-thread-integration.js`

- **목적**: 채팅방 및 스레드 통합 테스트
- **테스트 항목**:
  - 채팅방 조인/메시지/타이핑
  - 스레드 조인/메시지/타이핑
  - 사용자 상태 관리
  - 다양한 메시지 타입

#### `test-file-upload-improved.js`

- **목적**: 파일 업로드 WebSocket 연동 테스트
- **테스트 항목**:
  - 업로드 세션 조인
  - 진행률 이벤트 수신 준비
  - 완료/실패 이벤트 수신 준비

#### `test-storage-performance.js`

- **목적**: 스토리지 및 성능 테스트
- **테스트 항목**:
  - 다중 메시지 성능 테스트
  - 대용량 메시지 처리
  - 동시 연결 테스트
  - 메모리 사용량 모니터링

#### `test-error-handling.js`

- **목적**: 에러 처리 및 엣지 케이스 테스트
- **테스트 항목**:
  - 잘못된 이벤트 처리
  - 잘못된 데이터 형식 처리
  - 권한 없는 접근 처리
  - 연결 복구 테스트

#### `test-integration-validation.js`

- **목적**: 통합 및 검증 테스트
- **테스트 항목**:
  - 모든 기능 통합 테스트
  - 시스템 건강도 평가
  - 동시 작업 테스트

#### `test-final-suite.js`

- **목적**: 최종 테스트 스위트
- **테스트 항목**:
  - 모든 주요 기능 요약 테스트
  - 전체 시스템 건강도 평가

## 🔧 백엔드 WebSocket 구현

### 지원되는 이벤트들

#### 클라이언트 → 서버

- `join_company` - 회사 룸 조인
- `join_chatroom` - 채팅방 조인
- `join_thread` - 스레드 조인
- `join_upload_session` - 업로드 세션 조인
- `send_chatroom_message` - 채팅방 메시지 전송
- `send_thread_message` - 스레드 메시지 전송
- `chatroom_typing_start/stop` - 채팅방 타이핑 인디케이터
- `thread_typing_start/stop` - 스레드 타이핑 인디케이터
- `update_user_status` - 사용자 상태 업데이트

#### 서버 → 클라이언트

- `connection_established` - 연결 확립
- `user_joined_company` - 회사 룸 조인 확인
- `user_joined_chatroom` - 채팅방 조인 확인
- `user_joined_thread` - 스레드 조인 확인
- `room_joined` - 업로드 세션 조인 확인
- `chatroom_message_received` - 채팅방 메시지 수신
- `thread_message_received` - 스레드 메시지 수신
- `chatroom_typing` - 채팅방 타이핑 인디케이터
- `thread_typing` - 스레드 타이핑 인디케이터
- `user_status_changed` - 사용자 상태 변경
- `file_upload_progress` - 파일 업로드 진행률
- `file_upload_completed` - 파일 업로드 완료
- `file_upload_failed` - 파일 업로드 실패
- `file_processed` - 파일 처리 완료
- `error` - 에러 응답

## 📊 성능 지표

### 테스트 결과 (최신)

- **전체 시스템 건강도**: 100%
- **메시지 처리 속도**: 5-32 msg/s
- **대용량 메시지**: 3125+ KB/s
- **동시 연결**: 3/3 성공 (100%)
- **메모리 효율성**: +3MB (안정적)
- **에러 처리**: 100% 성공

## 🛠️ 개발 가이드

### 새로운 테스트 추가

1. `helpers/event-helper.js`에 필요한 메서드 추가
2. 새로운 테스트 파일 생성
3. `test-final-suite.js`에 테스트 케이스 추가

### 테스트 실행 순서

1. 기본 연결 테스트
2. 인증 테스트
3. 기능별 통합 테스트
4. 성능 테스트
5. 에러 처리 테스트
6. 최종 검증 테스트

## 🔍 문제 해결

### 일반적인 문제들

#### 1. 연결 실패

- 백엔드 서비스가 실행 중인지 확인
- JWT 토큰이 유효한지 확인
- 네트워크 연결 상태 확인

#### 2. 이벤트 수신 실패

- 이벤트 이름이 정확한지 확인
- 백엔드에서 해당 이벤트를 전송하는지 확인
- 타임아웃 설정 확인

#### 3. 인증 실패

- 사용자 등록이 성공했는지 확인
- 토큰 만료 시간 확인
- 권한 설정 확인

## 📈 모니터링

### 메모리 사용량

- 초기: ~50MB RSS, ~8MB Heap
- 테스트 중: ~60MB RSS, ~11MB Heap
- 증가량: +9MB RSS, +3MB Heap (안정적)

### 성능 지표

- 메시지 처리: 5-32 msg/s
- 대용량 데이터: 3125+ KB/s
- 동시 연결: 100% 성공률
- 에러 처리: 100% 성공률

## 🎯 향후 개선 사항

1. **실제 파일 업로드 API 연동**
2. **더 많은 동시 연결 테스트**
3. **네트워크 지연 시뮬레이션**
4. **자동화된 CI/CD 통합**
5. **성능 벤치마크 기준 설정**

---

**마지막 업데이트**: 2025-10-06
**테스트 스위트 버전**: 1.0.0
**전체 시스템 건강도**: 100%

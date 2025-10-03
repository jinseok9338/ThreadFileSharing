# WebSocket Integration Tests

이 디렉토리는 ThreadFileSharing 프로젝트의 WebSocket 기능을 테스트하는 스크립트들을 포함합니다.

## 설치

```bash
cd tests/websocket_test
pnpm install
```

## 테스트 파일들

### 1. `test-file-upload-websocket.js`
- **목적**: 파일 업로드와 WebSocket 이벤트 연동 테스트
- **기능**: 
  - WebSocket 연결 및 인증
  - 회사 룸 및 채팅방 조인
  - 파일 업로드
  - WebSocket 이벤트 수신 (`file_upload_completed`)
- **실행**: `node test-file-upload-websocket.js`

### 2. `test-websocket-auth.js`
- **목적**: WebSocket 인증 테스트
- **기능**: JWT 토큰을 사용한 WebSocket 연결 및 인증
- **실행**: `node test-websocket-auth.js`

### 3. `test-websocket-events-detailed.js`
- **목적**: 다양한 WebSocket 이벤트 테스트
- **기능**: 여러 WebSocket 이벤트 수신 및 응답 테스트
- **실행**: `node test-websocket-events-detailed.js`

### 4. `test-websocket-events.js`
- **목적**: 기본적인 WebSocket 이벤트 테스트
- **실행**: `node test-websocket-events.js`

### 5. `test-websocket-simple.js`
- **목적**: 간단한 WebSocket 연결 테스트
- **실행**: `node test-websocket-simple.js`

### 6. `test-storage-fix.js`
- **목적**: 스토리지 할당량 계산 수정 테스트
- **기능**: 스토리지 할당량 API 테스트 및 WebSocket 연동
- **실행**: `node test-storage-fix.js`

## 사용법

### 전체 테스트 실행
```bash
# 모든 테스트를 순차적으로 실행
pnpm test
```

### 개별 테스트 실행
```bash
# 파일 업로드 WebSocket 테스트
pnpm run test

# WebSocket 인증 테스트
pnpm run test-auth

# WebSocket 이벤트 테스트
pnpm run test-events

# 스토리지 할당량 테스트
pnpm run test-storage
```

## 전제 조건

1. **백엔드 서버 실행**: `http://localhost:3001`에서 NestJS 서버가 실행 중이어야 합니다.
2. **데이터베이스 연결**: PostgreSQL 데이터베이스가 실행 중이어야 합니다.
3. **MinIO 서버**: 파일 스토리지용 MinIO 서버가 실행 중이어야 합니다.
4. **유효한 사용자 계정**: 테스트용 사용자 계정이 데이터베이스에 존재해야 합니다.

## 테스트 데이터

- **테스트 사용자**: `test@example.com` / `test12345`
- **테스트 회사**: `WebSocket Test Company`
- **테스트 채팅방**: 자동으로 생성됨

## 주의사항

- 테스트 실행 전에 백엔드 서버가 실행 중인지 확인하세요.
- JWT 토큰은 만료될 수 있으므로, 테스트 실패 시 새로운 토큰으로 업데이트가 필요할 수 있습니다.
- 테스트 파일들은 `/tmp/` 디렉토리에 생성되며, 테스트 완료 후 자동으로 삭제됩니다.

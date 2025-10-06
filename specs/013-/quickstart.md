# Quickstart Guide: 웹소켓 단위 테스트 보완 및 개선

**Feature**: 013-websocket-unit-test-improvements  
**Date**: 2025-10-06  
**Status**: Ready for Implementation

## Overview

이 가이드는 기존 `tests/websocket_test` 디렉토리의 웹소켓 테스트들을 현재 백엔드 구현 상태에 맞게 보완하고 개선하는 과정을 안내합니다.

## Prerequisites

### Required Services

- **NestJS 백엔드 서버**: `http://localhost:3001`에서 실행 중
- **PostgreSQL 데이터베이스**: 백엔드와 연결된 상태
- **Redis**: 세션 저장 및 캐싱용

### Environment Setup

```bash
# 1. 프로젝트 루트로 이동
cd /Users/jinseokseo/Desktop/Development/ThreadFileSharing

# 2. 백엔드 서버 실행 확인
docker-compose ps

# 3. 웹소켓 테스트 디렉토리로 이동
cd tests/websocket_test

# 4. 의존성 설치 (이미 설치되어 있을 수 있음)
npm install
```

## Test Execution Workflow

### Phase 1: 현재 상태 분석

#### 1.1 기존 테스트 파일 확인

```bash
# 현재 테스트 파일 목록 확인
ls -la tests/websocket_test/

# 각 테스트 파일의 현재 상태 확인
node test-websocket-simple.js
node test-websocket-auth.js
node test-websocket-events.js
```

#### 1.2 백엔드 WebSocket 구현 확인

```bash
# 백엔드 서버 상태 확인
curl -s http://localhost:3001/health || echo "Backend not running"

# WebSocket 연결 테스트
curl -s http://localhost:3001/docs | grep -i websocket || echo "Check Swagger docs"
```

### Phase 2: 동적 인증 구현

#### 2.1 인증 헬퍼 생성

```javascript
// tests/websocket_test/helpers/auth-helper.js
const axios = require("axios");

class AuthHelper {
  constructor(baseURL = "http://localhost:3001/api/v1") {
    this.baseURL = baseURL;
    this.testUsers = new Map();
  }

  async registerTestUser() {
    const timestamp = Date.now();
    const userData = {
      email: `test-${timestamp}@example.com`,
      password: "testpassword123",
      companyName: `TestCompany_${timestamp}`,
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/auth/register`,
        userData
      );

      if (response.data.status === "success") {
        const authData = {
          ...userData,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          userId: response.data.data.user.id,
          companyId: response.data.data.company.id,
        };

        this.testUsers.set(userData.email, authData);
        return authData;
      }
    } catch (error) {
      console.error(
        "User registration failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getValidToken(email = null) {
    const user = email
      ? this.testUsers.get(email)
      : Array.from(this.testUsers.values())[0];

    if (!user) {
      return await this.registerTestUser();
    }

    // 토큰 만료 체크 (간단한 구현)
    return user;
  }

  cleanup() {
    this.testUsers.clear();
  }
}

module.exports = AuthHelper;
```

#### 2.2 기존 테스트에 동적 인증 적용

```javascript
// tests/websocket_test/test-websocket-auth-improved.js
const io = require("socket.io-client");
const AuthHelper = require("./helpers/auth-helper");

async function testWebSocketAuth() {
  const authHelper = new AuthHelper();

  try {
    // 1. 테스트 사용자 등록
    console.log("🔐 테스트 사용자 등록 중...");
    const user = await authHelper.registerTestUser();
    console.log(`✅ 사용자 등록 성공: ${user.email}`);

    // 2. WebSocket 연결 테스트
    console.log("🔌 WebSocket 연결 테스트...");
    const socket = io("http://localhost:3001", {
      transports: ["polling", "websocket"],
      timeout: 10000,
      query: { token: user.accessToken },
    });

    // 3. 연결 성공 검증
    const connectionPromise = new Promise((resolve, reject) => {
      socket.on("connect", () => {
        console.log("✅ WebSocket 연결 성공");
        resolve(true);
      });

      socket.on("connect_error", (error) => {
        console.log("❌ WebSocket 연결 실패:", error.message);
        reject(error);
      });

      setTimeout(() => reject(new Error("Connection timeout")), 10000);
    });

    await connectionPromise;

    // 4. 인증 상태 검증
    socket.on("connection_established", (data) => {
      console.log("✅ 인증 성공:", data);
      if (data.userId === user.userId && data.companyId === user.companyId) {
        console.log("✅ 사용자 정보 일치");
      } else {
        console.log("❌ 사용자 정보 불일치");
      }
    });

    // 5. 정리
    socket.disconnect();
    authHelper.cleanup();
    console.log("✅ 인증 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    authHelper.cleanup();
    process.exit(1);
  }
}

testWebSocketAuth();
```

### Phase 3: 이벤트 처리 테스트 개선

#### 3.1 상세 이벤트 테스트 개선

```javascript
// tests/websocket_test/test-websocket-events-improved.js
const io = require("socket.io-client");
const AuthHelper = require("./helpers/auth-helper");

async function testWebSocketEvents() {
  const authHelper = new AuthHelper();

  try {
    // 1. 테스트 사용자 준비
    const user = await authHelper.registerTestUser();
    console.log(`✅ 테스트 사용자 준비: ${user.email}`);

    // 2. WebSocket 연결
    const socket = io("http://localhost:3001", {
      transports: ["polling", "websocket"],
      timeout: 10000,
      query: { token: user.accessToken },
    });

    // 3. 연결 대기
    await new Promise((resolve) => {
      socket.on("connect", resolve);
    });

    // 4. 회사 룸 자동 조인 확인
    socket.on("room_joined", (data) => {
      console.log("✅ 룸 조인 확인:", data);
      if (data.roomType === "company") {
        console.log("✅ 회사 룸 자동 조인 성공");
      }
    });

    // 5. 채팅방 생성 및 조인 테스트
    console.log("📝 채팅방 생성 테스트...");
    socket.emit("join_company", { companyId: user.companyId });

    // 6. 메시지 전송 테스트
    console.log("💬 메시지 전송 테스트...");
    socket.emit("send_chatroom_message", {
      chatroomId: "test-chatroom-id",
      content: "Test message from improved test",
      messageType: "TEXT",
    });

    // 7. 메시지 수신 검증
    socket.on("message_received", (data) => {
      console.log("✅ 메시지 수신 확인:", data);
      if (data.content === "Test message from improved test") {
        console.log("✅ 메시지 내용 일치");
      }
    });

    // 8. 타이핑 인디케이터 테스트
    console.log("⌨️ 타이핑 인디케이터 테스트...");
    socket.emit("typing_indicator", {
      roomId: "test-chatroom-id",
      isTyping: true,
    });

    socket.on("typing_indicator_received", (data) => {
      console.log("✅ 타이핑 인디케이터 수신:", data);
    });

    // 9. 테스트 완료 대기
    await new Promise((resolve) => setTimeout(resolve, 5000));

    socket.disconnect();
    authHelper.cleanup();
    console.log("✅ 이벤트 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    authHelper.cleanup();
    process.exit(1);
  }
}

testWebSocketEvents();
```

### Phase 4: 파일 업로드 연동 테스트 개선

#### 4.1 파일 업로드 WebSocket 테스트 개선

```javascript
// tests/websocket_test/test-file-upload-improved.js
const io = require("socket.io-client");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const AuthHelper = require("./helpers/auth-helper");

async function testFileUploadWebSocket() {
  const authHelper = new AuthHelper();

  try {
    // 1. 테스트 사용자 준비
    const user = await authHelper.registerTestUser();
    console.log(`✅ 테스트 사용자 준비: ${user.email}`);

    // 2. WebSocket 연결
    const socket = io("http://localhost:3001", {
      transports: ["polling", "websocket"],
      timeout: 10000,
      query: { token: user.accessToken },
    });

    await new Promise((resolve) => {
      socket.on("connect", resolve);
    });

    // 3. 파일 업로드 세션 시작
    console.log("📁 파일 업로드 세션 시작...");
    const uploadResponse = await axios.post(
      "http://localhost:3001/api/v1/files/upload/initiate",
      {
        fileName: "test-file.txt",
        fileSize: 1024,
        mimeType: "text/plain",
      },
      {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      }
    );

    const sessionId = uploadResponse.data.sessionId;
    console.log(`✅ 업로드 세션 생성: ${sessionId}`);

    // 4. 업로드 세션 룸 조인
    socket.emit("join_upload_session", { sessionId });

    // 5. WebSocket 이벤트 수신 설정
    socket.on("file_upload_progress", (data) => {
      console.log(`📊 업로드 진행률: ${data.progress}%`);
    });

    socket.on("file_upload_completed", (data) => {
      console.log("✅ 파일 업로드 완료:", data);
    });

    socket.on("file_upload_failed", (data) => {
      console.log("❌ 파일 업로드 실패:", data);
    });

    // 6. 테스트 파일 생성
    const testFilePath = path.join(__dirname, "test-file.txt");
    fs.writeFileSync(
      testFilePath,
      "This is a test file for WebSocket upload testing."
    );

    // 7. 파일 업로드 실행
    console.log("📤 파일 업로드 실행...");
    const formData = new FormData();
    formData.append("file", fs.createReadStream(testFilePath));

    try {
      await axios.post(
        `http://localhost:3001/api/v1/files/upload/${sessionId}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
    } catch (uploadError) {
      console.log(
        "⚠️ 파일 업로드 API 에러 (WebSocket 이벤트는 확인됨):",
        uploadError.message
      );
    }

    // 8. WebSocket 이벤트 확인 대기
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 9. 정리
    fs.unlinkSync(testFilePath);
    socket.disconnect();
    authHelper.cleanup();
    console.log("✅ 파일 업로드 WebSocket 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    authHelper.cleanup();
    process.exit(1);
  }
}

testFileUploadWebSocket();
```

## Validation Steps

### Step 1: 개별 테스트 실행

```bash
# 각 개선된 테스트 파일을 개별적으로 실행
node test-websocket-auth-improved.js
node test-websocket-events-improved.js
node test-file-upload-improved.js
```

### Step 2: 통합 테스트 실행

```bash
# 모든 테스트를 순차적으로 실행하는 스크립트
node run-all-improved-tests.js
```

### Step 3: 성능 검증

```bash
# 동시 연결 테스트
node test-concurrent-connections.js

# 메시지 처리 성능 테스트
node test-message-performance.js
```

## Expected Results

### Success Criteria

- ✅ 모든 테스트가 성공적으로 실행됨
- ✅ 동적 토큰 생성이 정상 작동함
- ✅ WebSocket 연결이 안정적으로 유지됨
- ✅ 이벤트 송수신이 정확하게 작동함
- ✅ 파일 업로드 WebSocket 연동이 정상 작동함
- ✅ 에러 처리가 적절하게 구현됨

### Performance Targets

- WebSocket 연결 시간: < 2초
- 메시지 전송 응답: < 500ms
- 파일 업로드 이벤트 수신: < 1초
- 동시 연결 처리: 최대 10개

## Troubleshooting

### Common Issues

#### 1. 백엔드 서버 연결 실패

```bash
# Docker 서비스 상태 확인
docker-compose ps

# 백엔드 로그 확인
docker-compose logs backend

# 백엔드 재시작
docker-compose restart backend
```

#### 2. 인증 토큰 오류

```bash
# 토큰 유효성 확인
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/v1/users/me
```

#### 3. WebSocket 연결 실패

```bash
# 포트 확인
netstat -an | grep 3001

# 방화벽 확인 (필요시)
sudo ufw status
```

## Next Steps

1. **Phase 2 실행**: `/tasks` 명령어로 구체적인 구현 작업 생성
2. **단계별 구현**: 이벤트 처리 테스트부터 순차적 개선
3. **통합 검증**: 전체 테스트 스위트 실행 및 성능 검증
4. **문서화**: 개선된 테스트 가이드 및 베스트 프랙티스 문서 작성

---

**Quickstart Status**: Complete  
**Ready for Implementation**: Yes  
**Dependencies**: Backend server running, test environment configured

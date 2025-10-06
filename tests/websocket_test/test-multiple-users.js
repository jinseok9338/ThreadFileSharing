const { io } = require("socket.io-client");
const AuthHelper = require("./helpers/auth-helper");

console.log("🔌 다중 사용자 WebSocket 연결 테스트 시작...");

async function testMultipleUsers() {
  const authHelper = new AuthHelper();
  const sockets = [];

  try {
    // 1. 여러 테스트 사용자 생성
    console.log("👥 다중 테스트 사용자 생성 중...");
    const users = await authHelper.createMultipleUsers(3);
    console.log(`✅ ${users.length}명의 사용자 생성 완료`);

    // 2. 각 사용자별 WebSocket 연결
    console.log("🔌 다중 WebSocket 연결 테스트...");

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`🔗 사용자 ${i + 1} 연결 중: ${user.email}`);

      const socket = io("http://localhost:3001", {
        transports: ["polling", "websocket"],
        timeout: 10000,
        forceNew: true,
        reconnection: false,
        autoConnect: true,
        query: {
          token: user.accessToken,
        },
      });

      // 연결 성공 검증
      const connectionPromise = new Promise((resolve, reject) => {
        socket.on("connect", () => {
          console.log(`✅ 사용자 ${i + 1} 연결 성공: ${socket.id}`);
          resolve(true);
        });

        socket.on("connect_error", (error) => {
          console.log(`❌ 사용자 ${i + 1} 연결 실패:`, error.message);
          reject(error);
        });

        setTimeout(
          () => reject(new Error(`User ${i + 1} connection timeout`)),
          10000
        );
      });

      await connectionPromise;
      sockets.push({ socket, user, index: i + 1 });
    }

    console.log(`✅ 모든 사용자 연결 성공: ${sockets.length}명`);

    // 3. 인증 상태 검증
    for (const { socket, user, index } of sockets) {
      socket.on("connection_established", (data) => {
        console.log(`✅ 사용자 ${index} 인증 성공:`, data);
        if (data.userId === user.userId && data.companyId === user.companyId) {
          console.log(`✅ 사용자 ${index} 정보 일치`);
        } else {
          console.log(`❌ 사용자 ${index} 정보 불일치`);
        }
      });
    }

    // 4. 동시 메시지 전송 테스트
    console.log("💬 동시 메시지 전송 테스트...");

    for (let i = 0; i < sockets.length; i++) {
      const { socket, user, index } = sockets[i];

      socket.emit("send_chatroom_message", {
        chatroomId: "test-chatroom-id",
        content: `Test message from user ${index}`,
        messageType: "TEXT",
      });

      console.log(
        `📤 사용자 ${index} 메시지 전송: Test message from user ${index}`
      );
    }

    // 5. 메시지 수신 검증
    for (const { socket, user, index } of sockets) {
      socket.on("message_received", (data) => {
        console.log(`📨 사용자 ${index} 메시지 수신:`, data.content);
      });
    }

    // 6. 테스트 완료 대기
    console.log("⏳ 테스트 완료 대기 중...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 7. 정리
    console.log("🧹 연결 정리 중...");
    for (const { socket } of sockets) {
      socket.disconnect();
    }

    authHelper.cleanup();
    console.log("✅ 다중 사용자 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);

    // 에러 발생 시 모든 연결 정리
    for (const { socket } of sockets) {
      socket.disconnect();
    }

    authHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testMultipleUsers();

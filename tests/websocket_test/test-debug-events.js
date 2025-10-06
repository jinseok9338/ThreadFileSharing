const { io } = require("socket.io-client");
const AuthHelper = require("./helpers/auth-helper");

console.log("🔍 WebSocket 이벤트 디버그 테스트 시작...");

async function debugWebSocketEvents() {
  const authHelper = new AuthHelper();

  try {
    // 1. 테스트 사용자 등록
    const user = await authHelper.registerTestUser();
    console.log(`✅ 사용자 등록: ${user.email}`);

    // 2. WebSocket 연결
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

    // 3. 모든 이벤트 수신 및 로그
    socket.onAny((event, ...args) => {
      const timestamp = new Date().toISOString();
      console.log(`📨 [${timestamp}] 수신된 이벤트: ${event}`);

      if (args.length > 0) {
        console.log("   📄 데이터:", JSON.stringify(args[0], null, 2));
      }
    });

    // 4. 연결 성공 대기
    await new Promise((resolve) => {
      socket.on("connect", () => {
        console.log("✅ WebSocket 연결 성공!");
        console.log("📡 Socket ID:", socket.id);
        resolve();
      });
    });

    // 5. 회사 룸 조인 시도
    console.log("🏢 회사 룸 조인 시도...");
    socket.emit("join_company", { companyId: user.companyId });

    // 6. 메시지 전송 시도
    console.log("💬 메시지 전송 시도...");
    socket.emit("send_chatroom_message", {
      chatroomId: "test-chatroom-id",
      content: "Debug test message",
      messageType: "TEXT",
    });

    // 7. 타이핑 인디케이터 시도
    console.log("⌨️ 타이핑 인디케이터 시도...");
    socket.emit("chatroom_typing_start", {
      roomId: "test-chatroom-id",
    });

    // 8. 10초 대기 후 정리
    console.log("⏳ 10초 대기 중...");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    socket.disconnect();
    authHelper.cleanup();
    console.log("✅ 디버그 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    authHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
debugWebSocketEvents();

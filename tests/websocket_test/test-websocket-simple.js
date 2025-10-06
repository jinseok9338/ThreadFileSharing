const { io } = require("socket.io-client");
const AuthHelper = require("./helpers/auth-helper");

console.log("🔌 WebSocket 연결 테스트 시작...");

async function testWebSocketSimple() {
  const authHelper = new AuthHelper();

  try {
    // 1. 테스트 사용자 등록
    console.log("🔐 테스트 사용자 등록 중...");
    const user = await authHelper.registerTestUser();
    console.log(`✅ 사용자 등록 성공: ${user.email}`);

    // 2. WebSocket 연결 테스트 (인증 포함)
    console.log("🔌 WebSocket 연결 테스트...");
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

    // 3. 연결 성공 검증
    const connectionPromise = new Promise((resolve, reject) => {
      socket.on("connect", () => {
        console.log("✅ WebSocket 연결 성공!");
        console.log("📡 Socket ID:", socket.id);
        console.log("🔗 연결 상태:", socket.connected);
        console.log("🔐 인증된 사용자로 연결됨");
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

    // 5. 테스트 완료 대기
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 6. 정리
    socket.disconnect();
    authHelper.cleanup();
    console.log("✅ 간단한 연결 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    authHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testWebSocketSimple();

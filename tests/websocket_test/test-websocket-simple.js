const { io } = require("socket.io-client");

console.log("🔌 WebSocket 연결 테스트 시작...");

// Socket.IO 클라이언트 생성 (인증 없이)
const socket = io("http://localhost:3001", {
  transports: ["polling", "websocket"],
  timeout: 10000,
  forceNew: true,
  reconnection: false,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("✅ WebSocket 연결 성공!");
  console.log("📡 Socket ID:", socket.id);
  console.log("🔗 연결 상태:", socket.connected);

  // 3초 후 연결 해제
  setTimeout(() => {
    console.log("🔌 연결 해제 중...");
    socket.disconnect();
  }, 3000);
});

socket.on("connect_error", (error) => {
  console.log("❌ WebSocket 연결 실패:", error.message);
  process.exit(1);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 WebSocket 연결 해제:", reason);
  process.exit(0);
});

// 10초 후 타임아웃
setTimeout(() => {
  console.log("⏰ 연결 타임아웃");
  socket.disconnect();
  process.exit(1);
}, 10000);

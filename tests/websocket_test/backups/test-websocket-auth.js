const { io } = require("socket.io-client");

console.log("🔌 WebSocket 인증 연결 테스트 시작...");

// 새로운 JWT 토큰
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNGRmNGUwOC1mODgyLTQyYTAtYTY3Mi0zZmEwOGU4ZTY5NWIiLCJjb21wYW55SWQiOiI0MTYzYzNjOC1lNWIzLTRhMzEtYWUxYy00M2U3Y2RjZjk0OGIiLCJjb21wYW55Um9sZSI6Im93bmVyIiwiaWF0IjoxNzU5NDkxNzA1LCJleHAiOjE3NTk0OTI2MDV9.jzHFz7fOHyEuniIj_d30XeKpduMAd4OXtUw_Hx3qm2k";

// Socket.IO 클라이언트 생성 (인증 포함)
const socket = io("http://localhost:3001", {
  transports: ["polling", "websocket"],
  timeout: 10000,
  forceNew: true,
  reconnection: false,
  autoConnect: true,
  query: {
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("✅ WebSocket 인증 연결 성공!");
  console.log("📡 Socket ID:", socket.id);
  console.log("🔐 인증된 사용자로 연결됨");

  // 5초 후 연결 해제
  setTimeout(() => {
    console.log("🔌 연결 해제 중...");
    socket.disconnect();
  }, 5000);
});

socket.on("connect_error", (error) => {
  console.log("❌ WebSocket 연결 실패:", error.message);
  process.exit(1);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 WebSocket 연결 해제:", reason);
  process.exit(0);
});

// 서버로부터 메시지 수신
socket.onAny((event, ...args) => {
  console.log(`📨 수신된 이벤트: ${event}`, args.length > 0 ? args[0] : "");
});

// 15초 후 타임아웃
setTimeout(() => {
  console.log("⏰ 연결 타임아웃");
  socket.disconnect();
  process.exit(1);
}, 15000);

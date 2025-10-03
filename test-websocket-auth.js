const { io } = require("socket.io-client");

console.log("🔌 WebSocket 인증 테스트 시작...");

// 테스트용 JWT 토큰
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNGRmNGUwOC1mODgyLTQyYTAtYTY3Mi0zZmEwOGU4ZTY5NWIiLCJjb21wYW55SWQiOiI0MTYzYzNjOC1lNWIzLTRhMzEtYWUxYy00M2U3Y2RjZjk0OGIiLCJjb21wYW55Um9sZSI6Im93bmVyIiwiaWF0IjoxNzU5NDkxMjE0LCJleHAiOjE3NTk0OTIxMTR9.cyetodhJ3mkZHTzxpHt4RL3JG06lfKNtxO4p9_dqvik";

// Socket.IO 클라이언트 생성 - 쿼리 파라미터로 토큰 전달
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

  // 잠시 대기 후 연결 해제
  setTimeout(() => {
    console.log("🔌 연결 해제 중...");
    socket.disconnect();
  }, 3000);
});

socket.on("connect_error", (error) => {
  console.log("❌ WebSocket 연결 실패:", error.message);
  console.log("🔍 에러 상세:", error);
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

// 10초 후 타임아웃
setTimeout(() => {
  console.log("⏰ 연결 타임아웃");
  socket.disconnect();
  process.exit(1);
}, 10000);

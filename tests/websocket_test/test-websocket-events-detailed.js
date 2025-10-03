const { io } = require("socket.io-client");

console.log("🔌 WebSocket 이벤트 상세 테스트 시작...");

// 테스트용 JWT 토큰
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNGRmNGUwOC1mODgyLTQyYTAtYTY3Mi0zZmEwOGU4ZTY5NWIiLCJjb21wYW55SWQiOiI0MTYzYzNjOC1lNWIzLTRhMzEtYWUxYy00M2U3Y2RjZjk0OGIiLCJjb21wYW55Um9sZSI6Im93bmVyIiwiaWF0IjoxNzU5NDkxMjE0LCJleHAiOjE3NTk0OTIxMTR9.cyetodhJ3mkZHTzxpHt4RL3JG06lfKNtxO4p9_dqvik";
const COMPANY_ID = "4163c3c8-e5b3-4a31-ae1c-43e7cdcf948b";

// Socket.IO 클라이언트 생성
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

let receivedEvents = [];
let testResults = {
  connection: false,
  roomJoins: 0,
  eventsReceived: 0,
  eventsSent: 0,
};

// 모든 이벤트 수신
socket.onAny((event, ...args) => {
  const timestamp = new Date().toISOString();
  console.log(`📨 [${timestamp}] 수신된 이벤트: ${event}`);

  if (args.length > 0) {
    console.log("   📄 데이터:", JSON.stringify(args[0], null, 2));
  }

  receivedEvents.push({
    event,
    data: args[0] || null,
    timestamp,
  });

  testResults.eventsReceived++;
});

socket.on("connect", async () => {
  console.log("✅ WebSocket 연결 성공!");
  console.log("📡 Socket ID:", socket.id);
  testResults.connection = true;

  // 1초 후 회사 룸 조인
  setTimeout(() => {
    testCompanyJoin();
  }, 1000);
});

socket.on("connect_error", (error) => {
  console.log("❌ WebSocket 연결 실패:", error.message);
  process.exit(1);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 WebSocket 연결 해제:", reason);
  printTestResults();
  process.exit(0);
});

// 회사 룸 조인 테스트
function testCompanyJoin() {
  console.log("🏠 회사 룸 조인 테스트...");

  socket.emit("join_company", {
    companyId: COMPANY_ID,
  });

  testResults.eventsSent++;

  setTimeout(() => {
    testChatroomJoin();
  }, 2000);
}

// 채팅방 조인 테스트
function testChatroomJoin() {
  console.log("💬 채팅방 조인 테스트...");

  socket.emit("join_chatroom", {
    chatroomId: "test-chatroom-id",
  });

  testResults.eventsSent++;

  setTimeout(() => {
    testThreadJoin();
  }, 2000);
}

// 스레드 조인 테스트
function testThreadJoin() {
  console.log("🧵 스레드 조인 테스트...");

  socket.emit("join_thread", {
    threadId: "test-thread-id",
  });

  testResults.eventsSent++;

  setTimeout(() => {
    testUploadSessionJoin();
  }, 2000);
}

// 업로드 세션 조인 테스트
function testUploadSessionJoin() {
  console.log("📁 업로드 세션 조인 테스트...");

  socket.emit("join_upload_session", {
    sessionId: "test-session-id",
  });

  testResults.eventsSent++;

  setTimeout(() => {
    testChatMessages();
  }, 2000);
}

// 채팅 메시지 테스트
function testChatMessages() {
  console.log("💭 채팅 메시지 테스트...");

  // 채팅방 메시지
  socket.emit("send_chatroom_message", {
    chatroomId: "test-chatroom-id",
    content: "안녕하세요! WebSocket 테스트 메시지입니다.",
    messageType: "text",
  });

  testResults.eventsSent++;

  setTimeout(() => {
    // 스레드 메시지
    socket.emit("send_thread_message", {
      threadId: "test-thread-id",
      content: "스레드 테스트 메시지입니다.",
      messageType: "text",
    });

    testResults.eventsSent++;

    setTimeout(() => {
      testTypingIndicators();
    }, 2000);
  }, 2000);
}

// 타이핑 인디케이터 테스트
function testTypingIndicators() {
  console.log("⌨️ 타이핑 인디케이터 테스트...");

  // 채팅방 타이핑 시작
  socket.emit("chatroom_typing_start", {
    chatroomId: "test-chatroom-id",
  });

  testResults.eventsSent++;

  setTimeout(() => {
    // 채팅방 타이핑 중지
    socket.emit("chatroom_typing_stop", {
      chatroomId: "test-chatroom-id",
    });

    testResults.eventsSent++;

    setTimeout(() => {
      testUserStatus();
    }, 2000);
  }, 2000);
}

// 사용자 상태 업데이트 테스트
function testUserStatus() {
  console.log("👤 사용자 상태 업데이트 테스트...");

  socket.emit("update_user_status", {
    status: "online",
    lastSeen: new Date().toISOString(),
  });

  testResults.eventsSent++;

  setTimeout(() => {
    console.log("🏁 모든 WebSocket 이벤트 테스트 완료!");
    socket.disconnect();
  }, 2000);
}

// 테스트 결과 출력
function printTestResults() {
  console.log("\n📊 WebSocket 이벤트 테스트 결과:");
  console.log(`✅ 연결: ${testResults.connection ? "성공" : "실패"}`);
  console.log(`📤 전송된 이벤트: ${testResults.eventsSent}개`);
  console.log(`📥 수신된 이벤트: ${testResults.eventsReceived}개`);

  if (receivedEvents.length > 0) {
    console.log("\n📋 수신된 이벤트 목록:");
    receivedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.event} (${event.timestamp})`);
      if (event.data) {
        console.log(`   데이터 키: ${Object.keys(event.data).join(", ")}`);
      }
    });
  }

  console.log(
    `\n🎯 테스트 성공 여부: ${testResults.connection ? "✅ 성공" : "❌ 실패"}`
  );
}

// 60초 후 타임아웃
setTimeout(() => {
  console.log("⏰ 테스트 타임아웃");
  printTestResults();
  socket.disconnect();
  process.exit(1);
}, 60000);

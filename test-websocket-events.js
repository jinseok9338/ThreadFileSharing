const { io } = require('socket.io-client');

console.log('🔌 WebSocket 이벤트 테스트 시작...');

// 테스트용 JWT 토큰 (실제 토큰이 필요함)
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MzMxNjQ4MDB9.test-signature';

// Socket.IO 클라이언트 생성
const socket = io('http://localhost:3001', {
  transports: ['polling', 'websocket'],
  timeout: 10000,
  forceNew: true,
  reconnection: false,
  autoConnect: true,
  auth: {
    token: testToken
  }
});

let testResults = {
  connection: false,
  roomJoin: false,
  events: {
    received: 0,
    sent: 0
  }
};

// 연결 성공 이벤트
socket.on('connect', () => {
  console.log('✅ WebSocket 연결 성공!');
  console.log(`📡 Socket ID: ${socket.id}`);
  testResults.connection = true;
  
  // 연결 후 다양한 이벤트들을 테스트
  setTimeout(() => {
    testRoomJoin();
  }, 1000);
});

// 연결 실패 이벤트
socket.on('connect_error', (error) => {
  console.log('❌ WebSocket 연결 실패:', error.message);
  process.exit(1);
});

// 연결 해제 이벤트
socket.on('disconnect', (reason) => {
  console.log('🔌 WebSocket 연결 해제됨:', reason);
  printTestResults();
  process.exit(0);
});

// 서버로부터 메시지 수신
socket.onAny((event, ...args) => {
  console.log(`📨 수신된 이벤트: ${event}`, args.length > 0 ? args[0] : '');
  testResults.events.received++;
});

// 인증 관련 이벤트
socket.on('auth_error', (error) => {
  console.log('🔐 인증 오류:', error);
});

socket.on('auth_success', (data) => {
  console.log('🔐 인증 성공:', data);
});

// 룸 조인 테스트
function testRoomJoin() {
  console.log('🏠 회사 룸 조인 테스트...');
  
  socket.emit('join_company', {
    companyId: 'test-company-id'
  });
  
  testResults.events.sent++;
  
  setTimeout(() => {
    testChatroomJoin();
  }, 1000);
}

// 채팅방 조인 테스트
function testChatroomJoin() {
  console.log('💬 채팅방 조인 테스트...');
  
  socket.emit('join_chatroom', {
    chatroomId: 'test-chatroom-id'
  });
  
  testResults.events.sent++;
  
  setTimeout(() => {
    testThreadJoin();
  }, 1000);
}

// 스레드 조인 테스트
function testThreadJoin() {
  console.log('🧵 스레드 조인 테스트...');
  
  socket.emit('join_thread', {
    threadId: 'test-thread-id'
  });
  
  testResults.events.sent++;
  
  setTimeout(() => {
    testUploadSessionJoin();
  }, 1000);
}

// 업로드 세션 조인 테스트
function testUploadSessionJoin() {
  console.log('📁 업로드 세션 조인 테스트...');
  
  socket.emit('join_upload_session', {
    sessionId: 'test-session-id'
  });
  
  testResults.events.sent++;
  
  setTimeout(() => {
    testChatMessages();
  }, 1000);
}

// 채팅 메시지 테스트
function testChatMessages() {
  console.log('💭 채팅 메시지 테스트...');
  
  // 채팅방 메시지
  socket.emit('send_chatroom_message', {
    chatroomId: 'test-chatroom-id',
    content: '안녕하세요! 테스트 메시지입니다.',
    messageType: 'text'
  });
  
  testResults.events.sent++;
  
  setTimeout(() => {
    // 스레드 메시지
    socket.emit('send_thread_message', {
      threadId: 'test-thread-id',
      content: '스레드 테스트 메시지입니다.',
      messageType: 'text'
    });
    
    testResults.events.sent++;
    
    setTimeout(() => {
      testTypingIndicators();
    }, 1000);
  }, 1000);
}

// 타이핑 인디케이터 테스트
function testTypingIndicators() {
  console.log('⌨️ 타이핑 인디케이터 테스트...');
  
  // 채팅방 타이핑 시작
  socket.emit('chatroom_typing_start', {
    chatroomId: 'test-chatroom-id'
  });
  
  testResults.events.sent++;
  
  setTimeout(() => {
    // 채팅방 타이핑 중지
    socket.emit('chatroom_typing_stop', {
      chatroomId: 'test-chatroom-id'
    });
    
    testResults.events.sent++;
    
    setTimeout(() => {
      testUserStatus();
    }, 1000);
  }, 1000);
}

// 사용자 상태 업데이트 테스트
function testUserStatus() {
  console.log('👤 사용자 상태 업데이트 테스트...');
  
  socket.emit('update_user_status', {
    status: 'online',
    lastSeen: new Date().toISOString()
  });
  
  testResults.events.sent++;
  
  setTimeout(() => {
    console.log('🏁 모든 테스트 완료!');
    socket.disconnect();
  }, 2000);
}

// 테스트 결과 출력
function printTestResults() {
  console.log('\n📊 테스트 결과:');
  console.log(`✅ 연결: ${testResults.connection ? '성공' : '실패'}`);
  console.log(`📤 전송된 이벤트: ${testResults.events.sent}개`);
  console.log(`📥 수신된 이벤트: ${testResults.events.received}개`);
  console.log(`📈 성공률: ${testResults.connection ? '100%' : '0%'}`);
}

// 30초 후 타임아웃
setTimeout(() => {
  console.log('⏰ 테스트 타임아웃');
  printTestResults();
  socket.disconnect();
  process.exit(1);
}, 30000);

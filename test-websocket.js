const { io } = require('socket.io-client');

console.log('🔌 WebSocket 연결 테스트 시작...');

// Socket.IO 클라이언트 생성
const socket = io('http://localhost:3001', {
  transports: ['polling', 'websocket'], // polling을 먼저 시도
  timeout: 10000,
  forceNew: true,
  reconnection: false,
  autoConnect: true
});

// 연결 성공 이벤트
socket.on('connect', () => {
  console.log('✅ WebSocket 연결 성공!');
  console.log(`📡 Socket ID: ${socket.id}`);
  console.log(`🔗 연결 상태: ${socket.connected}`);
  
  // 연결 후 3초 뒤에 연결 해제
  setTimeout(() => {
    console.log('🔌 연결 해제 중...');
    socket.disconnect();
  }, 3000);
});

// 연결 실패 이벤트
socket.on('connect_error', (error) => {
  console.log('❌ WebSocket 연결 실패:', error.message);
  console.log('🔍 에러 상세:', error);
  process.exit(1);
});

// 연결 시도 이벤트
socket.on('connect_attempt', () => {
  console.log('🔄 연결 시도 중...');
});

// 재연결 시도 이벤트
socket.on('reconnect_attempt', () => {
  console.log('🔄 재연결 시도 중...');
});

// 연결 해제 이벤트
socket.on('disconnect', (reason) => {
  console.log('🔌 WebSocket 연결 해제됨:', reason);
  process.exit(0);
});

// 서버로부터 메시지 수신
socket.onAny((event, ...args) => {
  console.log(`📨 수신된 이벤트: ${event}`, args);
});

// 10초 후 타임아웃
setTimeout(() => {
  console.log('⏰ 연결 타임아웃');
  socket.disconnect();
  process.exit(1);
}, 10000);

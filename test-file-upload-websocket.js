const { io } = require('socket.io-client');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

console.log('🔌 파일 업로드 WebSocket 연동 테스트 시작...');

// 테스트용 JWT 토큰
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNGRmNGUwOC1mODgyLTQyYTAtYTY3Mi0zZmEwOGU4ZTY5NWIiLCJjb21wYW55SWQiOiI0MTYzYzNjOC1lNWIzLTRhMzEtYWUxYy00M2U3Y2RjZjk0OGIiLCJjb21wYW55Um9sZSI6Im93bmVyIiwiaWF0IjoxNzU5NDkxMjE0LCJleHAiOjE3NTk0OTIxMTR9.cyetodhJ3mkZHTzxpHt4RL3JG06lfKNtxO4p9_dqvik';
const COMPANY_ID = '4163c3c8-e5b3-4a31-ae1c-43e7cdcf948b';

// 테스트 파일 생성
const testFileContent = 'This is a test file for WebSocket upload progress monitoring. '.repeat(100);
const testFilePath = '/tmp/test-websocket-file.txt';
fs.writeFileSync(testFilePath, testFileContent);

console.log('📁 테스트 파일 생성 완료:', testFilePath);

// Socket.IO 클라이언트 생성
const socket = io('http://localhost:3001', {
  transports: ['polling', 'websocket'],
  timeout: 10000,
  forceNew: true,
  reconnection: false,
  autoConnect: true,
  extraHeaders: {
    'Authorization': `Bearer ${TOKEN}`
  }
});

let uploadSessionId = null;
let websocketEvents = [];

// WebSocket 이벤트 수신
socket.onAny((event, ...args) => {
  const timestamp = new Date().toISOString();
  console.log(`📨 [${timestamp}] 수신된 이벤트: ${event}`);
  
  if (args.length > 0) {
    console.log('   📄 데이터:', JSON.stringify(args[0], null, 2));
  }
  
  websocketEvents.push({
    event,
    data: args[0] || null,
    timestamp
  });
});

socket.on('connect', async () => {
  console.log('✅ WebSocket 연결 성공!');
  console.log('📡 Socket ID:', socket.id);
  
  // 회사 룸에 조인
  socket.emit('join_company', {
    companyId: COMPANY_ID
  });
  
  console.log('🏠 회사 룸 조인 요청 전송');
  
  // 잠시 대기 후 파일 업로드 시작
  setTimeout(async () => {
    await testFileUpload();
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.log('❌ WebSocket 연결 실패:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 WebSocket 연결 해제:', reason);
  printTestResults();
  process.exit(0);
});

// 파일 업로드 테스트
async function testFileUpload() {
  try {
    console.log('📤 파일 업로드 시작...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('displayName', 'WebSocket Test File');
    form.append('accessType', 'PRIVATE');
    form.append('sessionName', 'WebSocket Test Session');
    form.append('createThread', 'false');
    
    const response = await axios.post(
      'http://localhost:3001/api/v1/files/upload/single',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${TOKEN}`
        },
        timeout: 30000
      }
    );
    
    console.log('✅ 파일 업로드 완료!');
    console.log('📄 응답:', JSON.stringify(response.data, null, 2));
    
    // 업로드 세션 ID 저장
    if (response.data.data?.uploadSessionId) {
      uploadSessionId = response.data.data.uploadSessionId;
      console.log('🆔 업로드 세션 ID:', uploadSessionId);
      
      // 업로드 세션 룸에 조인
      socket.emit('join_upload_session', {
        sessionId: uploadSessionId
      });
      console.log('📁 업로드 세션 룸 조인 요청 전송');
    }
    
    // 5초 후 테스트 종료
    setTimeout(() => {
      console.log('🏁 테스트 완료!');
      socket.disconnect();
    }, 5000);
    
  } catch (error) {
    console.error('❌ 파일 업로드 실패:', error.response?.data || error.message);
    socket.disconnect();
  }
}

// 테스트 결과 출력
function printTestResults() {
  console.log('\n📊 WebSocket 파일 업로드 테스트 결과:');
  console.log(`📨 수신된 이벤트 수: ${websocketEvents.length}개`);
  
  if (websocketEvents.length > 0) {
    console.log('\n📋 수신된 이벤트 목록:');
    websocketEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.event} (${event.timestamp})`);
      if (event.data) {
        console.log(`   데이터 키: ${Object.keys(event.data).join(', ')}`);
      }
    });
  }
  
  console.log(`\n🎯 테스트 성공 여부: ${websocketEvents.length > 0 ? '✅ 성공' : '❌ 실패'}`);
  
  // 테스트 파일 정리
  try {
    fs.unlinkSync(testFilePath);
    console.log('🗑️ 테스트 파일 정리 완료');
  } catch (error) {
    console.log('⚠️ 테스트 파일 정리 실패:', error.message);
  }
}

// 30초 후 타임아웃
setTimeout(() => {
  console.log('⏰ 테스트 타임아웃');
  printTestResults();
  socket.disconnect();
  process.exit(1);
}, 30000);

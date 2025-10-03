const io = require('socket.io-client');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:3001';
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error('❌ TOKEN 환경변수가 필요합니다');
  process.exit(1);
}

console.log('🔌 파일 업로드 WebSocket 연동 테스트 시작...');

// 테스트 파일 생성
const testFileName = `test-websocket-file-${Date.now()}.txt`;
const testFilePath = path.join('/tmp', testFileName);
fs.writeFileSync(testFilePath, 'WebSocket 테스트용 파일 내용입니다.');

console.log(`📁 테스트 파일 생성 완료: ${testFilePath}`);

const socket = io(SERVER_URL, {
  auth: {
    token: TOKEN
  },
  transports: ['websocket']
});

let eventsReceived = 0;
const events = [];

socket.on('connect', () => {
  console.log('✅ WebSocket 연결 성공!');
  console.log(`📡 Socket ID: ${socket.id}`);
  
  // 회사 룸 조인
  console.log('🏠 회사 룸 조인 요청 전송');
  socket.emit('join_company_room');
  
  // 새 채팅방 ID로 조인
  const chatroomId = 'a1da10d3-f1db-46bf-a6af-769edf28bae2';
  console.log('💬 채팅방 조인 요청 전송');
  socket.emit('join_chatroom', { chatroomId });
  
  // 파일 업로드 시작
  setTimeout(async () => {
    try {
      console.log('📤 파일 업로드 시작...');
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('chatroomId', chatroomId);
      
      const uploadResponse = await axios.post(`${SERVER_URL}/api/v1/files/upload/single`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${TOKEN}`
        }
      });
      
      console.log('📤 파일 업로드 완료:', uploadResponse.data.data.file.id);
      
    } catch (error) {
      console.error('❌ 파일 업로드 실패:', error.response?.data || error.message);
    }
  }, 1000);
});

socket.on('file_upload_progress', (data) => {
  eventsReceived++;
  events.push({ type: 'file_upload_progress', data });
  console.log('📊 업로드 진행률 이벤트:', data);
});

socket.on('file_upload_completed', (data) => {
  eventsReceived++;
  events.push({ type: 'file_upload_completed', data });
  console.log('✅ 파일 업로드 완료 이벤트:', data);
});

socket.on('disconnect', (reason) => {
  console.log(`🔌 WebSocket 연결 해제: ${reason}`);
  
  console.log('\n📊 WebSocket 파일 업로드 테스트 결과:');
  console.log(`📨 수신된 이벤트 수: ${eventsReceived}개`);
  
  if (eventsReceived > 0) {
    console.log('🎯 테스트 성공 여부: ✅ 성공');
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.type}`);
    });
  } else {
    console.log('🎯 테스트 성공 여부: ❌ 실패');
  }
  
  // 정리
  try {
    fs.unlinkSync(testFilePath);
    console.log('🗑️ 테스트 파일 정리 완료');
  } catch (error) {
    console.log('⚠️ 테스트 파일 정리 실패:', error.message);
  }
  
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket 연결 오류:', error.message);
  process.exit(1);
});

// 10초 후 자동 종료
setTimeout(() => {
  console.log('⏰ 타임아웃으로 테스트 종료');
  socket.disconnect();
}, 10000);

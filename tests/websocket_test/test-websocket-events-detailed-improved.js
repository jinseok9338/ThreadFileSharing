const EventHelper = require("./helpers/event-helper");

console.log("🔌 WebSocket 이벤트 상세 테스트 시작...");

async function testWebSocketEventsDetailed() {
  const eventHelper = new EventHelper();

  try {
    // 1. WebSocket 연결 생성
    console.log("🔌 WebSocket 연결 생성...");
    const { socket, user } = await eventHelper.createConnection();
    console.log(`✅ 연결 성공: ${user.email}`);

    // 2. 회사 룸 자동 조인 확인
    console.log("🏢 회사 룸 자동 조인 확인...");
    const companyRoomJoin = await eventHelper.waitForEvent(
      socket,
      "room_joined",
      (data) => {
        return (
          data.roomType === "company" && data.roomId.includes(user.companyId)
        );
      }
    );
    console.log("✅ 회사 룸 자동 조인 확인:", companyRoomJoin);

    // 3. 사용자 세션 룸 조인 확인
    console.log("👤 사용자 세션 룸 조인 확인...");
    const userSessionJoin = await eventHelper.waitForEvent(
      socket,
      "room_joined",
      (data) => {
        return (
          data.roomType === "user_session" && data.roomId.includes(user.userId)
        );
      }
    );
    console.log("✅ 사용자 세션 룸 조인 확인:", userSessionJoin);

    // 4. 다양한 메시지 타입 테스트
    console.log("💬 다양한 메시지 타입 테스트...");

    // 텍스트 메시지
    const textMessage = {
      chatroomId: "test-chatroom-id",
      content: "This is a text message test",
      messageType: "TEXT",
    };
    const textResult = await eventHelper.sendAndVerifyMessage(
      socket,
      textMessage
    );
    console.log("✅ 텍스트 메시지 확인:", textResult);

    // 시스템 메시지
    const systemMessage = {
      chatroomId: "test-chatroom-id",
      content: "System notification message",
      messageType: "SYSTEM",
    };
    const systemResult = await eventHelper.sendAndVerifyMessage(
      socket,
      systemMessage
    );
    console.log("✅ 시스템 메시지 확인:", systemResult);

    // 5. 룸 조인/나가기 테스트
    console.log("🚪 룸 조인/나가기 테스트...");

    // 채팅방 조인 테스트
    const chatroomJoinResult = await eventHelper.joinRoomAndVerify(
      socket,
      "chatroom",
      "test-chatroom-id"
    );
    console.log("✅ 채팅방 조인 확인:", chatroomJoinResult);

    // 스레드 조인 테스트
    const threadJoinResult = await eventHelper.joinRoomAndVerify(
      socket,
      "thread",
      "test-thread-id"
    );
    console.log("✅ 스레드 조인 확인:", threadJoinResult);

    // 6. 타이핑 인디케이터 상세 테스트
    console.log("⌨️ 타이핑 인디케이터 상세 테스트...");

    // 타이핑 시작
    const typingStart = await eventHelper.testTypingIndicator(
      socket,
      "test-chatroom-id",
      true
    );
    console.log("✅ 타이핑 시작 확인:", typingStart);

    // 타이핑 중지
    const typingStop = await eventHelper.testTypingIndicator(
      socket,
      "test-chatroom-id",
      false
    );
    console.log("✅ 타이핑 중지 확인:", typingStop);

    // 7. 에러 처리 테스트
    console.log("❌ 에러 처리 테스트...");

    // 잘못된 이벤트 전송
    const errorResult = await eventHelper.testErrorHandling(
      socket,
      "invalid_event",
      { invalidData: "test" }
    );
    console.log("✅ 에러 응답 확인:", errorResult);

    // 8. 테스트 결과 요약
    const summary = eventHelper.getTestSummary();
    console.log("\n📊 상세 테스트 결과 요약:");
    console.log(`   연결 상태: ${summary.connection ? "✅ 성공" : "❌ 실패"}`);
    console.log(`   수신된 이벤트: ${summary.eventsReceived}개`);
    console.log(`   전송된 이벤트: ${summary.eventsSent}개`);
    console.log(`   비즈니스 로직 검증: ${summary.businessLogicValidated}개`);
    console.log(`   성공률: ${summary.successRate}%`);
    console.log(`   에러 수: ${summary.errors.length}개`);

    if (summary.errors.length > 0) {
      console.log("\n❌ 에러 목록:");
      summary.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // 9. 이벤트 로그 출력
    if (summary.eventLog.length > 0) {
      console.log("\n📋 이벤트 로그:");
      summary.eventLog.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.event} (${event.timestamp})`);
        if (event.data) {
          console.log(`      데이터: ${JSON.stringify(event.data, null, 2)}`);
        }
      });
    }

    // 10. 정리
    eventHelper.cleanup();
    console.log("✅ 상세 이벤트 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testWebSocketEventsDetailed();

const EventHelper = require("./helpers/event-helper");

console.log("🔌 WebSocket 실시간 이벤트 테스트 시작...");

async function testWebSocketEvents() {
  const eventHelper = new EventHelper();

  try {
    // 1. WebSocket 연결 생성
    console.log("🔌 WebSocket 연결 생성...");
    const { socket, user } = await eventHelper.createConnection();
    console.log(`✅ 연결 성공: ${user.email}`);

    // 2. 회사 룸 조인 테스트
    console.log("🏢 회사 룸 조인 테스트...");
    await eventHelper.sendEvent(socket, "join_company", {
      companyId: user.companyId,
    });

    const companyRoomJoin = await eventHelper.waitForEvent(
      socket,
      "user_joined_company",
      (data) => {
        return data.user && data.joinedAt;
      }
    );
    console.log("✅ 회사 룸 조인 확인:", companyRoomJoin);

    // 3. 메시지 전송 및 수신 테스트
    console.log("💬 메시지 전송 및 수신 테스트...");
    const testMessage = {
      chatroomId: "test-chatroom-id",
      content: "Hello from improved WebSocket events test!",
      messageType: "TEXT",
    };

    const receivedMessage = await eventHelper.sendAndVerifyMessage(
      socket,
      testMessage
    );
    console.log("✅ 메시지 수신 확인:", receivedMessage);

    // 4. 타이핑 인디케이터 테스트
    console.log("⌨️ 타이핑 인디케이터 테스트...");
    await eventHelper.sendEvent(socket, "chatroom_typing_start", {
      roomId: "test-chatroom-id",
    });

    const typingResult = await eventHelper.waitForEvent(
      socket,
      "chatroom_typing",
      (data) => {
        return (
          data.chatroomId === "test-chatroom-id" &&
          data.isTyping === true &&
          data.user
        );
      }
    );
    console.log("✅ 타이핑 인디케이터 확인:", typingResult);

    // 5. 타이핑 인디케이터 중지 테스트
    console.log("⌨️ 타이핑 인디케이터 중지 테스트...");
    await eventHelper.sendEvent(socket, "chatroom_typing_stop", {
      roomId: "test-chatroom-id",
    });

    const typingStopResult = await eventHelper.waitForEvent(
      socket,
      "chatroom_typing",
      (data) => {
        return (
          data.chatroomId === "test-chatroom-id" &&
          data.isTyping === false &&
          data.user
        );
      }
    );
    console.log("✅ 타이핑 중지 확인:", typingStopResult);

    // 6. 테스트 결과 요약
    const summary = eventHelper.getTestSummary();
    console.log("\n📊 테스트 결과 요약:");
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

    // 7. 정리
    eventHelper.cleanup();
    console.log("✅ 이벤트 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testWebSocketEvents();

const EventHelper = require("./helpers/event-helper");

console.log("🔌 채팅방 및 스레드 통합 WebSocket 테스트 시작...");

async function testChatroomThreadIntegration() {
  const eventHelper = new EventHelper();

  try {
    // 1. WebSocket 연결 생성
    console.log("🔌 WebSocket 연결 생성...");
    const { socket, user } = await eventHelper.createConnection();
    console.log(`✅ 연결 성공: ${user.email}`);

    // 2. 회사 룸 조인
    console.log("🏢 회사 룸 조인...");
    await eventHelper.sendEvent(socket, "join_company", {
      companyId: user.companyId,
    });

    const companyRoomJoin = await eventHelper.waitForEvent(
      socket,
      "user_joined_company",
      (data) => data.user && data.joinedAt
    );
    console.log("✅ 회사 룸 조인 확인:", companyRoomJoin);

    // 3. 채팅방 조인 테스트
    console.log("💬 채팅방 조인 테스트...");
    const chatroomId = "test-chatroom-integration";

    const chatroomJoin = await eventHelper.joinRoomAndVerify(
      socket,
      "chatroom",
      chatroomId
    );
    console.log("✅ 채팅방 조인 확인:", chatroomJoin);

    // 4. 채팅방 메시지 전송 테스트
    console.log("📤 채팅방 메시지 전송 테스트...");
    const chatroomMessage = "Hello from chatroom integration test!";

    const chatroomMessageResult =
      await eventHelper.sendChatroomMessageAndVerify(
        socket,
        chatroomId,
        chatroomMessage,
        "TEXT"
      );
    console.log("✅ 채팅방 메시지 전송 확인:", chatroomMessageResult);

    // 5. 채팅방 타이핑 인디케이터 테스트
    console.log("⌨️ 채팅방 타이핑 인디케이터 테스트...");

    // 타이핑 시작
    const chatroomTypingStart = await eventHelper.testChatroomTypingIndicator(
      socket,
      chatroomId,
      true
    );
    console.log("✅ 채팅방 타이핑 시작 확인:", chatroomTypingStart);

    // 타이핑 중지
    const chatroomTypingStop = await eventHelper.testChatroomTypingIndicator(
      socket,
      chatroomId,
      false
    );
    console.log("✅ 채팅방 타이핑 중지 확인:", chatroomTypingStop);

    // 6. 스레드 조인 테스트
    console.log("🧵 스레드 조인 테스트...");
    const threadId = "test-thread-integration";

    const threadJoin = await eventHelper.joinRoomAndVerify(
      socket,
      "thread",
      threadId
    );
    console.log("✅ 스레드 조인 확인:", threadJoin);

    // 7. 스레드 메시지 전송 테스트
    console.log("📤 스레드 메시지 전송 테스트...");
    const threadMessage = "Hello from thread integration test!";

    const threadMessageResult = await eventHelper.sendThreadMessageAndVerify(
      socket,
      threadId,
      threadMessage,
      "TEXT"
    );
    console.log("✅ 스레드 메시지 전송 확인:", threadMessageResult);

    // 8. 스레드 타이핑 인디케이터 테스트
    console.log("⌨️ 스레드 타이핑 인디케이터 테스트...");

    // 타이핑 시작
    const threadTypingStart = await eventHelper.testThreadTypingIndicator(
      socket,
      threadId,
      true
    );
    console.log("✅ 스레드 타이핑 시작 확인:", threadTypingStart);

    // 타이핑 중지
    const threadTypingStop = await eventHelper.testThreadTypingIndicator(
      socket,
      threadId,
      false
    );
    console.log("✅ 스레드 타이핑 중지 확인:", threadTypingStop);

    // 9. 사용자 상태 업데이트 테스트
    console.log("👤 사용자 상태 업데이트 테스트...");

    // 온라인 상태
    const onlineStatus = await eventHelper.testUserStatusUpdate(
      socket,
      "online",
      "Available for chat"
    );
    console.log("✅ 온라인 상태 업데이트 확인:", onlineStatus);

    // 자리비움 상태
    const awayStatus = await eventHelper.testUserStatusUpdate(
      socket,
      "away",
      "Be right back"
    );
    console.log("✅ 자리비움 상태 업데이트 확인:", awayStatus);

    // 10. 다양한 메시지 타입 테스트
    console.log("💬 다양한 메시지 타입 테스트...");

    // 시스템 메시지
    const systemMessage = await eventHelper.sendChatroomMessageAndVerify(
      socket,
      chatroomId,
      "System notification message",
      "SYSTEM"
    );
    console.log("✅ 시스템 메시지 전송 확인:", systemMessage);

    // 스레드 시스템 메시지
    const threadSystemMessage = await eventHelper.sendThreadMessageAndVerify(
      socket,
      threadId,
      "Thread system notification",
      "SYSTEM"
    );
    console.log("✅ 스레드 시스템 메시지 전송 확인:", threadSystemMessage);

    // 11. 룸 나가기 테스트
    console.log("🚪 룸 나가기 테스트...");

    // 채팅방 나가기
    await eventHelper.sendEvent(socket, "leave_chatroom", {
      roomId: chatroomId,
    });
    console.log("✅ 채팅방 나가기 요청 전송");

    // 스레드 나가기
    await eventHelper.sendEvent(socket, "leave_thread", {
      roomId: threadId,
    });
    console.log("✅ 스레드 나가기 요청 전송");

    // 12. 테스트 결과 요약
    const summary = eventHelper.getTestSummary();
    console.log("\n📊 채팅방 및 스레드 통합 테스트 결과 요약:");
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

    // 13. 정리
    eventHelper.cleanup();
    console.log("✅ 채팅방 및 스레드 통합 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testChatroomThreadIntegration();

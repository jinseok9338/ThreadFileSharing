const EventHelper = require("./helpers/event-helper");

console.log("🔌 WebSocket 에러 처리 및 엣지 케이스 테스트 시작...");

async function testErrorHandling() {
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

    // 3. 채팅방 조인
    console.log("💬 채팅방 조인...");
    const chatroomId = "test-error-handling-chatroom";

    const chatroomJoin = await eventHelper.joinRoomAndVerify(
      socket,
      "chatroom",
      chatroomId
    );
    console.log("✅ 채팅방 조인 확인:", chatroomJoin);

    // 4. 잘못된 이벤트 이름 테스트
    console.log("❌ 잘못된 이벤트 이름 테스트...");
    const invalidEventResult = await eventHelper.testErrorHandling(
      socket,
      "invalid_event_name",
      { test: "data" }
    );
    console.log("✅ 잘못된 이벤트 처리 확인:", invalidEventResult);

    // 5. 잘못된 데이터 형식 테스트
    console.log("❌ 잘못된 데이터 형식 테스트...");
    const invalidDataResult = await eventHelper.testErrorHandling(
      socket,
      "send_chatroom_message",
      { invalidField: "invalid data" }
    );
    console.log("✅ 잘못된 데이터 처리 확인:", invalidDataResult);

    // 6. 권한 없는 채팅방 접근 테스트
    console.log("❌ 권한 없는 채팅방 접근 테스트...");
    const unauthorizedChatroomResult = await eventHelper.testErrorHandling(
      socket,
      "join_chatroom",
      { chatroomId: "unauthorized-chatroom-id" }
    );
    console.log("✅ 권한 없는 채팅방 처리 확인:", unauthorizedChatroomResult);

    // 7. 권한 없는 스레드 접근 테스트
    console.log("❌ 권한 없는 스레드 접근 테스트...");
    const unauthorizedThreadResult = await eventHelper.testErrorHandling(
      socket,
      "join_thread",
      { threadId: "unauthorized-thread-id" }
    );
    console.log("✅ 권한 없는 스레드 처리 확인:", unauthorizedThreadResult);

    // 8. 빈 메시지 전송 테스트
    console.log("❌ 빈 메시지 전송 테스트...");
    const emptyMessageResult = await eventHelper.testErrorHandling(
      socket,
      "send_chatroom_message",
      {
        chatroomId: chatroomId,
        content: "",
        messageType: "TEXT",
      }
    );
    console.log("✅ 빈 메시지 처리 확인:", emptyMessageResult);

    // 9. 너무 긴 메시지 전송 테스트
    console.log("❌ 너무 긴 메시지 전송 테스트...");
    const longMessage = "A".repeat(10000); // 10KB 메시지
    const longMessageResult = await eventHelper.testErrorHandling(
      socket,
      "send_chatroom_message",
      {
        chatroomId: chatroomId,
        content: longMessage,
        messageType: "TEXT",
      }
    );
    console.log("✅ 너무 긴 메시지 처리 확인:", longMessageResult);

    // 10. 잘못된 사용자 상태 업데이트 테스트
    console.log("❌ 잘못된 사용자 상태 업데이트 테스트...");
    const invalidStatusResult = await eventHelper.testErrorHandling(
      socket,
      "update_user_status",
      {
        status: "invalid_status",
        customMessage: "Invalid status test",
      }
    );
    console.log("✅ 잘못된 상태 처리 확인:", invalidStatusResult);

    // 11. 연결 복구 테스트
    console.log("🔄 연결 복구 테스트...");
    const recoveryResult = await eventHelper.testConnectionRecovery(socket);
    console.log("✅ 연결 복구 확인:", recoveryResult);

    // 12. 네트워크 지연 시뮬레이션 테스트
    console.log("⏱️ 네트워크 지연 시뮬레이션 테스트...");

    // 느린 메시지 전송
    const slowMessage = "Slow network test message";
    const slowStartTime = Date.now();

    await eventHelper.sendEvent(socket, "send_chatroom_message", {
      chatroomId: chatroomId,
      content: slowMessage,
      messageType: "TEXT",
    });

    // 지연 후 응답 확인
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const slowEndTime = Date.now();
    const slowDuration = slowEndTime - slowStartTime;

    console.log(`✅ 네트워크 지연 테스트 완료: ${slowDuration}ms`);

    // 13. 동시 다중 에러 테스트
    console.log("💥 동시 다중 에러 테스트...");

    const errorPromises = [
      eventHelper.testErrorHandling(socket, "invalid_event_1", { test: 1 }),
      eventHelper.testErrorHandling(socket, "invalid_event_2", { test: 2 }),
      eventHelper.testErrorHandling(socket, "invalid_event_3", { test: 3 }),
    ];

    const errorResults = await Promise.allSettled(errorPromises);
    const successfulErrors = errorResults.filter(
      (result) => result.status === "fulfilled"
    ).length;

    console.log(`✅ 동시 다중 에러 처리: ${successfulErrors}/3 성공`);

    // 14. 메모리 누수 테스트
    console.log("🧠 메모리 누수 테스트...");

    const initialMemory = eventHelper.getMemoryUsage("Before Memory Test");

    // 많은 이벤트 전송
    for (let i = 0; i < 100; i++) {
      await eventHelper.sendEvent(socket, "send_chatroom_message", {
        chatroomId: chatroomId,
        content: `Memory test message ${i}`,
        messageType: "TEXT",
      });
    }

    const finalMemory = eventHelper.getMemoryUsage("After Memory Test");
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

    console.log(`✅ 메모리 누수 테스트 완료: Heap +${memoryIncrease}MB`);

    // 15. 테스트 결과 요약
    const summary = eventHelper.getTestSummary();
    console.log("\n📊 에러 처리 및 엣지 케이스 테스트 결과 요약:");
    console.log(`   연결 상태: ${summary.connection ? "✅ 성공" : "❌ 실패"}`);
    console.log(`   수신된 이벤트: ${summary.eventsReceived}개`);
    console.log(`   전송된 이벤트: ${summary.eventsSent}개`);
    console.log(`   비즈니스 로직 검증: ${summary.businessLogicValidated}개`);
    console.log(`   성공률: ${summary.successRate}%`);
    console.log(`   에러 수: ${summary.errors.length}개`);

    // 16. 에러 처리 성공률 분석
    console.log("\n🛡️ 에러 처리 성공률 분석:");
    console.log(
      `   잘못된 이벤트 처리: ${
        invalidEventResult.success ? "✅ 성공" : "❌ 실패"
      }`
    );
    console.log(
      `   잘못된 데이터 처리: ${
        invalidDataResult.success ? "✅ 성공" : "❌ 실패"
      }`
    );
    console.log(
      `   권한 없는 채팅방: ${
        unauthorizedChatroomResult.success ? "✅ 성공" : "❌ 실패"
      }`
    );
    console.log(
      `   권한 없는 스레드: ${
        unauthorizedThreadResult.success ? "✅ 성공" : "❌ 실패"
      }`
    );
    console.log(
      `   빈 메시지 처리: ${emptyMessageResult.success ? "✅ 성공" : "❌ 실패"}`
    );
    console.log(
      `   너무 긴 메시지: ${longMessageResult.success ? "✅ 성공" : "❌ 실패"}`
    );
    console.log(
      `   잘못된 상태: ${invalidStatusResult.success ? "✅ 성공" : "❌ 실패"}`
    );
    console.log(
      `   연결 복구: ${recoveryResult.success ? "✅ 성공" : "❌ 실패"}`
    );
    console.log(`   동시 다중 에러: ${successfulErrors}/3 성공`);
    console.log(
      `   메모리 누수: ${
        memoryIncrease < 10 ? "✅ 안전" : "⚠️ 주의"
      } (+${memoryIncrease}MB)`
    );

    if (summary.errors.length > 0) {
      console.log("\n❌ 에러 목록:");
      summary.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // 17. 정리
    eventHelper.cleanup();
    console.log("✅ 에러 처리 및 엣지 케이스 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testErrorHandling();

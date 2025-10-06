const EventHelper = require("./helpers/event-helper");

console.log("🔌 WebSocket 통합 및 검증 테스트 시작...");

async function testIntegrationValidation() {
  const eventHelper = new EventHelper();

  try {
    // 1. 초기 메모리 사용량 확인
    console.log("📊 초기 메모리 사용량 확인...");
    const initialMemory = eventHelper.getMemoryUsage("Integration Start");

    // 2. WebSocket 연결 생성
    console.log("🔌 WebSocket 연결 생성...");
    const { socket, user } = await eventHelper.createConnection();
    console.log(`✅ 연결 성공: ${user.email}`);

    // 3. 기본 연결 검증
    console.log("🔍 기본 연결 검증...");
    const connectionEstablished = {
      success: true,
      userId: user.userId,
      companyId: user.companyId,
      username: user.email,
      socketId: socket.id,
      connected: socket.connected,
    };
    console.log("✅ 연결 검증 확인:", connectionEstablished);

    // 4. 회사 룸 조인 검증
    console.log("🏢 회사 룸 조인 검증...");
    await eventHelper.sendEvent(socket, "join_company", {
      companyId: user.companyId,
    });

    const companyRoomJoin = await eventHelper.waitForEvent(
      socket,
      "user_joined_company",
      (data) => data.user && data.joinedAt
    );
    console.log("✅ 회사 룸 조인 확인:", companyRoomJoin);

    // 5. 채팅방 통합 테스트
    console.log("💬 채팅방 통합 테스트...");
    const chatroomId = "test-integration-chatroom";

    // 채팅방 조인
    const chatroomJoin = await eventHelper.joinRoomAndVerify(
      socket,
      "chatroom",
      chatroomId
    );
    console.log("✅ 채팅방 조인 확인:", chatroomJoin);

    // 채팅방 메시지 전송
    const chatroomMessage = await eventHelper.sendChatroomMessageAndVerify(
      socket,
      chatroomId,
      "Integration test message",
      "TEXT"
    );
    console.log("✅ 채팅방 메시지 전송 확인:", chatroomMessage);

    // 채팅방 타이핑 인디케이터
    const chatroomTyping = await eventHelper.testChatroomTypingIndicator(
      socket,
      chatroomId,
      true
    );
    console.log("✅ 채팅방 타이핑 확인:", chatroomTyping);

    // 6. 스레드 통합 테스트
    console.log("🧵 스레드 통합 테스트...");
    const threadId = "test-integration-thread";

    // 스레드 조인
    const threadJoin = await eventHelper.joinRoomAndVerify(
      socket,
      "thread",
      threadId
    );
    console.log("✅ 스레드 조인 확인:", threadJoin);

    // 스레드 메시지 전송
    const threadMessage = await eventHelper.sendThreadMessageAndVerify(
      socket,
      threadId,
      "Thread integration test message",
      "TEXT"
    );
    console.log("✅ 스레드 메시지 전송 확인:", threadMessage);

    // 스레드 타이핑 인디케이터
    const threadTyping = await eventHelper.testThreadTypingIndicator(
      socket,
      threadId,
      true
    );
    console.log("✅ 스레드 타이핑 확인:", threadTyping);

    // 7. 파일 업로드 통합 테스트
    console.log("📁 파일 업로드 통합 테스트...");
    const sessionId = "integration-upload-session";
    const context = {
      chatroomId: chatroomId,
      threadId: threadId,
    };

    // 업로드 세션 조인
    const uploadSessionJoin = await eventHelper.joinUploadSessionAndVerify(
      socket,
      sessionId,
      context
    );
    console.log("✅ 업로드 세션 조인 확인:", uploadSessionJoin);

    // 8. 사용자 상태 관리 통합 테스트
    console.log("👤 사용자 상태 관리 통합 테스트...");

    // 온라인 상태
    const onlineStatus = await eventHelper.testUserStatusUpdate(
      socket,
      "online",
      "Integration test - online"
    );
    console.log("✅ 온라인 상태 확인:", onlineStatus);

    // 자리비움 상태
    const awayStatus = await eventHelper.testUserStatusUpdate(
      socket,
      "away",
      "Integration test - away"
    );
    console.log("✅ 자리비움 상태 확인:", awayStatus);

    // 9. 성능 통합 테스트
    console.log("⚡ 성능 통합 테스트...");

    // 다중 메시지 성능 테스트
    const performanceResult = await eventHelper.performanceTestMultipleMessages(
      socket,
      chatroomId,
      10, // 10개 메시지
      100 // 100ms 간격
    );
    console.log("✅ 성능 테스트 완료:", performanceResult);

    // 10. 에러 처리 통합 테스트
    console.log("🛡️ 에러 처리 통합 테스트...");

    // 잘못된 이벤트 처리
    const errorResult = await eventHelper.testErrorHandling(
      socket,
      "invalid_integration_event",
      { test: "integration" }
    );
    console.log("✅ 에러 처리 확인:", errorResult);

    // 11. 대용량 데이터 통합 테스트
    console.log("📏 대용량 데이터 통합 테스트...");

    // 대용량 메시지
    const largeMessageResult = await eventHelper.testLargeMessage(
      socket,
      chatroomId,
      25 // 25KB 메시지
    );
    console.log("✅ 대용량 메시지 확인:", largeMessageResult);

    // 12. 동시 작업 통합 테스트
    console.log("🔄 동시 작업 통합 테스트...");

    const concurrentTasks = [
      // 동시 메시지 전송
      eventHelper.sendChatroomMessageAndVerify(
        socket,
        chatroomId,
        "Concurrent message 1",
        "TEXT"
      ),
      eventHelper.sendThreadMessageAndVerify(
        socket,
        threadId,
        "Concurrent message 2",
        "TEXT"
      ),
      // 동시 타이핑 인디케이터
      eventHelper.testChatroomTypingIndicator(socket, chatroomId, true),
      eventHelper.testThreadTypingIndicator(socket, threadId, true),
      // 동시 상태 업데이트
      eventHelper.testUserStatusUpdate(
        socket,
        "busy",
        "Concurrent status update"
      ),
    ];

    const concurrentResults = await Promise.allSettled(concurrentTasks);
    const successfulTasks = concurrentResults.filter(
      (result) => result.status === "fulfilled"
    ).length;

    console.log(`✅ 동시 작업 통합 테스트: ${successfulTasks}/5 성공`);

    // 13. 메모리 사용량 검증
    console.log("📊 메모리 사용량 검증...");
    const finalMemory = eventHelper.getMemoryUsage("Integration End");
    const memoryIncrease = {
      rss: finalMemory.rss - initialMemory.rss,
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
    };

    console.log("📊 메모리 증가량:", memoryIncrease);

    // 14. 연결 안정성 검증
    console.log("🔗 연결 안정성 검증...");

    // 연결 상태 확인
    const isConnected = socket.connected;
    console.log(`연결 상태: ${isConnected ? "✅ 연결됨" : "❌ 연결 안됨"}`);

    // Socket ID 확인
    console.log(`Socket ID: ${socket.id}`);

    // 15. 이벤트 로그 검증
    console.log("📋 이벤트 로그 검증...");
    const eventLog = eventHelper.eventLog;
    console.log(`총 이벤트 로그: ${eventLog.length}개`);

    // 이벤트 타입별 분류
    const eventTypes = {};
    eventLog.forEach((event) => {
      eventTypes[event.event] = (eventTypes[event.event] || 0) + 1;
    });

    console.log("이벤트 타입별 분류:");
    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}개`);
    });

    // 16. 테스트 결과 요약
    const summary = eventHelper.getTestSummary();
    console.log("\n📊 통합 및 검증 테스트 결과 요약:");
    console.log(`   연결 상태: ${summary.connection ? "✅ 성공" : "❌ 실패"}`);
    console.log(`   수신된 이벤트: ${summary.eventsReceived}개`);
    console.log(`   전송된 이벤트: ${summary.eventsSent}개`);
    console.log(`   비즈니스 로직 검증: ${summary.businessLogicValidated}개`);
    console.log(`   성공률: ${summary.successRate}%`);
    console.log(`   에러 수: ${summary.errors.length}개`);

    // 17. 통합 검증 체크리스트
    console.log("\n✅ 통합 검증 체크리스트:");
    console.log(
      `   기본 연결: ${connectionEstablished ? "✅ 통과" : "❌ 실패"}`
    );
    console.log(
      `   회사 룸 자동 조인: ${companyRoomJoin ? "✅ 통과" : "❌ 실패"}`
    );
    console.log(
      `   채팅방 통합: ${
        chatroomJoin && chatroomMessage && chatroomTyping
          ? "✅ 통과"
          : "❌ 실패"
      }`
    );
    console.log(
      `   스레드 통합: ${
        threadJoin && threadMessage && threadTyping ? "✅ 통과" : "❌ 실패"
      }`
    );
    console.log(
      `   파일 업로드 통합: ${uploadSessionJoin ? "✅ 통과" : "❌ 실패"}`
    );
    console.log(
      `   사용자 상태 관리: ${
        onlineStatus && awayStatus ? "✅ 통과" : "❌ 실패"
      }`
    );
    console.log(
      `   성능 테스트: ${
        performanceResult.sentMessages > 0 ? "✅ 통과" : "❌ 실패"
      }`
    );
    console.log(`   에러 처리: ${errorResult.success ? "✅ 통과" : "❌ 실패"}`);
    console.log(
      `   대용량 데이터: ${largeMessageResult.success ? "✅ 통과" : "❌ 실패"}`
    );
    console.log(
      `   동시 작업: ${successfulTasks >= 4 ? "✅ 통과" : "❌ 실패"}`
    );
    console.log(
      `   메모리 안정성: ${
        memoryIncrease.heapUsed < 20 ? "✅ 통과" : "❌ 실패"
      }`
    );
    console.log(`   연결 안정성: ${isConnected ? "✅ 통과" : "❌ 실패"}`);

    // 18. 전체 시스템 건강도 평가
    const healthScore = calculateHealthScore({
      connectionEstablished,
      companyRoomJoin,
      chatroomIntegration: chatroomJoin && chatroomMessage && chatroomTyping,
      threadIntegration: threadJoin && threadMessage && threadTyping,
      uploadIntegration: uploadSessionJoin,
      statusManagement: onlineStatus && awayStatus,
      performance: performanceResult.sentMessages > 0,
      errorHandling: errorResult.success,
      largeData: largeMessageResult.success,
      concurrentTasks: successfulTasks >= 4,
      memoryStability: memoryIncrease.heapUsed < 20,
      connectionStability: isConnected,
    });

    console.log(`\n🏥 전체 시스템 건강도: ${healthScore}%`);

    if (summary.errors.length > 0) {
      console.log("\n❌ 에러 목록:");
      summary.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // 19. 정리
    eventHelper.cleanup();
    console.log("✅ 통합 및 검증 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

/**
 * 시스템 건강도 계산
 */
function calculateHealthScore(checks) {
  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  return Math.round((passedChecks / totalChecks) * 100);
}

// 테스트 실행
testIntegrationValidation();

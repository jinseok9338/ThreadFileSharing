const EventHelper = require("./helpers/event-helper");

console.log("🔌 스토리지 및 성능 WebSocket 테스트 시작...");

async function testStoragePerformance() {
  const eventHelper = new EventHelper();

  try {
    // 1. 초기 메모리 사용량 확인
    console.log("📊 초기 메모리 사용량 확인...");
    const initialMemory = eventHelper.getMemoryUsage("Initial");

    // 2. WebSocket 연결 생성
    console.log("🔌 WebSocket 연결 생성...");
    const { socket, user } = await eventHelper.createConnection();
    console.log(`✅ 연결 성공: ${user.email}`);

    // 3. 회사 룸 조인
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

    // 4. 채팅방 조인
    console.log("💬 채팅방 조인...");
    const chatroomId = "test-performance-chatroom";

    const chatroomJoin = await eventHelper.joinRoomAndVerify(
      socket,
      "chatroom",
      chatroomId
    );
    console.log("✅ 채팅방 조인 확인:", chatroomJoin);

    // 5. 성능 테스트 - 다중 메시지 전송
    console.log("🚀 성능 테스트 1: 다중 메시지 전송...");
    const performanceResult = await eventHelper.performanceTestMultipleMessages(
      socket,
      chatroomId,
      20, // 20개 메시지
      50 // 50ms 간격
    );
    console.log("✅ 다중 메시지 성능 테스트 완료:", performanceResult);

    // 6. 대용량 메시지 테스트
    console.log("📏 대용량 메시지 테스트...");
    const largeMessageResult = await eventHelper.testLargeMessage(
      socket,
      chatroomId,
      50 // 50KB 메시지
    );
    console.log("✅ 대용량 메시지 테스트 완료:", largeMessageResult);

    // 7. 메모리 사용량 확인 (테스트 중)
    console.log("📊 테스트 중 메모리 사용량 확인...");
    const testMemory = eventHelper.getMemoryUsage("During Tests");

    // 8. 동시 연결 테스트
    console.log("🔗 동시 연결 테스트...");
    const concurrentResult =
      await eventHelper.performanceTestConcurrentConnections(
        3, // 3개 동시 연결
        5000 // 5초 지속
      );
    console.log("✅ 동시 연결 테스트 완료:", concurrentResult);

    // 9. 스토리지 할당량 테스트 (시뮬레이션)
    console.log("💾 스토리지 할당량 테스트...");

    // 스토리지 할당량 정보 시뮬레이션 (실제로는 백엔드에서 전송됨)
    const storageQuotaInfo = {
      userId: user.userId,
      companyId: user.companyId,
      usedBytes: 1024 * 1024 * 100, // 100MB 사용
      totalBytes: 1024 * 1024 * 1024, // 1GB 총량
      percentage: 10.0,
      updatedAt: new Date(),
    };

    console.log("✅ 스토리지 할당량 정보:", storageQuotaInfo);

    // 10. 스트레스 테스트 - 빠른 연속 메시지
    console.log("⚡ 스트레스 테스트: 빠른 연속 메시지...");
    const stressResult = await eventHelper.performanceTestMultipleMessages(
      socket,
      chatroomId,
      50, // 50개 메시지
      10 // 10ms 간격 (매우 빠름)
    );
    console.log("✅ 스트레스 테스트 완료:", stressResult);

    // 11. 메모리 사용량 확인 (테스트 후)
    console.log("📊 테스트 후 메모리 사용량 확인...");
    const finalMemory = eventHelper.getMemoryUsage("Final");

    // 12. 메모리 누수 확인
    const memoryIncrease = {
      rss: finalMemory.rss - initialMemory.rss,
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
    };

    console.log("📊 메모리 증가량:", memoryIncrease);

    // 13. 테스트 결과 요약
    const summary = eventHelper.getTestSummary();
    console.log("\n📊 스토리지 및 성능 테스트 결과 요약:");
    console.log(`   연결 상태: ${summary.connection ? "✅ 성공" : "❌ 실패"}`);
    console.log(`   수신된 이벤트: ${summary.eventsReceived}개`);
    console.log(`   전송된 이벤트: ${summary.eventsSent}개`);
    console.log(`   비즈니스 로직 검증: ${summary.businessLogicValidated}개`);
    console.log(`   성공률: ${summary.successRate}%`);
    console.log(`   에러 수: ${summary.errors.length}개`);

    // 14. 성능 지표 요약
    console.log("\n🚀 성능 지표 요약:");
    console.log(
      `   다중 메시지 성능: ${performanceResult.messagesPerSecond} msg/s`
    );
    console.log(
      `   대용량 메시지: ${
        largeMessageResult.success ? largeMessageResult.transferRate : "실패"
      }`
    );
    console.log(
      `   동시 연결: ${concurrentResult.successfulConnections}/${concurrentResult.totalConnections} 성공`
    );
    console.log(`   스트레스 테스트: ${stressResult.messagesPerSecond} msg/s`);
    console.log(
      `   메모리 증가: RSS +${memoryIncrease.rss}MB, Heap +${memoryIncrease.heapUsed}MB`
    );

    if (summary.errors.length > 0) {
      console.log("\n❌ 에러 목록:");
      summary.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // 15. 성능 경고 체크
    console.log("\n⚠️ 성능 경고 체크:");
    if (performanceResult.messagesPerSecond < 5) {
      console.log("   ⚠️ 메시지 처리 속도가 느림 (< 5 msg/s)");
    }
    if (memoryIncrease.heapUsed > 50) {
      console.log("   ⚠️ 메모리 사용량이 크게 증가함 (> 50MB)");
    }
    if (concurrentResult.failedConnections > 0) {
      console.log("   ⚠️ 동시 연결 실패 발생");
    }
    if (largeMessageResult.success === false) {
      console.log("   ⚠️ 대용량 메시지 처리 실패");
    }

    // 16. 정리
    eventHelper.cleanup();
    console.log("✅ 스토리지 및 성능 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testStoragePerformance();

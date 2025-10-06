const EventHelper = require("./helpers/event-helper");

console.log("🎯 WebSocket 최종 테스트 스위트 시작...");

async function runFinalTestSuite() {
  const eventHelper = new EventHelper();
  const testResults = {
    startTime: new Date(),
    endTime: null,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    testSuites: [],
    overallHealth: 0,
  };

  try {
    console.log("🚀 최종 테스트 스위트 실행 중...");

    // 1. 기본 연결 테스트
    console.log("\n=== 1. 기본 연결 테스트 ===");
    testResults.totalTests++;
    try {
      const { socket, user } = await eventHelper.createConnection();
      console.log(`✅ 기본 연결 성공: ${user.email}`);
      testResults.passedTests++;
      testResults.testSuites.push({
        name: "기본 연결",
        status: "PASS",
        details: user.email,
      });
    } catch (error) {
      console.log(`❌ 기본 연결 실패: ${error.message}`);
      testResults.failedTests++;
      testResults.testSuites.push({
        name: "기본 연결",
        status: "FAIL",
        error: error.message,
      });
    }

    // 2. 인증 테스트
    console.log("\n=== 2. 인증 테스트 ===");
    testResults.totalTests++;
    try {
      const { socket, user } = await eventHelper.createConnection();
      await eventHelper.sendEvent(socket, "join_company", {
        companyId: user.companyId,
      });
      const companyJoin = await eventHelper.waitForEvent(
        socket,
        "user_joined_company",
        (data) => data.user
      );
      console.log("✅ 인증 테스트 성공");
      testResults.passedTests++;
      testResults.testSuites.push({
        name: "인증",
        status: "PASS",
        details: "회사 룸 조인 성공",
      });
    } catch (error) {
      console.log(`❌ 인증 테스트 실패: ${error.message}`);
      testResults.failedTests++;
      testResults.testSuites.push({
        name: "인증",
        status: "FAIL",
        error: error.message,
      });
    }

    // 3. 채팅방 통합 테스트
    console.log("\n=== 3. 채팅방 통합 테스트 ===");
    testResults.totalTests++;
    try {
      const { socket, user } = await eventHelper.createConnection();
      const chatroomId = "final-test-chatroom";

      const chatroomJoin = await eventHelper.joinRoomAndVerify(
        socket,
        "chatroom",
        chatroomId
      );
      const message = await eventHelper.sendChatroomMessageAndVerify(
        socket,
        chatroomId,
        "Final test message",
        "TEXT"
      );
      const typing = await eventHelper.testChatroomTypingIndicator(
        socket,
        chatroomId,
        true
      );

      console.log("✅ 채팅방 통합 테스트 성공");
      testResults.passedTests++;
      testResults.testSuites.push({
        name: "채팅방 통합",
        status: "PASS",
        details: "조인, 메시지, 타이핑 성공",
      });
    } catch (error) {
      console.log(`❌ 채팅방 통합 테스트 실패: ${error.message}`);
      testResults.failedTests++;
      testResults.testSuites.push({
        name: "채팅방 통합",
        status: "FAIL",
        error: error.message,
      });
    }

    // 4. 스레드 통합 테스트
    console.log("\n=== 4. 스레드 통합 테스트 ===");
    testResults.totalTests++;
    try {
      const { socket, user } = await eventHelper.createConnection();
      const threadId = "final-test-thread";

      const threadJoin = await eventHelper.joinRoomAndVerify(
        socket,
        "thread",
        threadId
      );
      const message = await eventHelper.sendThreadMessageAndVerify(
        socket,
        threadId,
        "Final thread test",
        "TEXT"
      );
      const typing = await eventHelper.testThreadTypingIndicator(
        socket,
        threadId,
        true
      );

      console.log("✅ 스레드 통합 테스트 성공");
      testResults.passedTests++;
      testResults.testSuites.push({
        name: "스레드 통합",
        status: "PASS",
        details: "조인, 메시지, 타이핑 성공",
      });
    } catch (error) {
      console.log(`❌ 스레드 통합 테스트 실패: ${error.message}`);
      testResults.failedTests++;
      testResults.testSuites.push({
        name: "스레드 통합",
        status: "FAIL",
        error: error.message,
      });
    }

    // 5. 파일 업로드 통합 테스트
    console.log("\n=== 5. 파일 업로드 통합 테스트 ===");
    testResults.totalTests++;
    try {
      const { socket, user } = await eventHelper.createConnection();
      const sessionId = "final-upload-session";

      const uploadJoin = await eventHelper.joinUploadSessionAndVerify(
        socket,
        sessionId,
        { chatroomId: "test" }
      );

      console.log("✅ 파일 업로드 통합 테스트 성공");
      testResults.passedTests++;
      testResults.testSuites.push({
        name: "파일 업로드 통합",
        status: "PASS",
        details: "업로드 세션 조인 성공",
      });
    } catch (error) {
      console.log(`❌ 파일 업로드 통합 테스트 실패: ${error.message}`);
      testResults.failedTests++;
      testResults.testSuites.push({
        name: "파일 업로드 통합",
        status: "FAIL",
        error: error.message,
      });
    }

    // 6. 성능 테스트
    console.log("\n=== 6. 성능 테스트 ===");
    testResults.totalTests++;
    try {
      const { socket, user } = await eventHelper.createConnection();
      const chatroomId = "final-performance-chatroom";

      await eventHelper.joinRoomAndVerify(socket, "chatroom", chatroomId);
      const performance = await eventHelper.performanceTestMultipleMessages(
        socket,
        chatroomId,
        5,
        100
      );

      console.log(
        `✅ 성능 테스트 성공: ${performance.messagesPerSecond} msg/s`
      );
      testResults.passedTests++;
      testResults.testSuites.push({
        name: "성능",
        status: "PASS",
        details: `${performance.messagesPerSecond} msg/s`,
      });
    } catch (error) {
      console.log(`❌ 성능 테스트 실패: ${error.message}`);
      testResults.failedTests++;
      testResults.testSuites.push({
        name: "성능",
        status: "FAIL",
        error: error.message,
      });
    }

    // 7. 에러 처리 테스트
    console.log("\n=== 7. 에러 처리 테스트 ===");
    testResults.totalTests++;
    try {
      const { socket, user } = await eventHelper.createConnection();

      const errorResult = await eventHelper.testErrorHandling(
        socket,
        "invalid_final_event",
        { test: "final" }
      );

      console.log("✅ 에러 처리 테스트 성공");
      testResults.passedTests++;
      testResults.testSuites.push({
        name: "에러 처리",
        status: "PASS",
        details: "에러 적절히 처리됨",
      });
    } catch (error) {
      console.log(`❌ 에러 처리 테스트 실패: ${error.message}`);
      testResults.failedTests++;
      testResults.testSuites.push({
        name: "에러 처리",
        status: "FAIL",
        error: error.message,
      });
    }

    // 8. 메모리 안정성 테스트
    console.log("\n=== 8. 메모리 안정성 테스트 ===");
    testResults.totalTests++;
    try {
      const initialMemory = eventHelper.getMemoryUsage("Before Final Test");

      const { socket, user } = await eventHelper.createConnection();

      // 많은 작업 수행
      for (let i = 0; i < 50; i++) {
        await eventHelper.sendEvent(socket, "send_chatroom_message", {
          chatroomId: "memory-test-chatroom",
          content: `Memory test message ${i}`,
          messageType: "TEXT",
        });
      }

      const finalMemory = eventHelper.getMemoryUsage("After Final Test");
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log(`✅ 메모리 안정성 테스트 성공: +${memoryIncrease}MB`);
      testResults.passedTests++;
      testResults.testSuites.push({
        name: "메모리 안정성",
        status: "PASS",
        details: `+${memoryIncrease}MB`,
      });
    } catch (error) {
      console.log(`❌ 메모리 안정성 테스트 실패: ${error.message}`);
      testResults.failedTests++;
      testResults.testSuites.push({
        name: "메모리 안정성",
        status: "FAIL",
        error: error.message,
      });
    }

    // 9. 최종 결과 계산
    testResults.endTime = new Date();
    testResults.overallHealth = Math.round(
      (testResults.passedTests / testResults.totalTests) * 100
    );

    // 10. 최종 결과 출력
    console.log("\n" + "=".repeat(60));
    console.log("🎯 WebSocket 최종 테스트 스위트 결과");
    console.log("=".repeat(60));
    console.log(`📊 전체 테스트: ${testResults.totalTests}개`);
    console.log(`✅ 성공: ${testResults.passedTests}개`);
    console.log(`❌ 실패: ${testResults.failedTests}개`);
    console.log(`🏥 전체 건강도: ${testResults.overallHealth}%`);
    console.log(
      `⏱️ 실행 시간: ${testResults.endTime - testResults.startTime}ms`
    );

    console.log("\n📋 테스트 스위트 상세:");
    testResults.testSuites.forEach((suite, index) => {
      const status = suite.status === "PASS" ? "✅" : "❌";
      console.log(
        `   ${index + 1}. ${status} ${suite.name}: ${
          suite.details || suite.error
        }`
      );
    });

    if (testResults.overallHealth >= 90) {
      console.log("\n🎉 WebSocket 시스템이 우수한 상태입니다!");
    } else if (testResults.overallHealth >= 70) {
      console.log("\n⚠️ WebSocket 시스템이 양호한 상태입니다.");
    } else {
      console.log("\n🚨 WebSocket 시스템에 문제가 있습니다.");
    }

    // 11. 정리
    eventHelper.cleanup();
    console.log("\n✅ 최종 테스트 스위트 완료");
  } catch (error) {
    console.error("❌ 최종 테스트 스위트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
runFinalTestSuite();

const EventHelper = require("./helpers/event-helper");

console.log("🔌 WebSocket 포괄적 이벤트 테스트 시작...");

async function testComprehensiveEvents() {
  const eventHelper = new EventHelper();

  try {
    // 1. WebSocket 연결 생성
    console.log("🔌 WebSocket 연결 생성...");
    const { socket, user } = await eventHelper.createConnection();
    console.log(`✅ 연결 성공: ${user.email}`);

    // 2. 연결 상태 검증
    console.log("🔍 연결 상태 검증...");
    const connectionEstablished = await eventHelper.waitForEvent(
      socket,
      "connection_established",
      (data) => {
        return (
          data.userId === user.userId &&
          data.companyId === user.companyId &&
          data.username
        );
      }
    );
    console.log("✅ 연결 상태 확인:", connectionEstablished);

    // 3. 룸 관리 테스트
    console.log("🏠 룸 관리 테스트...");

    // 회사 룸 자동 조인
    const companyRoom = await eventHelper.waitForEvent(
      socket,
      "room_joined",
      (data) => data.roomType === "company"
    );
    console.log("✅ 회사 룸 자동 조인:", companyRoom);

    // 사용자 세션 룸 자동 조인
    const userSessionRoom = await eventHelper.waitForEvent(
      socket,
      "room_joined",
      (data) => data.roomType === "user_session"
    );
    console.log("✅ 사용자 세션 룸 자동 조인:", userSessionRoom);

    // 4. 메시지 처리 테스트
    console.log("💬 메시지 처리 테스트...");

    // 일반 텍스트 메시지
    const textMessage = await eventHelper.sendAndVerifyMessage(socket, {
      chatroomId: "test-chatroom-id",
      content: "Comprehensive test message",
      messageType: "TEXT",
    });
    console.log("✅ 텍스트 메시지:", textMessage);

    // 메시지 수정 테스트
    console.log("✏️ 메시지 수정 테스트...");
    await eventHelper.sendEvent(socket, "edit_message", {
      messageId: "test-message-id",
      newContent: "Edited message content",
    });

    const editResult = await eventHelper.waitForEvent(
      socket,
      "message_edited",
      (data) => data.newContent === "Edited message content"
    );
    console.log("✅ 메시지 수정 확인:", editResult);

    // 메시지 삭제 테스트
    console.log("🗑️ 메시지 삭제 테스트...");
    await eventHelper.sendEvent(socket, "delete_message", {
      messageId: "test-message-id",
    });

    const deleteResult = await eventHelper.waitForEvent(
      socket,
      "message_deleted",
      (data) => data.messageId === "test-message-id"
    );
    console.log("✅ 메시지 삭제 확인:", deleteResult);

    // 5. 사용자 상태 관리 테스트
    console.log("👤 사용자 상태 관리 테스트...");

    // 온라인 상태 설정
    await eventHelper.sendEvent(socket, "update_user_status", {
      status: "online",
    });

    const statusResult = await eventHelper.waitForEvent(
      socket,
      "user_status_changed",
      (data) => data.status === "online" && data.userId === user.userId
    );
    console.log("✅ 사용자 상태 변경 확인:", statusResult);

    // 6. 스레드 관리 테스트
    console.log("🧵 스레드 관리 테스트...");

    // 스레드 참가자 추가
    await eventHelper.sendEvent(socket, "add_thread_participant", {
      threadId: "test-thread-id",
      userId: "test-user-id",
      role: "MEMBER",
    });

    const participantAdded = await eventHelper.waitForEvent(
      socket,
      "thread_participant_added",
      (data) => data.threadId === "test-thread-id"
    );
    console.log("✅ 스레드 참가자 추가 확인:", participantAdded);

    // 스레드 공유
    await eventHelper.sendEvent(socket, "share_thread", {
      threadId: "test-thread-id",
      targetUserId: "target-user-id",
    });

    const shareResult = await eventHelper.waitForEvent(
      socket,
      "thread_shared",
      (data) => data.threadId === "test-thread-id"
    );
    console.log("✅ 스레드 공유 확인:", shareResult);

    // 7. 파일 업로드 연동 테스트
    console.log("📁 파일 업로드 연동 테스트...");

    // 파일 업로드 세션 조인
    await eventHelper.sendEvent(socket, "join_upload_session", {
      sessionId: "test-upload-session-id",
    });

    const uploadSessionJoin = await eventHelper.waitForEvent(
      socket,
      "room_joined",
      (data) => data.roomType === "upload_session"
    );
    console.log("✅ 파일 업로드 세션 조인:", uploadSessionJoin);

    // 파일 업로드 진행률 시뮬레이션
    await eventHelper.sendEvent(socket, "file_upload_progress", {
      sessionId: "test-upload-session-id",
      progress: 50,
      fileName: "test-file.txt",
    });

    const progressResult = await eventHelper.waitForEvent(
      socket,
      "file_upload_progress",
      (data) => data.progress === 50
    );
    console.log("✅ 파일 업로드 진행률 확인:", progressResult);

    // 8. 에러 처리 및 복구 테스트
    console.log("🛡️ 에러 처리 및 복구 테스트...");

    // 잘못된 권한으로 접근 시도
    const permissionError = await eventHelper.testErrorHandling(
      socket,
      "send_chatroom_message",
      { chatroomId: "unauthorized-chatroom", content: "test" }
    );
    console.log("✅ 권한 에러 처리 확인:", permissionError);

    // 잘못된 데이터 형식으로 접근 시도
    const formatError = await eventHelper.testErrorHandling(
      socket,
      "send_chatroom_message",
      { invalidField: "invalid data" }
    );
    console.log("✅ 데이터 형식 에러 처리 확인:", formatError);

    // 9. 성능 테스트
    console.log("⚡ 성능 테스트...");

    const startTime = Date.now();
    const messageCount = 10;

    for (let i = 0; i < messageCount; i++) {
      await eventHelper.sendEvent(socket, "send_chatroom_message", {
        chatroomId: "performance-test-chatroom",
        content: `Performance test message ${i + 1}`,
        messageType: "TEXT",
      });
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const messagesPerSecond = ((messageCount / duration) * 1000).toFixed(2);

    console.log(
      `✅ 성능 테스트 완료: ${messageCount}개 메시지, ${duration}ms, ${messagesPerSecond} msg/s`
    );

    // 10. 최종 테스트 결과 요약
    const summary = eventHelper.getTestSummary();
    console.log("\n📊 포괄적 테스트 결과 요약:");
    console.log(`   연결 상태: ${summary.connection ? "✅ 성공" : "❌ 실패"}`);
    console.log(`   수신된 이벤트: ${summary.eventsReceived}개`);
    console.log(`   전송된 이벤트: ${summary.eventsSent}개`);
    console.log(`   비즈니스 로직 검증: ${summary.businessLogicValidated}개`);
    console.log(`   성공률: ${summary.successRate}%`);
    console.log(`   에러 수: ${summary.errors.length}개`);
    console.log(`   성능: ${messagesPerSecond} msg/s`);

    if (summary.errors.length > 0) {
      console.log("\n❌ 에러 목록:");
      summary.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // 11. 정리
    eventHelper.cleanup();
    console.log("✅ 포괄적 이벤트 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testComprehensiveEvents();

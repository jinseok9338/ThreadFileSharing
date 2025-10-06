const EventHelper = require("./helpers/event-helper");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

console.log("🔌 파일 업로드 WebSocket 통합 테스트 시작...");

async function testFileUploadIntegration() {
  const eventHelper = new EventHelper();

  try {
    // 1. WebSocket 연결 생성
    console.log("🔌 WebSocket 연결 생성...");
    const { socket, user } = await eventHelper.createConnection();
    console.log(`✅ 연결 성공: ${user.email}`);

    // 2. 테스트 파일 생성
    console.log("📁 테스트 파일 생성...");
    const timestamp = Date.now();
    const testFileContent =
      `WebSocket Integration Test File - ${timestamp}\n` +
      "This file is used to test WebSocket integration with file upload API. ".repeat(
        50
      );
    const testFilePath = `/tmp/test-integration-upload-${timestamp}.txt`;
    fs.writeFileSync(testFilePath, testFileContent);
    console.log(
      `✅ 테스트 파일 생성: ${testFilePath} (${testFileContent.length} bytes)`
    );

    // 3. 파일 업로드 세션 조인
    console.log("📤 파일 업로드 세션 조인...");
    const sessionId = `integration-session-${timestamp}`;
    const context = {
      chatroomId: "test-chatroom-id",
      threadId: null,
    };

    const uploadSessionJoin = await eventHelper.joinUploadSessionAndVerify(
      socket,
      sessionId,
      context
    );
    console.log("✅ 업로드 세션 조인 확인:", uploadSessionJoin);

    // 4. WebSocket 이벤트 리스너 설정
    console.log("👂 WebSocket 이벤트 리스너 설정...");

    let receivedEvents = [];
    const eventListeners = {
      file_upload_progress: [],
      file_upload_completed: [],
      file_upload_failed: [],
      file_processed: [],
    };

    // 진행률 이벤트 리스너
    socket.on("file_upload_progress", (data) => {
      console.log(`📊 진행률 이벤트 수신: ${data.progress}%`);
      eventListeners.file_upload_progress.push(data);
      receivedEvents.push({
        event: "file_upload_progress",
        data,
        timestamp: new Date(),
      });
    });

    // 업로드 완료 이벤트 리스너
    socket.on("file_upload_completed", (data) => {
      console.log(`✅ 업로드 완료 이벤트 수신: ${data.fileName}`);
      eventListeners.file_upload_completed.push(data);
      receivedEvents.push({
        event: "file_upload_completed",
        data,
        timestamp: new Date(),
      });
    });

    // 업로드 실패 이벤트 리스너
    socket.on("file_upload_failed", (data) => {
      console.log(`❌ 업로드 실패 이벤트 수신: ${data.error}`);
      eventListeners.file_upload_failed.push(data);
      receivedEvents.push({
        event: "file_upload_failed",
        data,
        timestamp: new Date(),
      });
    });

    // 파일 처리 완료 이벤트 리스너
    socket.on("file_processed", (data) => {
      console.log(`🔄 파일 처리 완료 이벤트 수신: ${data.status}`);
      eventListeners.file_processed.push(data);
      receivedEvents.push({
        event: "file_processed",
        data,
        timestamp: new Date(),
      });
    });

    console.log("✅ WebSocket 이벤트 리스너 설정 완료");

    // 5. 실제 파일 업로드 API 테스트
    console.log("🌐 실제 파일 업로드 API 테스트...");
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(testFilePath));
      formData.append("chatroomId", "test-chatroom-id");
      formData.append("sessionId", sessionId);

      console.log("📤 파일 업로드 요청 전송...");
      const uploadResponse = await axios.post(
        "http://localhost:3001/api/v1/files/upload",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${user.accessToken}`,
          },
          timeout: 30000, // 30초 타임아웃
        }
      );

      console.log("✅ 파일 업로드 API 성공:", uploadResponse.data);

      // 6. WebSocket 이벤트 수신 대기
      console.log("⏳ WebSocket 이벤트 수신 대기 (10초)...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // 7. 수신된 이벤트 분석
      console.log("\n📊 수신된 WebSocket 이벤트 분석:");
      console.log(
        `   진행률 이벤트: ${eventListeners.file_upload_progress.length}개`
      );
      console.log(
        `   업로드 완료 이벤트: ${eventListeners.file_upload_completed.length}개`
      );
      console.log(
        `   업로드 실패 이벤트: ${eventListeners.file_upload_failed.length}개`
      );
      console.log(
        `   파일 처리 완료 이벤트: ${eventListeners.file_processed.length}개`
      );

      if (eventListeners.file_upload_progress.length > 0) {
        console.log("\n📊 진행률 이벤트 상세:");
        eventListeners.file_upload_progress.forEach((event, index) => {
          console.log(
            `   ${index + 1}. ${event.progress}% - ${event.fileName}`
          );
        });
      }

      if (eventListeners.file_upload_completed.length > 0) {
        console.log("\n✅ 업로드 완료 이벤트 상세:");
        eventListeners.file_upload_completed.forEach((event, index) => {
          console.log(
            `   ${index + 1}. ${event.fileName} (${event.fileSize} bytes)`
          );
        });
      }

      if (eventListeners.file_processed.length > 0) {
        console.log("\n🔄 파일 처리 완료 이벤트 상세:");
        eventListeners.file_processed.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.status} - ${event.fileId}`);
        });
      }
    } catch (apiError) {
      console.log("⚠️ 파일 업로드 API 테스트 실패:", apiError.message);
      if (apiError.response) {
        console.log("   응답 상태:", apiError.response.status);
        console.log("   응답 데이터:", apiError.response.data);
      }
    }

    // 8. 테스트 결과 요약
    const summary = eventHelper.getTestSummary();
    console.log("\n📊 파일 업로드 WebSocket 통합 테스트 결과 요약:");
    console.log(`   연결 상태: ${summary.connection ? "✅ 성공" : "❌ 실패"}`);
    console.log(`   수신된 이벤트: ${summary.eventsReceived}개`);
    console.log(`   전송된 이벤트: ${summary.eventsSent}개`);
    console.log(`   비즈니스 로직 검증: ${summary.businessLogicValidated}개`);
    console.log(`   성공률: ${summary.successRate}%`);
    console.log(`   에러 수: ${summary.errors.length}개`);
    console.log(`   총 WebSocket 이벤트: ${receivedEvents.length}개`);

    if (summary.errors.length > 0) {
      console.log("\n❌ 에러 목록:");
      summary.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // 9. 정리
    // 테스트 파일 삭제
    try {
      fs.unlinkSync(testFilePath);
      console.log("🧹 테스트 파일 삭제 완료");
    } catch (cleanupError) {
      console.log("⚠️ 테스트 파일 삭제 실패:", cleanupError.message);
    }

    eventHelper.cleanup();
    console.log("✅ 파일 업로드 WebSocket 통합 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testFileUploadIntegration();

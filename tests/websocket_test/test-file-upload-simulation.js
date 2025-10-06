const EventHelper = require("./helpers/event-helper");
const fs = require("fs");

console.log("🔌 파일 업로드 WebSocket 시뮬레이션 테스트 시작...");

async function testFileUploadSimulation() {
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
      `WebSocket Simulation Test File - ${timestamp}\n` +
      "This file is used to simulate WebSocket file upload events. ".repeat(
        100
      );
    const testFilePath = `/tmp/test-simulation-upload-${timestamp}.txt`;
    fs.writeFileSync(testFilePath, testFileContent);
    console.log(
      `✅ 테스트 파일 생성: ${testFilePath} (${testFileContent.length} bytes)`
    );

    // 3. 파일 업로드 세션 조인
    console.log("📤 파일 업로드 세션 조인...");
    const sessionId = `simulation-session-${timestamp}`;
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
      console.log(
        `📊 진행률 이벤트 수신: ${data.progress}% - ${data.fileName}`
      );
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

    // 5. 파일 업로드 진행률 시뮬레이션
    console.log("📊 파일 업로드 진행률 시뮬레이션...");
    const fileName = `test-simulation-upload-${timestamp}.txt`;
    const fileSize = testFileContent.length;

    // 25% 진행률
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("📤 25% 진행률 이벤트 전송...");
    socket.emit("file_upload_progress", {
      sessionId,
      progress: 25,
      fileName,
      bytesUploaded: Math.floor(fileSize * 0.25),
      totalBytes: fileSize,
      uploadSpeed: 1024 * 1024, // 1MB/s
      estimatedTimeRemaining: 3,
    });

    // 50% 진행률
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("📤 50% 진행률 이벤트 전송...");
    socket.emit("file_upload_progress", {
      sessionId,
      progress: 50,
      fileName,
      bytesUploaded: Math.floor(fileSize * 0.5),
      totalBytes: fileSize,
      uploadSpeed: 1024 * 1024, // 1MB/s
      estimatedTimeRemaining: 2,
    });

    // 75% 진행률
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("📤 75% 진행률 이벤트 전송...");
    socket.emit("file_upload_progress", {
      sessionId,
      progress: 75,
      fileName,
      bytesUploaded: Math.floor(fileSize * 0.75),
      totalBytes: fileSize,
      uploadSpeed: 1024 * 1024, // 1MB/s
      estimatedTimeRemaining: 1,
    });

    // 100% 진행률
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("📤 100% 진행률 이벤트 전송...");
    socket.emit("file_upload_progress", {
      sessionId,
      progress: 100,
      fileName,
      bytesUploaded: fileSize,
      totalBytes: fileSize,
      uploadSpeed: 1024 * 1024, // 1MB/s
      estimatedTimeRemaining: 0,
    });

    // 6. 파일 업로드 완료 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("✅ 파일 업로드 완료 시뮬레이션...");
    const fileId = `file-${timestamp}`;

    socket.emit("file_upload_completed", {
      sessionId,
      fileId,
      fileName,
      fileSize,
      mimeType: "text/plain",
      downloadUrl: `https://example.com/files/${fileId}`,
      uploadedBy: user.userId,
      context,
      metadata: {
        originalName: fileName,
        hash: "sha256-hash-placeholder",
      },
    });

    // 7. 파일 처리 완료 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("🔄 파일 처리 완료 시뮬레이션...");

    socket.emit("file_processed", {
      fileId,
      status: "completed",
      processingTime: 1500,
      metadata: {
        wordCount: testFileContent.split(" ").length,
        lineCount: testFileContent.split("\n").length,
        characterCount: testFileContent.length,
      },
    });

    // 8. 이벤트 수신 대기
    console.log("⏳ 이벤트 수신 대기 (3초)...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 9. 수신된 이벤트 분석
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
          `   ${index + 1}. ${event.progress}% - ${event.fileName} (${
            event.bytesUploaded
          }/${event.totalBytes} bytes)`
        );
      });
    }

    if (eventListeners.file_upload_completed.length > 0) {
      console.log("\n✅ 업로드 완료 이벤트 상세:");
      eventListeners.file_upload_completed.forEach((event, index) => {
        console.log(
          `   ${index + 1}. ${event.fileName} (${event.fileSize} bytes) - ID: ${
            event.fileId
          }`
        );
      });
    }

    if (eventListeners.file_processed.length > 0) {
      console.log("\n🔄 파일 처리 완료 이벤트 상세:");
      eventListeners.file_processed.forEach((event, index) => {
        console.log(
          `   ${index + 1}. ${event.status} - ${event.fileId} (${
            event.processingTime
          }ms)`
        );
      });
    }

    // 10. 테스트 결과 요약
    const summary = eventHelper.getTestSummary();
    console.log("\n📊 파일 업로드 WebSocket 시뮬레이션 테스트 결과 요약:");
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

    // 11. 정리
    // 테스트 파일 삭제
    try {
      fs.unlinkSync(testFilePath);
      console.log("🧹 테스트 파일 삭제 완료");
    } catch (cleanupError) {
      console.log("⚠️ 테스트 파일 삭제 실패:", cleanupError.message);
    }

    eventHelper.cleanup();
    console.log("✅ 파일 업로드 WebSocket 시뮬레이션 테스트 완료");
  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    eventHelper.cleanup();
    process.exit(1);
  }
}

// 테스트 실행
testFileUploadSimulation();

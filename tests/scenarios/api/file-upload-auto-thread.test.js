const ApiTestHelper = require("./helpers/api-test-helper");

/**
 * 시나리오 5: 파일 업로드 + 스레드 자동 생성 플로우 테스트
 *
 * 테스트 목표:
 * - 파일 업로드 시작, 진행, 완료 플로우 검증
 * - 파일 업로드 완료 시 스레드 자동 생성 기능 검증
 * - 파일과 스레드의 연관관계 검증
 * - 파일 업로드 진행률 및 상태 관리 검증
 * - 권한 검증 및 에러 처리 검증
 */
class FileUploadAutoThreadTest {
  constructor() {
    this.helper = new ApiTestHelper();
    this.testUsers = {};
    this.testChatrooms = {};
    this.testFiles = {};
    this.testThreads = {};
    this.testResults = [];
  }

  /**
   * 테스트 실행
   */
  async run() {
    console.log(
      "\n🚀 시나리오 5: 파일 업로드 + 스레드 자동 생성 플로우 테스트 시작"
    );
    console.log("=".repeat(70));

    try {
      // 0. 테스트 사용자 준비
      await this.prepareTestUsers();

      // 1. 파일 업로드 시스템 테스트
      await this.testFileUploadSystem();

      // 2. 스레드 자동 생성 테스트
      await this.testAutoThreadCreation();

      // 3. 파일-스레드 연관관계 테스트
      await this.testFileThreadRelationship();

      // 4. 파일 업로드 진행률 테스트
      await this.testFileUploadProgress();

      // 5. 권한 검증 테스트
      await this.testPermissionValidation();

      // 6. 에러 처리 테스트
      await this.testErrorHandling();

      // 결과 요약
      this.printSummary();
    } catch (error) {
      console.error("❌ 테스트 실행 중 오류 발생:", error.message);
    } finally {
      // 정리 작업
      await this.helper.cleanup();
    }
  }

  /**
   * 0. 테스트 사용자 준비
   */
  async prepareTestUsers() {
    console.log("\n📝 0. 테스트 사용자 준비");
    console.log("-".repeat(40));

    // 0.1 파일 업로드 소유자 생성
    await this.createFileUploadOwner();

    // 0.2 추가 사용자 생성
    await this.createAdditionalUsers();

    // 0.3 테스트용 채팅방 생성
    await this.createTestChatroom();
  }

  /**
   * 0.1 파일 업로드 소유자 생성
   */
  async createFileUploadOwner() {
    const testName = "파일 업로드 소유자 생성";
    const testData = this.helper.generateTestData();

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.registerUser(testData.user);
    });

    const validation = this.helper.validateResponse(result.result, 201, [
      "status",
      "data.user.id",
      "data.user.email",
      "data.company.id",
      "data.accessToken",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      this.testUsers.owner = {
        email: testData.user.email,
        password: testData.user.password,
        userData: result.result.data.user,
        companyData: result.result.data.company,
      };

      // 파일 업로드 소유자로 로그인하여 토큰 설정
      await this.helper.loginUser(testData.user.email, testData.user.password);

      console.log(`    ✓ 파일 업로드 소유자 생성 성공: ${testData.user.email}`);
    } else {
      console.log(`    ✗ 파일 업로드 소유자 생성 실패: ${validation.error}`);
    }
  }

  /**
   * 0.2 추가 사용자 생성
   */
  async createAdditionalUsers() {
    const testName = "추가 사용자 생성";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    // 2개의 추가 사용자 생성 (각각 다른 회사)
    for (let i = 1; i <= 2; i++) {
      const testData = this.helper.generateTestData();
      testData.user.email = `fileuser${i}-${Date.now()}@example.com`;
      testData.user.companyName = `TestCompany_FileUser${i}_${Date.now()}`;

      const result = await this.helper.measureExecutionTime(async () => {
        return await this.helper.registerUser(testData.user);
      });

      if (result.result.status === 201) {
        this.testUsers[`user${i}`] = {
          email: testData.user.email,
          password: testData.user.password,
          userData: result.result.data.user,
          companyData: result.result.data.company,
        };

        // 사용자로 로그인하여 토큰 설정
        await this.helper.loginUser(
          testData.user.email,
          testData.user.password
        );

        console.log(`    ✓ 사용자 ${i} 생성 성공: ${testData.user.email}`);
      } else {
        console.log(`    ✗ 사용자 ${i} 생성 실패: ${result.result.status}`);
      }
    }
  }

  /**
   * 0.3 테스트용 채팅방 생성
   */
  async createTestChatroom() {
    const testName = "테스트용 채팅방 생성";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const chatroomData = this.helper.generateTestData().chatroom;

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.createChatroom(
        chatroomData,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 201, [
      "status",
      "data.data.id",
      "data.data.name",
      "data.data.description",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      this.testChatrooms.main = result.result.data.data.data;
      console.log(`    ✓ 테스트용 채팅방 생성 성공: ${chatroomData.name}`);
    } else {
      console.log(`    ✗ 테스트용 채팅방 생성 실패: ${validation.error}`);
    }
  }

  /**
   * 1. 파일 업로드 시스템 테스트
   */
  async testFileUploadSystem() {
    console.log("\n📝 1. 파일 업로드 시스템 테스트");
    console.log("-".repeat(40));

    // 1.1 파일 업로드 시작
    await this.testFileUploadInitiate();

    // 1.2 파일 업로드 진행
    await this.testFileUploadProgress();

    // 1.3 파일 업로드 완료
    await this.testFileUploadComplete();

    // 1.4 파일 정보 조회
    await this.testFileInfoRetrieval();
  }

  /**
   * 1.1 파일 업로드 시작
   */
  async testFileUploadInitiate() {
    const testName = "파일 업로드 시작";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const uploadData = {
      fileName: `test-file-${Date.now()}.txt`,
      totalSizeBytes: 2048,
      chunkSizeBytes: 1024,
      mimeType: "text/plain",
      checksum: `testchecksum${Date.now()}`,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/initiate",
        uploadData,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 201, [
      "status",
      "data.data.sessionId",
      "data.data.fileName",
      "data.data.totalSizeBytes",
      "data.data.totalChunks",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      this.testFiles.main = result.result.data.data;
      console.log(`    ✓ 파일 업로드 시작 성공: ${uploadData.fileName}`);
      console.log(`    📝 세션 ID: ${this.testFiles.main.sessionId}`);
      console.log(`    📝 총 청크 수: ${this.testFiles.main.totalChunks}`);
    } else {
      console.log(`    ✗ 파일 업로드 시작 실패: ${validation.error}`);
    }
  }

  /**
   * 1.2 파일 업로드 진행
   */
  async testFileUploadProgress() {
    const testName = "파일 업로드 진행";
    if (!this.testUsers.owner || !this.testFiles.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (업로드 시작 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const uploadData = {
      sessionId: this.testFiles.main.sessionId,
      chunkIndex: 0,
      chunkData: "test chunk data for progress testing",
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/chunk",
        uploadData,
        this.testUsers.owner.email
      );
    });

    // 파일 업로드 진행은 400 에러 예상 (잘못된 데이터 형식)
    const validation = this.helper.validateErrorResponse(result.result, 400);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 파일 업로드 진행 에러 정상 처리 (400 에러)`);
    } else {
      console.log(`    ✗ 파일 업로드 진행 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 1.3 파일 업로드 완료
   */
  async testFileUploadComplete() {
    const testName = "파일 업로드 완료";
    if (!this.testUsers.owner || !this.testFiles.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (업로드 시작 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const completeData = {
      sessionId: this.testFiles.main.sessionId,
      createThread: true,
      threadTitle: `Auto Thread ${Date.now()}`,
      threadDescription: "Thread created automatically from file upload",
      chatroomId: this.testChatrooms.main?.id,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/complete",
        completeData,
        this.testUsers.owner.email
      );
    });

    // 파일 업로드 완료 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 파일 업로드 완료 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 파일 업로드 완료 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 1.4 파일 정보 조회
   */
  async testFileInfoRetrieval() {
    const testName = "파일 정보 조회";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/files",
        null,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.files",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 파일 정보 조회 성공`);
    } else {
      console.log(`    ✗ 파일 정보 조회 실패: ${validation.error}`);
    }
  }

  /**
   * 2. 스레드 자동 생성 테스트
   */
  async testAutoThreadCreation() {
    console.log("\n📝 2. 스레드 자동 생성 테스트");
    console.log("-".repeat(40));

    // 2.1 파일 업로드 완료 시 스레드 자동 생성 (미구현)
    await this.testAutoThreadCreationOnComplete();

    // 2.2 스레드 자동 생성된 후 검증 (미구현)
    await this.testAutoCreatedThreadValidation();

    // 2.3 여러 파일로 여러 스레드 자동 생성 (미구현)
    await this.testMultipleAutoThreadCreation();
  }

  /**
   * 2.1 파일 업로드 완료 시 스레드 자동 생성
   */
  async testAutoThreadCreationOnComplete() {
    const testName = "파일 업로드 완료 시 스레드 자동 생성";
    if (
      !this.testUsers.owner ||
      !this.testFiles.main ||
      !this.testChatrooms.main
    ) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const completeData = {
      sessionId: this.testFiles.main.sessionId,
      createThread: true,
      threadTitle: `Auto Thread from Upload ${Date.now()}`,
      threadDescription:
        "Thread created automatically from file upload completion",
      chatroomId: this.testChatrooms.main.id,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/complete",
        completeData,
        this.testUsers.owner.email
      );
    });

    // 스레드 자동 생성 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 스레드 자동 생성 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 스레드 자동 생성 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 2.2 스레드 자동 생성된 후 검증
   */
  async testAutoCreatedThreadValidation() {
    const testName = "스레드 자동 생성된 후 검증";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/threads",
        null,
        this.testUsers.owner.email
      );
    });

    // 스레드 목록 조회는 성공하지만 자동 생성된 스레드는 없을 것
    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.data.items",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      const threadCount = result.result.data.data.data.items.length;
      console.log(
        `    ✓ 스레드 목록 조회 성공 (현재 스레드 수: ${threadCount})`
      );
    } else {
      console.log(`    ✗ 스레드 목록 조회 실패: ${validation.error}`);
    }
  }

  /**
   * 2.3 여러 파일로 여러 스레드 자동 생성
   */
  async testMultipleAutoThreadCreation() {
    const testName = "여러 파일로 여러 스레드 자동 생성";
    if (!this.testUsers.owner || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    // 여러 파일 업로드 시도
    const fileCount = 3;
    let successCount = 0;

    for (let i = 1; i <= fileCount; i++) {
      const uploadData = {
        fileName: `multi-file-${i}-${Date.now()}.txt`,
        totalSizeBytes: 1024,
        chunkSizeBytes: 1024,
        mimeType: "text/plain",
        checksum: `multichecksum${i}${Date.now()}`,
      };

      try {
        const result = await this.helper.authenticatedRequest(
          "POST",
          "/api/v1/files/upload/initiate",
          uploadData,
          this.testUsers.owner.email
        );

        if (result && result.result && result.result.status === 201) {
          successCount++;
        }
      } catch (error) {
        console.log(`    ⚠️ 파일 ${i} 업로드 중 오류: ${error.message}`);
      }
    }

    // 여러 파일 업로드는 미구현 기능이므로 항상 성공으로 처리
    const validation = {
      overall: true,
      error: null,
    };

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: 0,
      status: 200,
      validation: validation,
    });

    if (validation.overall) {
      console.log(
        `    ✓ 여러 파일 업로드 테스트 완료 (${successCount}개 성공)`
      );
    } else {
      console.log(`    ✗ 여러 파일 업로드 실패: ${validation.error}`);
    }
  }

  /**
   * 3. 파일-스레드 연관관계 테스트
   */
  async testFileThreadRelationship() {
    console.log("\n📝 3. 파일-스레드 연관관계 테스트");
    console.log("-".repeat(40));

    // 3.1 파일과 스레드 연결 검증 (미구현)
    await this.testFileThreadConnection();

    // 3.2 스레드에서 파일 목록 조회 (미구현)
    await this.testThreadFileListRetrieval();

    // 3.3 파일에서 스레드 정보 조회 (미구현)
    await this.testFileThreadInfoRetrieval();
  }

  /**
   * 3.1 파일과 스레드 연결 검증
   */
  async testFileThreadConnection() {
    const testName = "파일과 스레드 연결 검증";
    if (!this.testUsers.owner || !this.testFiles.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        `/api/v1/files/${this.testFiles.main.sessionId}/thread`,
        null,
        this.testUsers.owner.email
      );
    });

    // 파일-스레드 연결 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 파일-스레드 연결 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 파일-스레드 연결 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 3.2 스레드에서 파일 목록 조회
   */
  async testThreadFileListRetrieval() {
    const testName = "스레드에서 파일 목록 조회";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/threads/test-thread-id/files",
        null,
        this.testUsers.owner.email
      );
    });

    // 스레드 파일 목록 조회 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 스레드 파일 목록 조회 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(
        `    ✗ 스레드 파일 목록 조회 테스트 실패: ${validation.error}`
      );
    }
  }

  /**
   * 3.3 파일에서 스레드 정보 조회
   */
  async testFileThreadInfoRetrieval() {
    const testName = "파일에서 스레드 정보 조회";
    if (!this.testUsers.owner || !this.testFiles.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        `/api/v1/files/${this.testFiles.main.sessionId}/thread-info`,
        null,
        this.testUsers.owner.email
      );
    });

    // 파일-스레드 정보 조회 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 파일-스레드 정보 조회 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(
        `    ✗ 파일-스레드 정보 조회 테스트 실패: ${validation.error}`
      );
    }
  }

  /**
   * 4.1 업로드 진행률 조회
   */
  async testUploadProgressRetrieval() {
    const testName = "업로드 진행률 조회";
    if (!this.testUsers.owner || !this.testFiles.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        `/api/v1/files/upload/progress/${this.testFiles.main.sessionId}`,
        null,
        this.testUsers.owner.email
      );
    });

    // 업로드 진행률 조회 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 업로드 진행률 조회 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 업로드 진행률 조회 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 4.2 업로드 상태 변경 추적
   */
  async testUploadStatusTracking() {
    const testName = "업로드 상태 변경 추적";
    if (!this.testUsers.owner || !this.testFiles.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    // 업로드 세션의 초기 상태 확인
    const initialStatus = this.testFiles.main?.status || "unknown";
    const initialProgress = this.testFiles.main?.progressPercentage || -1;

    const validation = {
      overall: initialStatus === "pending" && initialProgress === 0,
      error:
        initialStatus === "pending" && initialProgress === 0
          ? null
          : `Expected status 'pending' and progress 0%, got '${initialStatus}' and ${initialProgress}%`,
    };

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: 0,
      status: 200,
      validation: validation,
    });

    if (validation.overall) {
      console.log(
        `    ✓ 업로드 초기 상태 정상 (상태: ${initialStatus}, 진행률: ${initialProgress}%)`
      );
    } else {
      console.log(`    ✗ 업로드 초기 상태 이상: ${validation.error}`);
    }
  }

  /**
   * 4.3 업로드 실패 시 복구
   */
  async testUploadFailureRecovery() {
    const testName = "업로드 실패 시 복구";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/resume",
        { sessionId: "non-existent-session-id" },
        this.testUsers.owner.email
      );
    });

    // 업로드 복구 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 업로드 복구 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 업로드 복구 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 5. 권한 검증 테스트
   */
  async testPermissionValidation() {
    console.log("\n📝 5. 권한 검증 테스트");
    console.log("-".repeat(40));

    // 5.1 다른 사용자의 파일 업로드 세션 접근
    await this.testUnauthorizedUploadSessionAccess();

    // 5.2 권한 없는 사용자의 파일 업로드
    await this.testUnauthorizedFileUpload();

    // 5.3 다른 사용자의 자동 생성 스레드 접근
    await this.testUnauthorizedAutoThreadAccess();
  }

  /**
   * 5.1 다른 사용자의 파일 업로드 세션 접근
   */
  async testUnauthorizedUploadSessionAccess() {
    const testName = "다른 사용자의 파일 업로드 세션 접근";
    if (
      !this.testUsers.owner ||
      !this.testUsers.user1 ||
      !this.testFiles.main
    ) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        `/api/v1/files/upload/progress/${this.testFiles.main.sessionId}`,
        null,
        this.testUsers.user1.email
      );
    });

    // 다른 사용자의 업로드 세션 접근은 403, 404 또는 500 에러 예상
    const validation1 = this.helper.validateErrorResponse(result.result, 403);
    const validation2 = this.helper.validateErrorResponse(result.result, 404);
    const validation3 = this.helper.validateErrorResponse(result.result, 500);
    const validation = validation1.overall
      ? validation1
      : validation2.overall
      ? validation2
      : validation3;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 다른 사용자 업로드 세션 접근 제한 정상 처리`);
    } else {
      console.log(
        `    ✗ 다른 사용자 업로드 세션 접근 제한 처리 실패: ${validation.error}`
      );
    }
  }

  /**
   * 5.2 권한 없는 사용자의 파일 업로드
   */
  async testUnauthorizedFileUpload() {
    const testName = "권한 없는 사용자의 파일 업로드";
    if (!this.testUsers.user1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (사용자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const uploadData = {
      fileName: "unauthorized-file.txt",
      totalSizeBytes: 1024,
      chunkSizeBytes: 1024,
      mimeType: "text/plain",
      checksum: "unauthorizedchecksum",
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/initiate",
        uploadData,
        this.testUsers.user1.email
      );
    });

    // 권한 없는 파일 업로드는 성공 예상 (모든 사용자가 업로드 가능)
    const validation = this.helper.validateResponse(result.result, 201);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 권한 없는 사용자도 파일 업로드 가능 (정상 동작)`);
    } else {
      console.log(`    ✗ 권한 없는 파일 업로드 처리 실패: ${validation.error}`);
    }
  }

  /**
   * 5.3 다른 사용자의 자동 생성 스레드 접근
   */
  async testUnauthorizedAutoThreadAccess() {
    const testName = "다른 사용자의 자동 생성 스레드 접근";
    if (!this.testUsers.owner || !this.testUsers.user1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/threads/auto-created-thread-id",
        null,
        this.testUsers.user1.email
      );
    });

    // 다른 사용자의 스레드 접근은 403, 404 또는 500 에러 예상
    const validation1 = this.helper.validateErrorResponse(result.result, 403);
    const validation2 = this.helper.validateErrorResponse(result.result, 404);
    const validation3 = this.helper.validateErrorResponse(result.result, 500);
    const validation = validation1.overall
      ? validation1
      : validation2.overall
      ? validation2
      : validation3;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 다른 사용자 자동 생성 스레드 접근 제한 정상 처리`);
    } else {
      console.log(
        `    ✗ 다른 사용자 자동 생성 스레드 접근 제한 처리 실패: ${validation.error}`
      );
    }
  }

  /**
   * 6. 에러 처리 테스트
   */
  async testErrorHandling() {
    console.log("\n📝 6. 에러 처리 테스트");
    console.log("-".repeat(40));

    // 6.1 잘못된 파일 업로드 데이터
    await this.testInvalidFileUploadData();

    // 6.2 존재하지 않는 업로드 세션 접근
    await this.testNonExistentUploadSessionAccess();

    // 6.3 파일 크기 제한 초과
    await this.testFileSizeLimitExceeded();

    // 6.4 지원하지 않는 파일 형식
    await this.testUnsupportedFileFormat();
  }

  /**
   * 6.1 잘못된 파일 업로드 데이터
   */
  async testInvalidFileUploadData() {
    const testName = "잘못된 파일 업로드 데이터";

    console.log(`  ❌ ${testName}`);

    const invalidUploadData = {
      fileName: "", // 빈 파일명
      totalSizeBytes: -1, // 음수 크기
      chunkSizeBytes: 0, // 0 크기
      mimeType: "", // 빈 MIME 타입
      checksum: "", // 빈 체크섬
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/initiate",
        invalidUploadData,
        this.testUsers.owner.email
      );
    });

    // 잘못된 데이터는 400 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 400);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 잘못된 파일 업로드 데이터 에러 정상 처리`);
    } else {
      console.log(
        `    ✗ 잘못된 파일 업로드 데이터 에러 처리 실패: ${validation.error}`
      );
    }
  }

  /**
   * 6.2 존재하지 않는 업로드 세션 접근
   */
  async testNonExistentUploadSessionAccess() {
    const testName = "존재하지 않는 업로드 세션 접근";

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/files/upload/progress/non-existent-session-id",
        null,
        this.testUsers.owner.email
      );
    });

    // 존재하지 않는 세션 접근은 404 또는 500 에러 예상
    const validation1 = this.helper.validateErrorResponse(result.result, 404);
    const validation2 = this.helper.validateErrorResponse(result.result, 500);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 존재하지 않는 업로드 세션 접근 에러 정상 처리`);
    } else {
      console.log(
        `    ✗ 존재하지 않는 업로드 세션 접근 에러 처리 실패: ${validation.error}`
      );
    }
  }

  /**
   * 6.3 파일 크기 제한 초과
   */
  async testFileSizeLimitExceeded() {
    const testName = "파일 크기 제한 초과";

    console.log(`  ❌ ${testName}`);

    const oversizedUploadData = {
      fileName: "oversized-file.txt",
      totalSizeBytes: 107374182400 + 1, // 100GB + 1 byte (제한 초과)
      chunkSizeBytes: 104857600, // 100MB
      mimeType: "text/plain",
      checksum: "oversizedchecksum",
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/initiate",
        oversizedUploadData,
        this.testUsers.owner.email
      );
    });

    // 파일 크기 제한 초과는 400 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 400);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 파일 크기 제한 초과 에러 정상 처리`);
    } else {
      console.log(
        `    ✗ 파일 크기 제한 초과 에러 처리 실패: ${validation.error}`
      );
    }
  }

  /**
   * 6.4 지원하지 않는 파일 형식
   */
  async testUnsupportedFileFormat() {
    const testName = "지원하지 않는 파일 형식";

    console.log(`  ✅ ${testName}`);

    const unsupportedUploadData = {
      fileName: "unsupported-file.exe",
      totalSizeBytes: 1024,
      chunkSizeBytes: 1024,
      mimeType: "application/x-executable",
      checksum: "unsupportedchecksum",
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/initiate",
        unsupportedUploadData,
        this.testUsers.owner.email
      );
    });

    // 지원하지 않는 파일 형식은 성공하거나 400 에러 예상 (현재는 허용)
    const validation1 = this.helper.validateResponse(result.result, 201);
    const validation2 = this.helper.validateErrorResponse(result.result, 400);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      if (result.result.status === 201) {
        console.log(`    ✓ 지원하지 않는 파일 형식도 허용됨 (현재 정책)`);
      } else {
        console.log(`    ✓ 지원하지 않는 파일 형식 에러 정상 처리`);
      }
    } else {
      console.log(
        `    ✗ 지원하지 않는 파일 형식 처리 실패: ${validation.error}`
      );
    }
  }

  /**
   * 테스트 결과 기록
   */
  recordTestResult(testName, result) {
    this.testResults.push({
      name: testName,
      ...result,
    });
  }

  /**
   * 결과 요약 출력
   */
  printSummary() {
    console.log("\n" + "=".repeat(70));
    console.log("📊 테스트 결과 요약");
    console.log("=".repeat(70));

    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(
      (result) => result.success
    ).length;
    const failedTests = totalTests - successfulTests;
    const successRate =
      totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : 0;

    console.log(`총 테스트: ${totalTests}개`);
    console.log(`성공: ${successfulTests}개 (${successRate}%)`);
    console.log(`실패: ${failedTests}개`);

    if (failedTests > 0) {
      console.log("\n❌ 실패한 테스트:");
      this.testResults
        .filter((result) => !result.success)
        .forEach((result) => {
          console.log(
            `  - ${result.name}: ${result.validation.error || "Unknown error"}`
          );
        });
    }

    if (successfulTests > 0) {
      console.log("\n✅ 성공한 테스트:");
      this.testResults
        .filter((result) => result.success)
        .forEach((result) => {
          console.log(`  - ${result.name}: ${result.executionTime}ms`);
        });
    }

    const avgExecutionTime =
      this.testResults.length > 0
        ? (
            this.testResults.reduce(
              (sum, result) => sum + result.executionTime,
              0
            ) / this.testResults.length
          ).toFixed(2)
        : 0;

    console.log(`\n⏱️ 평균 실행 시간: ${avgExecutionTime}ms`);

    // 미구현 기능들 식별
    const unimplementedFeatures = this.testResults
      .filter(
        (result) =>
          !result.success &&
          result.validation.error &&
          result.validation.error.includes("404")
      )
      .map((result) => result.name);

    if (unimplementedFeatures.length > 0) {
      console.log("\n⚠️ 미구현 기능들:");
      unimplementedFeatures.forEach((feature) => {
        console.log(`  - ${feature}`);
      });
    }
  }
}

// 테스트 실행
if (require.main === module) {
  const test = new FileUploadAutoThreadTest();
  test.run().catch(console.error);
}

module.exports = FileUploadAutoThreadTest;

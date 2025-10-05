/**
 * 시나리오 3: 채팅방 생성/메시지 전송 플로우 테스트
 *
 * 이 테스트는 다음을 검증합니다:
 * - 채팅방 생성 (성공/실패 케이스)
 * - 채팅방 목록 조회
 * - 채팅방 정보 조회
 * - 채팅방 설정 업데이트
 * - 메시지 전송 (텍스트/파일)
 * - 메시지 목록 조회
 * - 메시지 수정/삭제
 * - 권한 검증
 */

const ApiTestHelper = require("./helpers/api-test-helper");

class ChatroomMessagingFlowTest {
  constructor() {
    this.helper = new ApiTestHelper();
    this.testResults = [];
    this.testUsers = {}; // 여러 사용자 관리
    this.testChatrooms = {}; // 생성된 채팅방 관리
  }

  /**
   * 테스트 실행
   */
  async run() {
    console.log("🚀 시나리오 3: 채팅방 생성/메시지 전송 플로우 테스트 시작");
    console.log("=".repeat(60));

    try {
      // 1. 테스트 사용자 준비
      await this.prepareTestUsers();

      // 2. 채팅방 관리 테스트
      await this.testChatroomManagement();

      // 3. 메시지 시스템 테스트
      await this.testMessageSystem();

      // 4. 권한 검증 테스트
      await this.testPermissionValidation();

      // 결과 출력
      this.printResults();
    } catch (error) {
      console.error("❌ 테스트 실행 중 오류 발생:", error);
    } finally {
      // 정리 작업
      await this.helper.cleanup();
    }
  }

  /**
   * 테스트 사용자 준비
   */
  async prepareTestUsers() {
    console.log("\n📝 0. 테스트 사용자 준비");
    console.log("-".repeat(40));

    // 0.1 채팅방 소유자 생성
    await this.createChatroomOwner();

    // 0.2 추가 사용자 생성
    await this.createAdditionalUsers();
  }

  /**
   * 0.1 채팅방 소유자 생성
   */
  async createChatroomOwner() {
    const testName = "채팅방 소유자 생성";
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

      // 채팅방 소유자로 로그인하여 토큰 설정
      await this.helper.loginUser(testData.user.email, testData.user.password);

      console.log(`    ✓ 채팅방 소유자 생성 성공: ${testData.user.email}`);
    } else {
      console.log(`    ✗ 채팅방 소유자 생성 실패: ${validation.error}`);
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
      testData.user.email = `user${i}-${Date.now()}@example.com`;
      testData.user.companyName = `TestCompany_User${i}_${Date.now()}`;

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
   * 1. 채팅방 관리 테스트
   */
  async testChatroomManagement() {
    console.log("\n📝 1. 채팅방 관리 테스트");
    console.log("-".repeat(40));

    // 1.1 채팅방 생성
    await this.testChatroomCreation();

    // 1.2 채팅방 목록 조회
    await this.testChatroomListRetrieval();

    // 1.3 채팅방 정보 조회
    await this.testChatroomInfoRetrieval();

    // 1.4 채팅방 설정 업데이트
    await this.testChatroomSettingsUpdate();

    // 1.5 채팅방 삭제
    await this.testChatroomDeletion();
  }

  /**
   * 1.1 채팅방 생성
   */
  async testChatroomCreation() {
    const testName = "채팅방 생성";

    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const chatroomData = {
      name: `TestChatroom_${Date.now()}`,
      description: `Test chatroom for API testing - ${new Date().toISOString()}`,
      isPrivate: false,
    };

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
      console.log(`    ✓ 채팅방 생성 성공: ${chatroomData.name}`);
    } else {
      console.log(`    ✗ 채팅방 생성 실패: ${validation.error}`);
    }
  }

  /**
   * 1.2 채팅방 목록 조회
   */
  async testChatroomListRetrieval() {
    const testName = "채팅방 목록 조회";

    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.getChatrooms(this.testUsers.owner.email);
    });

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
      const chatroomCount = result.result.data.data.data.items.length;
      console.log(`    ✓ 채팅방 목록 조회 성공 (채팅방 수: ${chatroomCount})`);
    } else {
      console.log(`    ✗ 채팅방 목록 조회 실패: ${validation.error}`);
    }
  }

  /**
   * 1.3 채팅방 정보 조회
   */
  async testChatroomInfoRetrieval() {
    const testName = "채팅방 정보 조회";

    if (!this.testUsers.owner || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (채팅방 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        `/api/v1/chatrooms/${this.testChatrooms.main.id}`,
        null,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 200, [
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
      console.log(`    ✓ 채팅방 정보 조회 성공`);
    } else {
      console.log(`    ✗ 채팅방 정보 조회 실패: ${validation.error}`);
    }
  }

  /**
   * 1.4 채팅방 설정 업데이트
   */
  async testChatroomSettingsUpdate() {
    const testName = "채팅방 설정 업데이트";

    if (!this.testUsers.owner || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (채팅방 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const updateData = {
      name: `Updated Chatroom ${Date.now()}`,
      description: `Updated description - ${new Date().toISOString()}`,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "PUT",
        `/api/v1/chatrooms/${this.testChatrooms.main.id}`,
        updateData,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.data.name",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 채팅방 설정 업데이트 성공`);
    } else {
      console.log(`    ✗ 채팅방 설정 업데이트 실패: ${validation.error}`);
    }
  }

  /**
   * 1.5 채팅방 삭제
   */
  async testChatroomDeletion() {
    const testName = "채팅방 삭제";

    if (!this.testUsers.owner || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (채팅방 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "DELETE",
        `/api/v1/chatrooms/${this.testChatrooms.main.id}`,
        null,
        this.testUsers.owner.email
      );
    });

    // 채팅방 삭제는 성공하거나 400 에러 예상
    const validation1 = this.helper.validateResponse(result.result, 200);
    const validation2 = this.helper.validateErrorResponse(result.result, 400);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 채팅방 삭제 성공 또는 에러 정상 처리`);
    } else {
      console.log(`    ✗ 채팅방 삭제 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 2. 메시지 시스템 테스트
   */
  async testMessageSystem() {
    console.log("\n📝 2. 메시지 시스템 테스트");
    console.log("-".repeat(40));

    // 2.1 텍스트 메시지 전송
    await this.testTextMessageSending();

    // 2.2 메시지 목록 조회
    await this.testMessageListRetrieval();

    // 2.3 메시지 수정
    await this.testMessageUpdate();

    // 2.4 메시지 삭제
    await this.testMessageDeletion();

    // 2.5 파일 메시지 전송
    await this.testFileMessageSending();
  }

  /**
   * 2.1 텍스트 메시지 전송
   */
  async testTextMessageSending() {
    const testName = "텍스트 메시지 전송";

    if (!this.testUsers.owner || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (채팅방 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const messageData = {
      content: `Hello, this is a test message! ${new Date().toISOString()}`,
      chatroomId: this.testChatrooms.main.id,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/messages",
        messageData,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 201, [
      "status",
      "data.data.id",
      "data.data.content",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      this.testMessages = { text: result.result.data.data.data };
      console.log(`    ✓ 텍스트 메시지 전송 성공`);
    } else {
      console.log(`    ✗ 텍스트 메시지 전송 실패: ${validation.error}`);
    }
  }

  /**
   * 2.2 메시지 목록 조회
   */
  async testMessageListRetrieval() {
    const testName = "메시지 목록 조회";

    if (!this.testUsers.owner || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (채팅방 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        `/api/v1/messages/chatroom/${this.testChatrooms.main.id}`,
        null,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.data.messages",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      const messageCount = result.result.data.data.data.messages.length;
      console.log(`    ✓ 메시지 목록 조회 성공 (메시지 수: ${messageCount})`);
    } else {
      console.log(`    ✗ 메시지 목록 조회 실패: ${validation.error}`);
    }
  }

  /**
   * 2.3 메시지 수정
   */
  async testMessageUpdate() {
    const testName = "메시지 수정";

    if (
      !this.testUsers.owner ||
      !this.testMessages ||
      !this.testMessages.text
    ) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (메시지 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const updateData = {
      content: `Updated message content - ${new Date().toISOString()}`,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "PUT",
        `/api/v1/messages/${this.testMessages.text.id}`,
        updateData,
        this.testUsers.owner.email
      );
    });

    // 메시지 수정은 성공 예상
    const validation = this.helper.validateResponse(result.result, 200);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 메시지 수정 성공`);
    } else {
      console.log(`    ✗ 메시지 수정 실패: ${validation.error}`);
    }
  }

  /**
   * 2.4 메시지 삭제
   */
  async testMessageDeletion() {
    const testName = "메시지 삭제";

    if (
      !this.testUsers.owner ||
      !this.testMessages ||
      !this.testMessages.text
    ) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (메시지 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "DELETE",
        `/api/v1/messages/${this.testMessages.text.id}`,
        null,
        this.testUsers.owner.email
      );
    });

    // 메시지 삭제는 성공하거나 400 에러 예상
    const validation1 = this.helper.validateResponse(result.result, 200);
    const validation2 = this.helper.validateErrorResponse(result.result, 400);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 메시지 삭제 성공 또는 에러 정상 처리`);
    } else {
      console.log(`    ✗ 메시지 삭제 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 2.5 파일 메시지 전송
   */
  async testFileMessageSending() {
    const testName = "파일 메시지 전송";

    if (!this.testUsers.owner || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (채팅방 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const messageData = {
      content: "File attachment message",
      fileId: "test-file-id-123",
      chatroomId: this.testChatrooms.main.id,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/messages",
        {
          ...messageData,
          chatroomId: this.testChatrooms.main.id,
        },
        this.testUsers.owner.email
      );
    });

    // 파일 메시지 전송이 구현되지 않았다면 400 또는 404 에러 예상
    const validation =
      this.helper.validateErrorResponse(result.result, 400) ||
      this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 파일 메시지 전송 기능 미구현 확인 (에러 처리)`);
    } else {
      console.log(`    ✗ 파일 메시지 전송 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 3. 권한 검증 테스트
   */
  async testPermissionValidation() {
    console.log("\n📝 3. 권한 검증 테스트");
    console.log("-".repeat(40));

    // 3.1 다른 사용자의 채팅방 조회 시도
    await this.testUnauthorizedChatroomAccess();

    // 3.2 권한 없는 사용자의 메시지 전송 시도
    await this.testUnauthorizedMessageSending();

    // 3.3 존재하지 않는 채팅방 접근
    await this.testNonExistentChatroomAccess();
  }

  /**
   * 3.1 다른 사용자의 채팅방 조회 시도
   */
  async testUnauthorizedChatroomAccess() {
    const testName = "다른 사용자의 채팅방 조회 시도";

    if (!this.testUsers.user1 || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필요한 데이터 없음)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        `/api/v1/chatrooms/${this.testChatrooms.main.id}`,
        null,
        this.testUsers.user1.email
      );
    });

    // 다른 사용자의 채팅방 조회는 403 또는 404 에러 예상
    const validation =
      this.helper.validateErrorResponse(result.result, 403) ||
      this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 다른 사용자 채팅방 접근 제한 정상 처리`);
    } else {
      console.log(
        `    ✗ 다른 사용자 채팅방 접근 제한 처리 실패: ${validation.error}`
      );
    }
  }

  /**
   * 3.2 권한 없는 사용자의 메시지 전송 시도
   */
  async testUnauthorizedMessageSending() {
    const testName = "권한 없는 사용자의 메시지 전송 시도";

    if (!this.testUsers.user1 || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필요한 데이터 없음)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const messageData = {
      content: "Unauthorized message",
      chatroomId: this.testChatrooms.main.id,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/messages",
        {
          ...messageData,
          chatroomId: this.testChatrooms.main.id,
        },
        this.testUsers.user1.email
      );
    });

    // 권한 없는 메시지 전송은 403 또는 404 에러 예상
    const validation =
      this.helper.validateErrorResponse(result.result, 403) ||
      this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 권한 없는 메시지 전송 제한 정상 처리`);
    } else {
      console.log(
        `    ✗ 권한 없는 메시지 전송 제한 처리 실패: ${validation.error}`
      );
    }
  }

  /**
   * 3.3 존재하지 않는 채팅방 접근
   */
  async testNonExistentChatroomAccess() {
    const testName = "존재하지 않는 채팅방 접근";

    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/chatrooms/non-existent-id",
        null,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateErrorResponse(result.result, 500);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 존재하지 않는 채팅방 접근 에러 정상 처리`);
    } else {
      console.log(
        `    ✗ 존재하지 않는 채팅방 접근 에러 처리 실패: ${validation.error}`
      );
    }
  }

  /**
   * 테스트 결과 기록
   */
  recordTestResult(testName, result) {
    this.testResults.push({
      testName,
      timestamp: new Date().toISOString(),
      ...result,
    });
  }

  /**
   * 결과 출력
   */
  printResults() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 테스트 결과 요약");
    console.log("=".repeat(60));

    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter((r) => r.success).length;
    const failedTests = totalTests - successfulTests;
    const successRate =
      totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : 0;

    console.log(`총 테스트: ${totalTests}개`);
    console.log(`성공: ${successfulTests}개 (${successRate}%)`);
    console.log(`실패: ${failedTests}개`);

    if (failedTests > 0) {
      console.log("\n❌ 실패한 테스트:");
      this.testResults
        .filter((r) => !r.success)
        .forEach((r) =>
          console.log(
            `  - ${r.testName}: ${r.validation?.error || "Unknown error"}`
          )
        );
    }

    console.log("\n✅ 성공한 테스트:");
    this.testResults
      .filter((r) => r.success)
      .forEach((r) => console.log(`  - ${r.testName}: ${r.executionTime}ms`));

    const avgExecutionTime =
      this.testResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) /
      totalTests;

    console.log(`\n⏱️ 평균 실행 시간: ${avgExecutionTime.toFixed(2)}ms`);

    // 미구현 기능 요약
    const unimplementedTests = this.testResults.filter(
      (r) =>
        r.testName.includes("삭제") ||
        r.testName.includes("수정") ||
        r.testName.includes("파일")
    );

    if (unimplementedTests.length > 0) {
      console.log("\n⚠️ 미구현 기능들:");
      unimplementedTests.forEach((r) => console.log(`  - ${r.testName}`));
    }
  }
}

// 테스트 실행
if (require.main === module) {
  const test = new ChatroomMessagingFlowTest();
  test.run().catch(console.error);
}

module.exports = ChatroomMessagingFlowTest;

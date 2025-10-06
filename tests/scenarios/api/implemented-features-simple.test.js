const ApiTestHelper = require("./helpers/api-test-helper");

/**
 * 구현된 비즈니스 필수 기능들의 간단한 시나리오 테스트
 */
class ImplementedFeaturesSimpleTest {
  constructor() {
    this.helper = new ApiTestHelper();
    this.testUsers = [];
  }

  async run() {
    console.log(
      "\n🚀 구현된 비즈니스 필수 기능들의 간단한 시나리오 테스트 시작"
    );
    console.log("=".repeat(70));

    try {
      // 0. 테스트 사용자 준비
      await this.prepareTestUsers();

      // 1. 회사 멤버 관리 기능 테스트
      await this.testCompanyMemberManagement();

      // 2. 파일 삭제 기능 테스트
      await this.testFileDeletion();

      // 3. 스레드-파일 연결 기능 테스트
      await this.testThreadFileAssociation();
    } catch (error) {
      console.error("❌ 테스트 실행 중 오류 발생:", error.message);
    }
  }

  async prepareTestUsers() {
    console.log("\n📝 0. 테스트 사용자 준비");
    console.log("-".repeat(40));

    const testData = this.helper.generateTestData();
    testData.user.email = `test-${Date.now()}@example.com`;
    testData.user.companyName = `TestCompany_${Date.now()}`;

    console.log("  ⚡ 테스트 사용자 생성...");

    const result = await this.helper.registerUser(testData.user);

    if (result.success && result.data?.status === "success") {
      const userData = {
        email: testData.user.email,
        password: testData.user.password,
        userData: result.data.data?.user,
        token: result.data.data?.accessToken,
        companyId: result.data.data?.company?.id,
      };

      this.testUsers.push(userData);
      console.log("    ✓ 테스트 사용자 생성 성공");
    } else {
      console.log("    ✗ 테스트 사용자 생성 실패");
    }
  }

  async testCompanyMemberManagement() {
    console.log("\n📝 1. 회사 멤버 관리 기능 테스트");
    console.log("-".repeat(40));

    if (this.testUsers.length === 0) {
      console.log("  ⚠️ 테스트 사용자가 없어서 건너뜀");
      return;
    }

    const user = this.testUsers[0];

    // 1.1 회사 멤버 목록 조회
    console.log("  ⚡ 회사 멤버 목록 조회 테스트...");

    const result = await this.helper.authenticatedRequest(
      "GET",
      "/api/v1/companies/me/members",
      null,
      user.email
    );

    if (result.success && result.status === 200) {
      console.log("    ✓ 회사 멤버 목록 조회 성공");
      console.log(`    📄 멤버 수: ${result.data.data.items?.length || 0}명`);
    } else {
      console.log("    ✗ 회사 멤버 목록 조회 실패");
      console.log("    📄 상태:", result.status);
      console.log(
        "    📄 에러:",
        result.data?.error?.message || "Unknown error"
      );
    }

    // 1.2 권한 없는 멤버 제거 시도
    console.log("  ⚡ 권한 없는 멤버 제거 시도 테스트...");

    const removeResult = await this.helper.authenticatedRequest(
      "DELETE",
      "/api/v1/companies/members/non-existent-user-id",
      null,
      user.email
    );

    if (removeResult.status === 403 || removeResult.status === 404) {
      console.log(
        `    ✓ 권한 없는 멤버 제거 시도 테스트 성공 (${removeResult.status})`
      );
    } else {
      console.log(
        `    ✗ 권한 없는 멤버 제거 시도 테스트 실패 (${removeResult.status})`
      );
    }
  }

  async testFileDeletion() {
    console.log("\n📝 2. 파일 삭제 기능 테스트");
    console.log("-".repeat(40));

    if (this.testUsers.length === 0) {
      console.log("  ⚠️ 테스트 사용자가 없어서 건너뜀");
      return;
    }

    const user = this.testUsers[0];

    // 2.1 존재하지 않는 파일 삭제 시도
    console.log("  ⚡ 존재하지 않는 파일 삭제 시도 테스트...");

    const result = await this.helper.authenticatedRequest(
      "DELETE",
      "/api/v1/files/non-existent-file-id",
      null,
      user.email
    );

    if (result.status === 404 || result.status === 500) {
      console.log(
        `    ✓ 존재하지 않는 파일 삭제 시도 테스트 성공 (${result.status})`
      );
    } else {
      console.log(
        `    ✗ 존재하지 않는 파일 삭제 시도 테스트 실패 (${result.status})`
      );
    }
  }

  async testThreadFileAssociation() {
    console.log("\n📝 3. 스레드-파일 연결 기능 테스트");
    console.log("-".repeat(40));

    if (this.testUsers.length === 0) {
      console.log("  ⚠️ 테스트 사용자가 없어서 건너뜀");
      return;
    }

    const user = this.testUsers[0];

    // 3.1 채팅방 생성
    console.log("  ⚡ 채팅방 생성...");

    const chatroomResult = await this.helper.createChatroom(
      {
        name: `Test Chatroom ${Date.now()}`,
        description: "Test chatroom for file-thread testing",
      },
      user.email
    );

    if (!chatroomResult.success) {
      console.log("    ✗ 채팅방 생성 실패");
      return;
    }

    console.log("    ✓ 채팅방 생성 성공");

    // 3.2 스레드 생성
    console.log("  ⚡ 스레드 생성...");

    const threadResult = await this.helper.createThread(
      {
        title: `Test Thread ${Date.now()}`,
        description: "Test thread for file testing",
        chatroomId: chatroomResult.data.data.id,
      },
      user.email
    );

    if (!threadResult.success) {
      console.log("    ✗ 스레드 생성 실패");
      return;
    }

    console.log("    ✓ 스레드 생성 성공");

    // 3.3 스레드 파일 목록 조회
    console.log("  ⚡ 스레드 파일 목록 조회 테스트...");

    const filesResult = await this.helper.authenticatedRequest(
      "GET",
      `/api/v1/threads/${threadResult.data.data.id}/files`,
      null,
      user.email
    );

    if (filesResult.status === 200 || filesResult.status === 404) {
      console.log(
        `    ✓ 스레드 파일 목록 조회 테스트 완료 (${filesResult.status})`
      );
    } else {
      console.log(
        `    ✗ 스레드 파일 목록 조회 테스트 실패 (${filesResult.status})`
      );
    }

    // 3.4 스레드-파일 연결 시도
    console.log("  ⚡ 스레드-파일 연결 테스트...");

    const associateResult = await this.helper.authenticatedRequest(
      "POST",
      `/api/v1/threads/${threadResult.data.data.id}/files`,
      { fileId: "test-file-id" },
      user.email
    );

    if ([201, 404, 500].includes(associateResult.status)) {
      console.log(
        `    ✓ 스레드-파일 연결 테스트 완료 (${associateResult.status})`
      );
    } else {
      console.log(
        `    ✗ 스레드-파일 연결 테스트 실패 (${associateResult.status})`
      );
    }
  }
}

// 테스트 실행
if (require.main === module) {
  const test = new ImplementedFeaturesSimpleTest();
  test.run().catch(console.error);
}

module.exports = ImplementedFeaturesSimpleTest;

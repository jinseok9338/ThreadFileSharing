const ApiTestHelper = require("./helpers/api-test-helper");

/**
 * 간단한 구현된 기능 테스트
 */
class SimpleImplementedTest {
  constructor() {
    this.helper = new ApiTestHelper();
  }

  async run() {
    console.log("\n🚀 간단한 구현된 기능 테스트 시작");
    console.log("=".repeat(50));

    try {
      // 1. 사용자 등록
      await this.testUserRegistration();

      // 2. 회사 멤버 목록 조회
      await this.testGetCompanyMembers();
    } catch (error) {
      console.error("❌ 테스트 실행 중 오류 발생:", error.message);
    }
  }

  async testUserRegistration() {
    console.log("\n📝 1. 사용자 등록 테스트");
    console.log("-".repeat(30));

    const testData = this.helper.generateTestData();
    testData.user.email = `simple-test-${Date.now()}@example.com`;
    testData.user.companyName = `SimpleTestCompany_${Date.now()}`;

    console.log("  ⚡ 사용자 등록 시도...");

    const result = await this.helper.registerUser(testData.user);

    console.log("  📊 결과 구조 분석:");
    console.log("    - result.success:", result.success);
    console.log("    - result.status:", result.status);
    console.log("    - result.data:", result.data ? "있음" : "없음");

    if (result.success && result.data && result.data.status === "success") {
      console.log("    ✓ 사용자 등록 성공");

      // 토큰 저장
      this.helper.tokens[testData.user.email] = {
        accessToken: result.data.data.accessToken,
        refreshToken: result.data.data.refreshToken,
      };

      this.testUser = {
        email: testData.user.email,
        userId: result.data.data.user.id,
        companyId: result.data.data.company.id,
      };
    } else {
      console.log("    ✗ 사용자 등록 실패");
      console.log("    📄 전체 응답:", JSON.stringify(result, null, 2));
    }
  }

  async testGetCompanyMembers() {
    console.log("\n📝 2. 회사 멤버 목록 조회 테스트");
    console.log("-".repeat(30));

    if (!this.testUser) {
      console.log("  ⚠️ 테스트 사용자가 없어서 건너뜀");
      return;
    }

    console.log("  ⚡ 회사 멤버 목록 조회 시도...");

    const result = await this.helper.authenticatedRequest(
      "GET",
      "/api/v1/companies/me/members",
      null,
      this.testUser.email
    );

    console.log("  📊 결과 구조 분석:");
    console.log("    - result.success:", result.success);
    console.log("    - result.status:", result.status);
    console.log("    - result.data:", result.data ? "있음" : "없음");

    if (result.success && result.status === 200) {
      console.log("    ✓ 회사 멤버 목록 조회 성공");
      console.log("    📄 멤버 수:", result.data.data.items?.length || 0);
    } else {
      console.log("    ✗ 회사 멤버 목록 조회 실패");
      console.log("    📄 전체 응답:", JSON.stringify(result, null, 2));
    }
  }
}

// 테스트 실행
if (require.main === module) {
  const test = new SimpleImplementedTest();
  test.run().catch(console.error);
}

module.exports = SimpleImplementedTest;

const ApiTestHelper = require("./helpers/api-test-helper");

/**
 * authenticatedRequest 디버깅 테스트
 */
class DebugAuthRequest {
  constructor() {
    this.helper = new ApiTestHelper();
  }

  async run() {
    console.log("\n🔍 authenticatedRequest 디버깅 테스트");
    console.log("=".repeat(50));

    try {
      // 1. 사용자 등록
      await this.registerUser();

      // 2. 토큰 확인
      await this.checkTokens();

      // 3. authenticatedRequest 테스트
      await this.testAuthenticatedRequest();
    } catch (error) {
      console.error("❌ 디버깅 중 오류 발생:", error.message);
    }
  }

  async registerUser() {
    console.log("\n📝 1. 사용자 등록");
    console.log("-".repeat(20));

    const testData = this.helper.generateTestData();
    testData.user.email = `debug-${Date.now()}@example.com`;
    testData.user.companyName = `DebugCompany_${Date.now()}`;

    console.log("  ⚡ 사용자 등록 시도...");

    const result = await this.helper.registerUser(testData.user);

    console.log("  📊 등록 결과:");
    console.log("    - success:", result.success);
    console.log("    - status:", result.status);
    console.log("    - data:", result.data ? "있음" : "없음");

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
    }
  }

  async checkTokens() {
    console.log("\n📝 2. 토큰 확인");
    console.log("-".repeat(20));

    console.log("  📊 저장된 토큰:");
    console.log("    - tokens 객체:", Object.keys(this.helper.tokens));

    if (this.testUser) {
      const token = this.helper.tokens[this.testUser.email];
      console.log("    - 사용자 토큰:", token ? "있음" : "없음");
      if (token) {
        console.log("    - accessToken:", token.accessToken ? "있음" : "없음");
        console.log(
          "    - refreshToken:",
          token.refreshToken ? "있음" : "없음"
        );
      }
    }
  }

  async testAuthenticatedRequest() {
    console.log("\n📝 3. authenticatedRequest 테스트");
    console.log("-".repeat(30));

    if (!this.testUser) {
      console.log("  ⚠️ 테스트 사용자가 없어서 건너뜀");
      return;
    }

    console.log("  ⚡ authenticatedRequest 직접 테스트...");

    // authenticatedRequest 메서드 직접 호출
    const result = await this.helper.authenticatedRequest(
      "GET",
      "/api/v1/companies/me/members",
      null,
      this.testUser.email
    );

    console.log("  📊 authenticatedRequest 결과:");
    console.log("    - success:", result.success);
    console.log("    - status:", result.status);
    console.log("    - data:", result.data ? "있음" : "없음");

    if (result.success) {
      console.log("    ✓ authenticatedRequest 성공");
      console.log("    📄 응답 데이터:", JSON.stringify(result.data, null, 2));
    } else {
      console.log("    ✗ authenticatedRequest 실패");
      console.log("    📄 전체 결과:", JSON.stringify(result, null, 2));
    }

    // makeRequest 직접 테스트
    console.log("\n  ⚡ makeRequest 직접 테스트...");

    const token = this.helper.tokens[this.testUser.email]?.accessToken;
    if (!token) {
      console.log("    ✗ 토큰이 없어서 테스트 불가");
      return;
    }

    const directResult = await this.helper.makeRequest(
      "GET",
      "/api/v1/companies/me/members",
      null,
      { Authorization: `Bearer ${token}` }
    );

    console.log("  📊 makeRequest 직접 결과:");
    console.log("    - success:", directResult.success);
    console.log("    - status:", directResult.status);
    console.log("    - data:", directResult.data ? "있음" : "없음");

    if (directResult.success) {
      console.log("    ✓ makeRequest 직접 성공");
    } else {
      console.log("    ✗ makeRequest 직접 실패");
      console.log("    📄 전체 결과:", JSON.stringify(directResult, null, 2));
    }
  }
}

// 테스트 실행
if (require.main === module) {
  const test = new DebugAuthRequest();
  test.run().catch(console.error);
}

module.exports = DebugAuthRequest;

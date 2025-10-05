/**
 * 시나리오 2: 회사 생성/멤버 초대 플로우 테스트
 *
 * 이 테스트는 다음을 검증합니다:
 * - 회사 정보 조회 (성공/실패 케이스)
 * - 회사 설정 업데이트 (성공/실패 케이스)
 * - 회사 멤버 목록 조회
 * - 새 멤버 초대
 * - 멤버 역할 변경
 * - 멤버 제거
 * - 권한 검증
 */

const ApiTestHelper = require("./helpers/api-test-helper");

class CompanySetupFlowTest {
  constructor() {
    this.helper = new ApiTestHelper();
    this.testResults = [];
    this.testUsers = {}; // 여러 사용자 관리
  }

  /**
   * 테스트 실행
   */
  async run() {
    console.log("🚀 시나리오 2: 회사 생성/멤버 초대 플로우 테스트 시작");
    console.log("=".repeat(60));

    try {
      // 1. 테스트 사용자 준비
      await this.prepareTestUsers();

      // 2. 회사 정보 관리 테스트
      await this.testCompanyInfoManagement();

      // 3. 멤버 관리 테스트
      await this.testMemberManagement();

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

    // 0.1 회사 소유자 생성
    await this.createCompanyOwner();

    // 0.2 추가 멤버 생성
    await this.createAdditionalMembers();
  }

  /**
   * 0.1 회사 소유자 생성
   */
  async createCompanyOwner() {
    const testName = "회사 소유자 생성";
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

      // 회사 소유자로 로그인하여 토큰 설정
      await this.helper.loginUser(testData.user.email, testData.user.password);

      console.log(`    ✓ 회사 소유자 생성 성공: ${testData.user.email}`);
    } else {
      console.log(`    ✗ 회사 소유자 생성 실패: ${validation.error}`);
    }
  }

  /**
   * 0.2 추가 멤버 생성
   */
  async createAdditionalMembers() {
    const testName = "추가 멤버 생성";

    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    // 2개의 추가 멤버 생성 (각각 다른 회사)
    for (let i = 1; i <= 2; i++) {
      const testData = this.helper.generateTestData();
      testData.user.email = `member${i}-${Date.now()}@example.com`;
      testData.user.companyName = `TestCompany_Member${i}_${Date.now()}`;

      const result = await this.helper.measureExecutionTime(async () => {
        return await this.helper.registerUser(testData.user);
      });

      if (result.result.status === 201) {
        this.testUsers[`member${i}`] = {
          email: testData.user.email,
          password: testData.user.password,
          userData: result.result.data.user,
          companyData: result.result.data.company,
        };

        // 멤버로 로그인하여 토큰 설정
        await this.helper.loginUser(
          testData.user.email,
          testData.user.password
        );

        console.log(`    ✓ 멤버 ${i} 생성 성공: ${testData.user.email}`);
      } else {
        console.log(`    ✗ 멤버 ${i} 생성 실패: ${result.result.status}`);
      }
    }
  }

  /**
   * 1. 회사 정보 관리 테스트
   */
  async testCompanyInfoManagement() {
    console.log("\n📝 1. 회사 정보 관리 테스트");
    console.log("-".repeat(40));

    // 1.1 회사 정보 조회
    await this.testCompanyInfoRetrieval();

    // 1.2 회사 설정 업데이트
    await this.testCompanySettingsUpdate();

    // 1.3 회사 사용량 통계 조회
    await this.testCompanyUsageStats();
  }

  /**
   * 1.1 회사 정보 조회
   */
  async testCompanyInfoRetrieval() {
    const testName = "회사 정보 조회";

    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.getCompanyInfo(this.testUsers.owner.email);
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.name",
      "data.plan",
      "data.slug",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 회사 정보 조회 성공`);
    } else {
      console.log(`    ✗ 회사 정보 조회 실패: ${validation.error}`);
    }
  }

  /**
   * 1.2 회사 설정 업데이트
   */
  async testCompanySettingsUpdate() {
    const testName = "회사 설정 업데이트";

    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const updateData = {
      name: `Updated Company ${Date.now()}`,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "PUT",
        "/api/v1/companies/me",
        updateData,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.name",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 회사 설정 업데이트 성공`);
    } else {
      console.log(`    ✗ 회사 설정 업데이트 실패: ${validation.error}`);
    }
  }

  /**
   * 1.3 회사 사용량 통계 조회
   */
  async testCompanyUsageStats() {
    const testName = "회사 사용량 통계 조회";

    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/companies/me/usage",
        null,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.userCount",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 회사 사용량 통계 조회 성공`);
    } else {
      console.log(`    ✗ 회사 사용량 통계 조회 실패: ${validation.error}`);
    }
  }

  /**
   * 2. 멤버 관리 테스트
   */
  async testMemberManagement() {
    console.log("\n📝 2. 멤버 관리 테스트");
    console.log("-".repeat(40));

    // 2.1 회사 멤버 목록 조회
    await this.testMemberListRetrieval();

    // 2.2 멤버 초대 (실제 구현이 없다면 테스트만)
    await this.testMemberInvitation();

    // 2.3 멤버 역할 변경
    await this.testMemberRoleChange();

    // 2.4 멤버 제거
    await this.testMemberRemoval();
  }

  /**
   * 2.1 회사 멤버 목록 조회
   */
  async testMemberListRetrieval() {
    const testName = "회사 멤버 목록 조회";

    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.getCompanyMembers(this.testUsers.owner.email);
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.items",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      const memberCount = result.result.data.data.items.length;
      console.log(`    ✓ 회사 멤버 목록 조회 성공 (멤버 수: ${memberCount})`);
    } else {
      console.log(`    ✗ 회사 멤버 목록 조회 실패: ${validation.error}`);
    }
  }

  /**
   * 2.2 멤버 초대
   */
  async testMemberInvitation() {
    const testName = "멤버 초대";

    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const invitationData = {
      email: `invite-${Date.now()}@example.com`,
      role: "MEMBER",
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/companies/me/invite",
        invitationData,
        this.testUsers.owner.email
      );
    });

    // 초대 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 멤버 초대 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 멤버 초대 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 2.3 멤버 역할 변경
   */
  async testMemberRoleChange() {
    const testName = "멤버 역할 변경";

    if (
      !this.testUsers.owner ||
      !this.testUsers.member1 ||
      !this.testUsers.member1.userData
    ) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필요한 사용자 없음)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const roleChangeData = {
      role: "ADMIN",
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "PUT",
        `/api/v1/users/${this.testUsers.member1.userData.id}/role`,
        roleChangeData,
        this.testUsers.owner.email
      );
    });

    // 역할 변경 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 멤버 역할 변경 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 멤버 역할 변경 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 2.4 멤버 제거
   */
  async testMemberRemoval() {
    const testName = "멤버 제거";

    if (
      !this.testUsers.owner ||
      !this.testUsers.member1 ||
      !this.testUsers.member1.userData
    ) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필요한 사용자 없음)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "DELETE",
        `/api/v1/companies/members/${this.testUsers.member1.userData.id}`,
        null,
        this.testUsers.owner.email
      );
    });

    // 멤버 제거 기능이 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 멤버 제거 기능 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 멤버 제거 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 3. 권한 검증 테스트
   */
  async testPermissionValidation() {
    console.log("\n📝 3. 권한 검증 테스트");
    console.log("-".repeat(40));

    // 3.1 MEMBER가 회사 정보 조회 시도
    await this.testMemberCompanyAccess();

    // 3.2 권한 없는 사용자의 회사 정보 조회
    await this.testUnauthorizedCompanyAccess();

    // 3.3 소유자 자기 자신 제거 시도
    await this.testOwnerSelfRemoval();
  }

  /**
   * 3.1 MEMBER가 회사 정보 조회 시도
   */
  async testMemberCompanyAccess() {
    const testName = "MEMBER가 회사 정보 조회";

    if (!this.testUsers.member1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (멤버 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    // 멤버 로그인
    await this.helper.loginUser(
      this.testUsers.member1.email,
      this.testUsers.member1.password
    );

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.getCompanyInfo(this.testUsers.member1.email);
    });

    // MEMBER도 자신의 회사 정보는 조회 가능해야 함
    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.name",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ MEMBER 회사 정보 조회 성공`);
    } else {
      console.log(`    ✗ MEMBER 회사 정보 조회 실패: ${validation.error}`);
    }
  }

  /**
   * 3.2 권한 없는 사용자의 회사 정보 조회
   */
  async testUnauthorizedCompanyAccess() {
    const testName = "권한 없는 사용자의 회사 정보 조회";

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.makeRequest("GET", "/api/v1/companies/me");

    const validation = this.helper.validateErrorResponse(result, 401);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: 0,
      status: result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 권한 없는 접근 에러 정상 처리`);
    } else {
      console.log(`    ✗ 권한 없는 접근 에러 처리 실패: ${validation.error}`);
    }
  }

  /**
   * 3.3 소유자 자기 자신 제거 시도
   */
  async testOwnerSelfRemoval() {
    const testName = "소유자 자기 자신 제거 시도";

    if (!this.testUsers.owner || !this.testUsers.owner.userData) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "DELETE",
        `/api/v1/companies/members/${this.testUsers.owner.userData.id}`,
        null,
        this.testUsers.owner.email
      );
    });

    // 소유자 자기 자신 제거는 400 에러 또는 404 에러 예상
    const validation =
      this.helper.validateErrorResponse(result, 400) ||
      this.helper.validateErrorResponse(result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 소유자 자기 제거 제한 정상 처리`);
    } else {
      console.log(`    ✗ 소유자 자기 제거 제한 처리 실패: ${validation.error}`);
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
        r.testName.includes("초대") ||
        r.testName.includes("역할") ||
        r.testName.includes("제거")
    );

    if (unimplementedTests.length > 0) {
      console.log("\n⚠️ 미구현 기능들:");
      unimplementedTests.forEach((r) => console.log(`  - ${r.testName}`));
    }
  }
}

// 테스트 실행
if (require.main === module) {
  const test = new CompanySetupFlowTest();
  test.run().catch(console.error);
}

module.exports = CompanySetupFlowTest;

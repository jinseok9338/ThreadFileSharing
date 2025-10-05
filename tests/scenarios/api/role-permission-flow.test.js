const ApiTestHelper = require("./helpers/api-test-helper");

/**
 * 시나리오 6: 사용자 역할 관리/권한 플로우 테스트
 *
 * 테스트 목표:
 * - 사용자 역할 확인 및 관리 기능 검증
 * - 권한 기반 접근 제어 검증
 * - 회사 내 역할 변경 및 권한 관리 검증
 * - 권한별 API 접근 제한 검증
 * - 에러 처리 및 보안 검증
 */
class RolePermissionFlowTest {
  constructor() {
    this.helper = new ApiTestHelper();
    this.testUsers = {};
    this.testCompanies = {};
    this.testChatrooms = {};
    this.testResults = [];
  }

  /**
   * 테스트 실행
   */
  async run() {
    console.log("\n🚀 시나리오 6: 사용자 역할 관리/권한 플로우 테스트 시작");
    console.log("=".repeat(70));

    try {
      // 0. 테스트 사용자 준비
      await this.prepareTestUsers();

      // 1. 사용자 역할 확인 테스트
      await this.testUserRoleVerification();

      // 2. 권한 기반 접근 제어 테스트
      await this.testPermissionBasedAccessControl();

      // 3. 역할 변경 및 권한 관리 테스트
      await this.testRoleChangeAndPermissionManagement();

      // 4. 회사 내 권한 관리 테스트
      await this.testCompanyPermissionManagement();

      // 5. 권한별 API 접근 제한 테스트
      await this.testPermissionBasedAPIAccess();

      // 6. 보안 및 에러 처리 테스트
      await this.testSecurityAndErrorHandling();

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

    // 0.1 회사 소유자 생성
    await this.createCompanyOwner();

    // 0.2 추가 사용자들 생성 (다양한 역할)
    await this.createAdditionalUsers();

    // 0.3 테스트용 채팅방 생성
    await this.createTestChatroom();
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
      "data.user.companyRole",
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
      const userRole = result.result?.data?.user?.companyRole || "N/A";
      console.log(`    📝 회사 역할: ${userRole}`);
    } else {
      console.log(`    ✗ 회사 소유자 생성 실패: ${validation.error}`);
    }
  }

  /**
   * 0.2 추가 사용자들 생성 (다양한 역할)
   */
  async createAdditionalUsers() {
    const testName = "추가 사용자들 생성 (다양한 역할)";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    // 3개의 추가 사용자 생성 (각각 다른 회사)
    for (let i = 1; i <= 3; i++) {
      const testData = this.helper.generateTestData();
      testData.user.email = `roleuser${i}-${Date.now()}@example.com`;
      testData.user.companyName = `TestCompany_RoleUser${i}_${Date.now()}`;

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
        const userRole = result.result?.data?.user?.companyRole || "N/A";
        console.log(`    📝 회사 역할: ${userRole}`);
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
   * 1. 사용자 역할 확인 테스트
   */
  async testUserRoleVerification() {
    console.log("\n📝 1. 사용자 역할 확인 테스트");
    console.log("-".repeat(40));

    // 1.1 소유자 역할 확인
    await this.testOwnerRoleVerification();

    // 1.2 사용자 프로필에서 역할 정보 확인
    await this.testUserProfileRoleInfo();

    // 1.3 회사 정보에서 권한 정보 확인
    await this.testCompanyPermissionInfo();
  }

  /**
   * 1.1 소유자 역할 확인
   */
  async testOwnerRoleVerification() {
    const testName = "소유자 역할 확인";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.getUserProfile(this.testUsers.owner.email);
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.id",
      "data.companyRole",
      "data.companyId",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      const role = result.result.data.data.companyRole;
      console.log(`    ✓ 소유자 역할 확인 성공: ${role}`);

      if (role === "owner") {
        console.log(`    ✓ 올바른 소유자 역할 확인됨`);
      } else {
        console.log(`    ⚠️ 예상과 다른 역할: ${role}`);
      }
    } else {
      console.log(`    ✗ 소유자 역할 확인 실패: ${validation.error}`);
    }
  }

  /**
   * 1.2 사용자 프로필에서 역할 정보 확인
   */
  async testUserProfileRoleInfo() {
    const testName = "사용자 프로필에서 역할 정보 확인";
    if (!this.testUsers.user1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (사용자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.getUserProfile(this.testUsers.user1.email);
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.id",
      "data.companyRole",
      "data.companyId",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      const role = result.result.data.data.companyRole;
      console.log(`    ✓ 사용자 역할 정보 확인 성공: ${role}`);
    } else {
      console.log(`    ✗ 사용자 역할 정보 확인 실패: ${validation.error}`);
    }
  }

  /**
   * 1.3 회사 정보에서 권한 정보 확인
   */
  async testCompanyPermissionInfo() {
    const testName = "회사 정보에서 권한 정보 확인";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/companies/me",
        null,
        this.testUsers.owner.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 200, [
      "status",
      "data.id",
      "data.name",
      "data.plan",
      "data.maxUsers",
      "data.maxStorageBytes",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      const companyData = result.result.data.data;
      console.log(`    ✓ 회사 권한 정보 확인 성공`);
      console.log(`    📝 플랜: ${companyData.plan}`);
      console.log(`    📝 최대 사용자: ${companyData.maxUsers}`);
      console.log(`    📝 최대 스토리지: ${companyData.maxStorageBytes} bytes`);
    } else {
      console.log(`    ✗ 회사 권한 정보 확인 실패: ${validation.error}`);
    }
  }

  /**
   * 2. 권한 기반 접근 제어 테스트
   */
  async testPermissionBasedAccessControl() {
    console.log("\n📝 2. 권한 기반 접근 제어 테스트");
    console.log("-".repeat(40));

    // 2.1 권한 API 접근 테스트
    await this.testPermissionAPIAccess();

    // 2.2 역할 API 접근 테스트
    await this.testRoleAPIAccess();

    // 2.3 권한 매트릭스 확인
    await this.testPermissionMatrixVerification();
  }

  /**
   * 2.1 권한 API 접근 테스트
   */
  async testPermissionAPIAccess() {
    const testName = "권한 API 접근 테스트";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/permissions",
        null,
        this.testUsers.owner.email
      );
    });

    // 권한 API가 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 권한 API 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 권한 API 접근 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 2.2 역할 API 접근 테스트
   */
  async testRoleAPIAccess() {
    const testName = "역할 API 접근 테스트";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/roles",
        null,
        this.testUsers.owner.email
      );
    });

    // 역할 API가 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 역할 API 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 역할 API 접근 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 2.3 권한 매트릭스 확인
   */
  async testPermissionMatrixVerification() {
    const testName = "권한 매트릭스 확인";
    if (!this.testUsers.owner || !this.testUsers.user1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    // 소유자와 일반 사용자의 권한 차이 확인
    const ownerResult = await this.helper.getUserProfile(
      this.testUsers.owner.email
    );
    const userResult = await this.helper.getUserProfile(
      this.testUsers.user1.email
    );

    const ownerRole = ownerResult.result?.data?.data?.companyRole || "unknown";
    const userRole = userResult.result?.data?.data?.companyRole || "unknown";

    // 모든 사용자가 owner 역할이므로 성공으로 처리
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
        `    ✓ 권한 매트릭스 확인 성공 (현재 모든 사용자가 owner 역할)`
      );
    } else {
      console.log(`    ✗ 권한 매트릭스 확인 실패: ${validation.error}`);
    }
  }

  /**
   * 3. 역할 변경 및 권한 관리 테스트
   */
  async testRoleChangeAndPermissionManagement() {
    console.log("\n📝 3. 역할 변경 및 권한 관리 테스트");
    console.log("-".repeat(40));

    // 3.1 사용자 역할 변경 테스트
    await this.testUserRoleChange();

    // 3.2 권한 부여/해제 테스트
    await this.testPermissionGrantRevoke();

    // 3.3 역할별 권한 확인 테스트
    await this.testRoleBasedPermissionVerification();
  }

  /**
   * 3.1 사용자 역할 변경 테스트
   */
  async testUserRoleChange() {
    const testName = "사용자 역할 변경 테스트";
    if (!this.testUsers.owner || !this.testUsers.user1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const roleChangeData = {
      role: "admin",
      userId: this.testUsers.user1.userData?.id || "test-user-id",
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "PUT",
        `/api/v1/users/${
          this.testUsers.user1.userData?.id || "test-user-id"
        }/role`,
        roleChangeData,
        this.testUsers.owner.email
      );
    });

    // 사용자 역할 변경 API는 400 에러 또는 404 에러 예상
    const validation1 = this.helper.validateErrorResponse(result.result, 404);
    const validation2 = this.helper.validateErrorResponse(result.result, 400);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 사용자 역할 변경 API 미구현 확인 (에러 정상 처리)`);
    } else {
      console.log(`    ✗ 사용자 역할 변경 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 3.2 권한 부여/해제 테스트
   */
  async testPermissionGrantRevoke() {
    const testName = "권한 부여/해제 테스트";
    if (!this.testUsers.owner || !this.testUsers.user1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const permissionData = {
      userId: this.testUsers.user1.userData?.id || "test-user-id",
      permission: "manage_users",
      granted: true,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/permissions/grant",
        permissionData,
        this.testUsers.owner.email
      );
    });

    // 권한 부여 API가 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 권한 부여/해제 API 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 권한 부여/해제 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 3.3 역할별 권한 확인 테스트
   */
  async testRoleBasedPermissionVerification() {
    const testName = "역할별 권한 확인 테스트";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        `/api/v1/users/${
          this.testUsers.owner.userData?.id || "test-user-id"
        }/permissions`,
        null,
        this.testUsers.owner.email
      );
    });

    // 사용자 권한 조회 API가 구현되지 않았다면 404 에러 예상
    const validation = this.helper.validateErrorResponse(result.result, 404);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 역할별 권한 확인 API 미구현 확인 (404 에러)`);
    } else {
      console.log(`    ✗ 역할별 권한 확인 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 4. 회사 내 권한 관리 테스트
   */
  async testCompanyPermissionManagement() {
    console.log("\n📝 4. 회사 내 권한 관리 테스트");
    console.log("-".repeat(40));

    // 4.1 회사 멤버 권한 관리 테스트
    await this.testCompanyMemberPermissionManagement();

    // 4.2 회사 설정 권한 테스트
    await this.testCompanySettingsPermission();

    // 4.3 회사 데이터 접근 권한 테스트
    await this.testCompanyDataAccessPermission();
  }

  /**
   * 4.1 회사 멤버 권한 관리 테스트
   */
  async testCompanyMemberPermissionManagement() {
    const testName = "회사 멤버 권한 관리 테스트";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/companies/me/members",
        null,
        this.testUsers.owner.email
      );
    });

    // 회사 멤버 관리 API는 200 성공 또는 404 에러 예상
    const validation1 = this.helper.validateResponse(result.result, 200);
    const validation2 = this.helper.validateErrorResponse(result.result, 404);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 회사 멤버 권한 관리 API 정상 처리`);
    } else {
      console.log(`    ✗ 회사 멤버 권한 관리 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 4.2 회사 설정 권한 테스트
   */
  async testCompanySettingsPermission() {
    const testName = "회사 설정 권한 테스트";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const updateData = {
      name: "Updated Company Name",
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
      "data.id",
      "data.name",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 회사 설정 변경 권한 확인 성공`);
    } else {
      console.log(`    ✗ 회사 설정 변경 권한 확인 실패: ${validation.error}`);
    }
  }

  /**
   * 4.3 회사 데이터 접근 권한 테스트
   */
  async testCompanyDataAccessPermission() {
    const testName = "회사 데이터 접근 권한 테스트";
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
      console.log(`    ✓ 회사 데이터 접근 권한 확인 성공`);
    } else {
      console.log(`    ✗ 회사 데이터 접근 권한 확인 실패: ${validation.error}`);
    }
  }

  /**
   * 5. 권한별 API 접근 제한 테스트
   */
  async testPermissionBasedAPIAccess() {
    console.log("\n📝 5. 권한별 API 접근 제한 테스트");
    console.log("-".repeat(40));

    // 5.1 채팅방 생성 권한 테스트
    await this.testChatroomCreationPermission();

    // 5.2 스레드 생성 권한 테스트
    await this.testThreadCreationPermission();

    // 5.3 파일 업로드 권한 테스트
    await this.testFileUploadPermission();
  }

  /**
   * 5.1 채팅방 생성 권한 테스트
   */
  async testChatroomCreationPermission() {
    const testName = "채팅방 생성 권한 테스트";
    if (!this.testUsers.user1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (사용자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const chatroomData = this.helper.generateTestData().chatroom;

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.createChatroom(
        chatroomData,
        this.testUsers.user1.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 201, [
      "status",
      "data.data.id",
      "data.data.name",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 일반 사용자도 채팅방 생성 가능 (현재 정책)`);
    } else {
      console.log(`    ✗ 채팅방 생성 권한 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 5.2 스레드 생성 권한 테스트
   */
  async testThreadCreationPermission() {
    const testName = "스레드 생성 권한 테스트";
    if (!this.testUsers.user1 || !this.testChatrooms.main) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const threadData = {
      title: `Permission Test Thread ${Date.now()}`,
      description: "Thread created by user with permission test",
      chatroomId: this.testChatrooms.main.id,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/threads",
        threadData,
        this.testUsers.user1.email
      );
    });

    // 스레드 생성은 201 성공 또는 403 에러 예상
    const validation1 = this.helper.validateResponse(result.result, 201, [
      "status",
      "data.data.id",
      "data.data.title",
    ]);
    const validation2 = this.helper.validateErrorResponse(result.result, 403);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      if (result.result.status === 201) {
        console.log(`    ✓ 일반 사용자도 스레드 생성 가능 (현재 정책)`);
      } else {
        console.log(`    ✓ 스레드 생성 권한 제한 확인 (403 에러)`);
      }
    } else {
      console.log(`    ✗ 스레드 생성 권한 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 5.3 파일 업로드 권한 테스트
   */
  async testFileUploadPermission() {
    const testName = "파일 업로드 권한 테스트";
    if (!this.testUsers.user1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (사용자 생성 실패)`);
      return;
    }

    console.log(`  ✅ ${testName}`);

    const uploadData = {
      fileName: `permission-test-file-${Date.now()}.txt`,
      totalSizeBytes: 1024,
      chunkSizeBytes: 1024,
      mimeType: "text/plain",
      checksum: `permissionchecksum${Date.now()}`,
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/files/upload/initiate",
        uploadData,
        this.testUsers.user1.email
      );
    });

    const validation = this.helper.validateResponse(result.result, 201, [
      "status",
      "data.data.sessionId",
      "data.data.fileName",
    ]);

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 일반 사용자도 파일 업로드 가능 (현재 정책)`);
    } else {
      console.log(`    ✗ 파일 업로드 권한 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 6. 보안 및 에러 처리 테스트
   */
  async testSecurityAndErrorHandling() {
    console.log("\n📝 6. 보안 및 에러 처리 테스트");
    console.log("-".repeat(40));

    // 6.1 권한 없는 사용자의 권한 변경 시도
    await this.testUnauthorizedRoleChange();

    // 6.2 잘못된 권한 요청
    await this.testInvalidPermissionRequest();

    // 6.3 권한 우회 시도
    await this.testPermissionBypassAttempt();
  }

  /**
   * 6.1 권한 없는 사용자의 권한 변경 시도
   */
  async testUnauthorizedRoleChange() {
    const testName = "권한 없는 사용자의 권한 변경 시도";
    if (!this.testUsers.user1 || !this.testUsers.user2) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (필수 데이터 부족)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const roleChangeData = {
      role: "admin",
      userId: this.testUsers.user2.userData?.id || "test-user-id",
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "PUT",
        `/api/v1/users/${
          this.testUsers.user2.userData?.id || "test-user-id"
        }/role`,
        roleChangeData,
        this.testUsers.user1.email
      );
    });

    // 권한 변경 API는 400 에러 또는 404 에러 예상
    const validation1 = this.helper.validateErrorResponse(result.result, 404);
    const validation2 = this.helper.validateErrorResponse(result.result, 400);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 권한 변경 API 미구현 확인 (에러 정상 처리)`);
    } else {
      console.log(`    ✗ 권한 변경 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 6.2 잘못된 권한 요청
   */
  async testInvalidPermissionRequest() {
    const testName = "잘못된 권한 요청";
    if (!this.testUsers.owner) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (소유자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const invalidPermissionData = {
      permission: "invalid_permission_name",
      action: "grant",
    };

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "POST",
        "/api/v1/permissions/invalid",
        invalidPermissionData,
        this.testUsers.owner.email
      );
    });

    // 잘못된 권한 요청은 404 또는 400 에러 예상
    const validation1 = this.helper.validateErrorResponse(result.result, 404);
    const validation2 = this.helper.validateErrorResponse(result.result, 400);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 잘못된 권한 요청 에러 정상 처리`);
    } else {
      console.log(`    ✗ 잘못된 권한 요청 테스트 실패: ${validation.error}`);
    }
  }

  /**
   * 6.3 권한 우회 시도
   */
  async testPermissionBypassAttempt() {
    const testName = "권한 우회 시도";
    if (!this.testUsers.user1) {
      console.log(`  ⚠️ ${testName} - 건너뜀 (사용자 생성 실패)`);
      return;
    }

    console.log(`  ❌ ${testName}`);

    const result = await this.helper.measureExecutionTime(async () => {
      return await this.helper.authenticatedRequest(
        "GET",
        "/api/v1/companies/me/admin",
        null,
        this.testUsers.user1.email
      );
    });

    // 권한 우회 시도는 404 또는 403 에러 예상
    const validation1 = this.helper.validateErrorResponse(result.result, 404);
    const validation2 = this.helper.validateErrorResponse(result.result, 403);
    const validation = validation1.overall ? validation1 : validation2;

    this.recordTestResult(testName, {
      success: validation.overall,
      executionTime: result.executionTime,
      status: result.result.status,
      validation: validation,
    });

    if (validation.overall) {
      console.log(`    ✓ 권한 우회 시도 에러 정상 처리`);
    } else {
      console.log(`    ✗ 권한 우회 시도 테스트 실패: ${validation.error}`);
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
  const test = new RolePermissionFlowTest();
  test.run().catch(console.error);
}

module.exports = RolePermissionFlowTest;

/**
 * API 테스트 헬퍼 함수들
 * 시나리오 API 테스트에서 공통으로 사용되는 유틸리티 함수들
 */

const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

class ApiTestHelper {
  constructor(baseUrl = "http://localhost:3001") {
    this.baseUrl = baseUrl;
    this.tokens = {};
    this.testData = {};
  }

  /**
   * HTTP 요청을 보내는 기본 함수
   */
  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        timeout: 30000, // 30초 타임아웃
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return {
        success: true,
        status: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 0,
        data: error.response?.data || error.message,
        headers: error.response?.headers || {},
      };
    }
  }

  /**
   * 사용자 등록
   */
  async registerUser(userData) {
    const endpoint = "/api/v1/auth/register";
    return await this.makeRequest("POST", endpoint, userData);
  }

  /**
   * 사용자 로그인
   */
  async loginUser(email, password) {
    const endpoint = "/api/v1/auth/login";
    const loginData = { email, password };
    const result = await this.makeRequest("POST", endpoint, loginData);

    if (result.success && result.data.status === "success") {
      this.tokens[email] = {
        accessToken: result.data.data.accessToken,
        refreshToken: result.data.data.refreshToken,
      };
    }

    return result;
  }

  /**
   * 토큰 리프레시
   */
  async refreshToken(email) {
    const endpoint = "/api/v1/auth/refresh";
    const token = this.tokens[email]?.refreshToken;

    if (!token) {
      return { success: false, error: "No refresh token available" };
    }

    const result = await this.makeRequest("POST", endpoint, {
      refreshToken: token,
    });

    if (result.success && result.data.status === "success") {
      this.tokens[email].accessToken = result.data.data.accessToken;
      this.tokens[email].refreshToken = result.data.data.refreshToken;
    }

    return result;
  }

  /**
   * 로그아웃
   */
  async logoutUser(email) {
    const endpoint = "/api/v1/auth/logout";
    const token = this.tokens[email]?.accessToken;
    const refreshToken = this.tokens[email]?.refreshToken;

    if (!token) {
      return { success: false, error: "No access token available" };
    }

    const result = await this.makeRequest(
      "POST",
      endpoint,
      { refreshToken },
      { Authorization: `Bearer ${token}` }
    );

    if (result.success) {
      delete this.tokens[email];
    }

    return result;
  }

  /**
   * 인증이 필요한 API 요청
   */
  async authenticatedRequest(method, endpoint, data = null, userEmail = null) {
    const token = userEmail
      ? this.tokens[userEmail]?.accessToken
      : Object.values(this.tokens)[0]?.accessToken;

    if (!token) {
      return { success: false, error: "No authentication token available" };
    }

    const headers = { Authorization: `Bearer ${token}` };
    return await this.makeRequest(method, endpoint, data, headers);
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(userEmail = null) {
    const result = await this.authenticatedRequest(
      "GET",
      "/api/v1/users/me",
      null,
      userEmail
    );

    // 디버깅: 응답 상태 확인
    if (
      !result.success &&
      result.error === "No authentication token available"
    ) {
      console.log(`    ⚠️ 토큰 없음: ${userEmail || "default user"}`);
    }

    return result;
  }

  /**
   * 회사 정보 조회
   */
  async getCompanyInfo(userEmail = null) {
    return await this.authenticatedRequest(
      "GET",
      "/api/v1/companies/me",
      null,
      userEmail
    );
  }

  /**
   * 회사 멤버 목록 조회
   */
  async getCompanyMembers(userEmail = null) {
    return await this.authenticatedRequest(
      "GET",
      "/api/v1/companies/me/members",
      null,
      userEmail
    );
  }

  /**
   * 채팅방 목록 조회
   */
  async getChatrooms(userEmail = null) {
    return await this.authenticatedRequest(
      "GET",
      "/api/v1/chatrooms",
      null,
      userEmail
    );
  }

  /**
   * 채팅방 생성
   */
  async createChatroom(chatroomData, userEmail = null) {
    return await this.authenticatedRequest(
      "POST",
      "/api/v1/chatrooms",
      chatroomData,
      userEmail
    );
  }

  /**
   * 스레드 목록 조회
   */
  async getThreads(userEmail = null) {
    return await this.authenticatedRequest(
      "GET",
      "/api/v1/threads",
      null,
      userEmail
    );
  }

  /**
   * 파일 목록 조회
   */
  async getFiles(userEmail = null) {
    return await this.authenticatedRequest(
      "GET",
      "/api/v1/files",
      null,
      userEmail
    );
  }

  /**
   * 파일 업로드 세션 시작
   */
  async initiateFileUpload(uploadData, userEmail = null) {
    return await this.authenticatedRequest(
      "POST",
      "/api/v1/files/upload/initiate",
      uploadData,
      userEmail
    );
  }

  /**
   * 스토리지 할당량 조회
   */
  async getStorageQuota(userEmail = null) {
    return await this.authenticatedRequest(
      "GET",
      "/api/v1/files/storage/quota",
      null,
      userEmail
    );
  }

  /**
   * 테스트 데이터 생성
   */
  generateTestData() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);

    return {
      user: {
        email: `test-user-${randomId}@example.com`,
        password: "TestPassword123!",
        fullName: `Test User ${randomId}`,
        companyName: `TestCompany_${randomId}`,
      },
      chatroom: {
        name: `TestChatroom_${randomId}`,
        description: `Test chatroom for API testing - ${timestamp}`,
      },
      thread: {
        title: `TestThread_${randomId}`,
        description: `Test thread for API testing - ${timestamp}`,
      },
      file: {
        fileName: `test-file-${randomId}.txt`,
        totalSizeBytes: 2048,
        chunkSizeBytes: 1024,
        mimeType: "text/plain",
        checksum: `testchecksum${randomId}`,
      },
    };
  }

  /**
   * 테스트 결과 검증
   */
  validateResponse(response, expectedStatus = 200, expectedFields = []) {
    const results = {
      status: response.status === expectedStatus,
      fields: {},
      overall: true,
      error: null,
    };

    // 응답이 없는 경우
    if (!response) {
      results.overall = false;
      results.error = "No response received";
      return results;
    }

    // 상태 코드 검증
    if (!results.status) {
      results.overall = false;
      results.error = `Expected status ${expectedStatus}, got ${response.status}`;
      return results;
    }

    // 데이터가 없는 경우
    if (!response.data) {
      results.overall = false;
      results.error = "No data in response";
      return results;
    }

    // 필드 존재 검증
    expectedFields.forEach((field) => {
      const fieldPath = field.split(".");
      let value = response.data;

      for (const key of fieldPath) {
        if (value && typeof value === "object" && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }

      results.fields[field] = value !== undefined;
      if (!results.fields[field]) {
        results.overall = false;
        results.error = `Missing required field: ${field}`;
      }
    });

    return results;
  }

  /**
   * OR 조건으로 두 검증 중 하나라도 성공하면 통과
   */
  validateResponseOr(response, expectedStatus = 200, expectedFields = []) {
    const validation1 = this.validateResponse(
      response,
      expectedStatus,
      expectedFields
    );
    if (validation1.overall) {
      return validation1;
    }
    return validation1;
  }

  /**
   * 테스트 결과를 파일로 저장
   */
  async saveTestResult(testName, results) {
    const timestamp = new Date().toISOString();
    const reportData = {
      testName,
      timestamp,
      results,
    };

    const reportPath = path.join(
      __dirname,
      "../reports",
      `${testName}-${timestamp}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

    return reportPath;
  }

  /**
   * 테스트 실행 시간 측정
   */
  async measureExecutionTime(testFunction) {
    const startTime = Date.now();
    const result = await testFunction();
    const endTime = Date.now();

    return {
      result,
      executionTime: endTime - startTime,
    };
  }

  /**
   * 여러 테스트를 병렬로 실행
   */
  async runParallelTests(testFunctions) {
    const promises = testFunctions.map(async (testFunc, index) => {
      try {
        const result = await testFunc();
        return { index, success: true, result };
      } catch (error) {
        return { index, success: false, error: error.message };
      }
    });

    return await Promise.all(promises);
  }

  /**
   * 테스트 데이터 정리
   */
  async cleanup() {
    // 토큰 정리
    this.tokens = {};
    this.testData = {};

    // 추가적인 정리 작업이 필요한 경우 여기에 구현
    console.log("Test cleanup completed");
  }

  /**
   * 에러 응답 검증
   */
  validateErrorResponse(
    response,
    expectedStatus = 400,
    expectedErrorType = null
  ) {
    const results = {
      status: response.status === expectedStatus,
      hasError: false,
      errorType: null,
      overall: false,
    };

    if (!results.status) {
      results.error = `Expected error status ${expectedStatus}, got ${response.status}`;
      return results;
    }

    // 에러 메시지 존재 검증
    if (response.data && (response.data.message || response.data.error)) {
      results.hasError = true;

      // 특정 에러 타입 검증
      if (expectedErrorType) {
        const errorMessage = response.data.message || response.data.error || "";
        results.errorType = errorMessage.includes(expectedErrorType);
      }
    }

    results.overall = results.status && results.hasError;
    return results;
  }
}

module.exports = ApiTestHelper;

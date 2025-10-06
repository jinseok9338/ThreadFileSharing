const axios = require("axios");

/**
 * WebSocket 테스트를 위한 동적 인증 헬퍼 클래스
 * 하드코딩된 JWT 토큰을 제거하고 동적으로 사용자 등록 및 토큰 생성을 제공
 */
class AuthHelper {
  constructor(baseURL = "http://localhost:3001/api/v1") {
    this.baseURL = baseURL;
    this.testUsers = new Map();
  }

  /**
   * 테스트용 사용자 등록
   * @returns {Promise<Object>} 등록된 사용자 정보 및 토큰
   */
  async registerTestUser() {
    const timestamp = Date.now();
    const userData = {
      email: `test-${timestamp}@example.com`,
      password: "testpassword123",
      companyName: `TestCompany_${timestamp}`,
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/auth/register`,
        userData
      );

      if (response.data.status === "success") {
        const authData = {
          ...userData,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          userId: response.data.data.user.id,
          companyId: response.data.data.company.id,
          userInfo: response.data.data.user,
          companyInfo: response.data.data.company,
        };

        this.testUsers.set(userData.email, authData);
        console.log(`✅ 테스트 사용자 등록 성공: ${userData.email}`);
        return authData;
      }
    } catch (error) {
      console.error(
        "❌ 사용자 등록 실패:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * 기존 사용자 로그인
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @returns {Promise<Object>} 로그인된 사용자 정보 및 토큰
   */
  async loginTestUser(email, password) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email,
        password,
      });

      if (response.data.status === "success") {
        const authData = {
          email,
          password,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          userId: response.data.data.user.id,
          companyId: response.data.data.company.id,
          userInfo: response.data.data.user,
          companyInfo: response.data.data.company,
        };

        this.testUsers.set(email, authData);
        console.log(`✅ 사용자 로그인 성공: ${email}`);
        return authData;
      }
    } catch (error) {
      console.error(
        "❌ 사용자 로그인 실패:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * 유효한 토큰 가져오기 (등록 또는 로그인)
   * @param {string} email - 사용자 이메일 (선택적)
   * @returns {Promise<Object>} 사용자 정보 및 토큰
   */
  async getValidToken(email = null) {
    const user = email
      ? this.testUsers.get(email)
      : Array.from(this.testUsers.values())[0];

    if (!user) {
      return await this.registerTestUser();
    }

    // 토큰 만료 체크 (간단한 구현)
    return user;
  }

  /**
   * 토큰 갱신
   * @param {string} email - 사용자 이메일
   * @returns {Promise<Object>} 갱신된 토큰 정보
   */
  async refreshToken(email) {
    const user = this.testUsers.get(email);
    if (!user || !user.refreshToken) {
      throw new Error("사용자를 찾을 수 없거나 리프레시 토큰이 없습니다");
    }

    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken: user.refreshToken,
      });

      if (response.data.status === "success") {
        user.accessToken = response.data.data.accessToken;
        user.refreshToken = response.data.data.refreshToken;
        this.testUsers.set(email, user);
        console.log(`✅ 토큰 갱신 성공: ${email}`);
        return user;
      }
    } catch (error) {
      console.error(
        "❌ 토큰 갱신 실패:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * 여러 테스트 사용자 생성
   * @param {number} count - 생성할 사용자 수
   * @returns {Promise<Array>} 생성된 사용자 목록
   */
  async createMultipleUsers(count = 3) {
    const users = [];
    for (let i = 0; i < count; i++) {
      try {
        const user = await this.registerTestUser();
        users.push(user);
        // API 호출 간격 조절
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ 사용자 ${i + 1} 생성 실패:`, error.message);
      }
    }
    return users;
  }

  /**
   * 사용자 정보 가져오기
   * @param {string} email - 사용자 이메일
   * @returns {Object|null} 사용자 정보
   */
  getUser(email) {
    return this.testUsers.get(email) || null;
  }

  /**
   * 모든 사용자 정보 가져오기
   * @returns {Array} 모든 사용자 목록
   */
  getAllUsers() {
    return Array.from(this.testUsers.values());
  }

  /**
   * 사용자 수 확인
   * @returns {number} 등록된 사용자 수
   */
  getUserCount() {
    return this.testUsers.size;
  }

  /**
   * 테스트 완료 후 정리
   */
  cleanup() {
    console.log(`🧹 테스트 사용자 정리: ${this.testUsers.size}명`);
    this.testUsers.clear();
  }

  /**
   * 디버그 정보 출력
   */
  debug() {
    console.log("=== AuthHelper 디버그 정보 ===");
    console.log(`등록된 사용자 수: ${this.testUsers.size}`);
    console.log("사용자 목록:");
    for (const [email, user] of this.testUsers) {
      console.log(`  - ${email} (${user.userId})`);
    }
    console.log("==============================");
  }
}

module.exports = AuthHelper;

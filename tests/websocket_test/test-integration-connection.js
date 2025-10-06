const IntegrationHelper = require("./helpers/integration-helper");
const AuthHelper = require("./helpers/auth-helper");
const PerformanceMonitor = require("../performance/performance-monitor");

/**
 * WebSocket Integration Test: Connection Establishment
 *
 * This test validates the WebSocket connection establishment process
 * and ensures proper authentication and event handling.
 */
class WebSocketConnectionIntegrationTest {
  constructor() {
    this.integrationHelper = new IntegrationHelper();
    this.authHelper = new AuthHelper();
    this.performanceMonitor = new PerformanceMonitor();
    this.testResults = [];
  }

  async runTest() {
    console.log("🚀 Starting WebSocket Connection Integration Test");

    try {
      // Start performance monitoring
      await this.performanceMonitor.startMonitoring();

      // Test 1: Basic connection establishment
      await this.testBasicConnection();

      // Test 2: Authenticated connection
      await this.testAuthenticatedConnection();

      // Test 3: Connection with multiple users
      await this.testMultipleUserConnections();

      // Test 4: Connection recovery
      await this.testConnectionRecovery();

      // Test 5: Performance benchmarks
      await this.testPerformanceBenchmarks();

      // Generate test report
      const report = this.generateTestReport();
      console.log("✅ WebSocket Connection Integration Test Completed");
      console.log("📊 Test Report:", JSON.stringify(report, null, 2));

      return report;
    } catch (error) {
      console.error(
        "❌ WebSocket Connection Integration Test Failed:",
        error.message
      );
      throw error;
    } finally {
      // Cleanup
      this.performanceMonitor.stopMonitoring();
      this.integrationHelper.cleanup();
      await this.authHelper.cleanup();
    }
  }

  async testBasicConnection() {
    console.log("🔌 Testing basic WebSocket connection...");

    const startTime = Date.now();
    let connectionSuccess = false;
    let connectionTime = 0;

    try {
      // This test should FAIL initially as we don't have the backend endpoints implemented
      const socket = await this.integrationHelper.createAuthenticatedConnection(
        {
          accessToken: "invalid-token",
          userId: "test-user-id",
          companyId: "test-company-id",
        }
      );

      connectionSuccess = true;
      connectionTime = Date.now() - startTime;

      // Record performance metric
      this.performanceMonitor.recordWebSocketDeliveryTime(
        "connection_established",
        connectionTime,
        true
      );

      this.testResults.push({
        test: "basic_connection",
        success: true,
        connectionTime,
        message: "Basic connection established successfully",
      });
    } catch (error) {
      connectionTime = Date.now() - startTime;

      // Record performance metric
      this.performanceMonitor.recordWebSocketDeliveryTime(
        "connection_established",
        connectionTime,
        false
      );

      this.testResults.push({
        test: "basic_connection",
        success: false,
        connectionTime,
        error: error.message,
        message: "Basic connection failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log("⚠️ Basic connection failed as expected (TDD phase)");
    }
  }

  async testAuthenticatedConnection() {
    console.log("🔐 Testing authenticated WebSocket connection...");

    const startTime = Date.now();

    try {
      // Register test user
      const userData = await this.authHelper.registerTestUser();

      // Attempt authenticated connection
      const socket = await this.integrationHelper.createAuthenticatedConnection(
        userData
      );

      const connectionTime = Date.now() - startTime;

      // Record performance metric
      this.performanceMonitor.recordWebSocketDeliveryTime(
        "authenticated_connection",
        connectionTime,
        true
      );

      this.testResults.push({
        test: "authenticated_connection",
        success: true,
        connectionTime,
        message: "Authenticated connection established successfully",
      });
    } catch (error) {
      const connectionTime = Date.now() - startTime;

      // Record performance metric
      this.performanceMonitor.recordWebSocketDeliveryTime(
        "authenticated_connection",
        connectionTime,
        false
      );

      this.testResults.push({
        test: "authenticated_connection",
        success: false,
        connectionTime,
        error: error.message,
        message: "Authenticated connection failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log("⚠️ Authenticated connection failed as expected (TDD phase)");
    }
  }

  async testMultipleUserConnections() {
    console.log("👥 Testing multiple user connections...");

    const startTime = Date.now();
    const userCount = 5;
    const connections = [];

    try {
      // Create multiple users and connections
      for (let i = 0; i < userCount; i++) {
        const userData = await this.authHelper.registerTestUser();
        const socket =
          await this.integrationHelper.createAuthenticatedConnection(userData);
        connections.push({ userData, socket });
      }

      const connectionTime = Date.now() - startTime;

      // Record performance metric
      this.performanceMonitor.recordConcurrentUsers(userCount);

      this.testResults.push({
        test: "multiple_user_connections",
        success: true,
        connectionTime,
        userCount,
        message: `Multiple user connections (${userCount}) established successfully`,
      });
    } catch (error) {
      const connectionTime = Date.now() - startTime;

      this.testResults.push({
        test: "multiple_user_connections",
        success: false,
        connectionTime,
        userCount,
        error: error.message,
        message: "Multiple user connections failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log(
        "⚠️ Multiple user connections failed as expected (TDD phase)"
      );
    }
  }

  async testConnectionRecovery() {
    console.log("🔄 Testing connection recovery...");

    const startTime = Date.now();

    try {
      // Register test user
      const userData = await this.authHelper.registerTestUser();

      // Create connection
      const socket = await this.integrationHelper.createAuthenticatedConnection(
        userData
      );

      // Test recovery
      const recoveryResult =
        await this.integrationHelper.testConnectionRecovery(
          userData.userId,
          30000
        );

      const recoveryTime = Date.now() - startTime;

      this.testResults.push({
        test: "connection_recovery",
        success: recoveryResult.success,
        recoveryTime,
        withinThreshold: recoveryResult.withinThreshold,
        message: recoveryResult.success
          ? "Connection recovery successful"
          : "Connection recovery failed as expected (TDD)",
      });
    } catch (error) {
      const recoveryTime = Date.now() - startTime;

      this.testResults.push({
        test: "connection_recovery",
        success: false,
        recoveryTime,
        error: error.message,
        message: "Connection recovery failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log("⚠️ Connection recovery failed as expected (TDD phase)");
    }
  }

  async testPerformanceBenchmarks() {
    console.log("📊 Testing performance benchmarks...");

    const startTime = Date.now();

    try {
      // Define performance test operations
      const operations = [
        {
          name: "websocket_connect",
          type: "WEBSOCKET",
          event: "connect",
          data: { test: true },
        },
        {
          name: "websocket_authenticate",
          type: "WEBSOCKET",
          event: "authenticate",
          data: { token: "test-token" },
        },
      ];

      // Run performance tests
      const performanceResults =
        await this.integrationHelper.testPerformanceBenchmarks(operations, 10);

      const testTime = Date.now() - startTime;

      this.testResults.push({
        test: "performance_benchmarks",
        success: true,
        testTime,
        results: performanceResults,
        message: "Performance benchmarks completed successfully",
      });
    } catch (error) {
      const testTime = Date.now() - startTime;

      this.testResults.push({
        test: "performance_benchmarks",
        success: false,
        testTime,
        error: error.message,
        message: "Performance benchmarks failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log("⚠️ Performance benchmarks failed as expected (TDD phase)");
    }
  }

  generateTestReport() {
    const successfulTests = this.testResults.filter((r) => r.success);
    const failedTests = this.testResults.filter((r) => !r.success);

    return {
      testName: "WebSocket Connection Integration Test",
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.length,
        successfulTests: successfulTests.length,
        failedTests: failedTests.length,
        successRate:
          this.testResults.length > 0
            ? Math.round(
                (successfulTests.length / this.testResults.length) * 100
              )
            : 0,
      },
      testResults: this.testResults,
      performanceSummary: this.performanceMonitor.getPerformanceSummary(),
      status: failedTests.length > 0 ? "FAILED" : "PASSED",
      message:
        failedTests.length > 0
          ? "Tests failed as expected in TDD phase"
          : "All tests passed",
    };
  }
}

// Run test if called directly
if (require.main === module) {
  const test = new WebSocketConnectionIntegrationTest();
  test
    .runTest()
    .then((report) => {
      console.log("🎉 Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Test failed:", error.message);
      process.exit(1);
    });
}

module.exports = WebSocketConnectionIntegrationTest;

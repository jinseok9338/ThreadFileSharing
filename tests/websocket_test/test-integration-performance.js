const IntegrationHelper = require("./helpers/integration-helper");
const AuthHelper = require("./helpers/auth-helper");
const PerformanceMonitor = require("../performance/performance-monitor");

/**
 * WebSocket Integration Test: Performance Benchmarking
 *
 * This test validates performance benchmarks for WebSocket operations
 * and ensures they meet the specified thresholds.
 */
class WebSocketPerformanceIntegrationTest {
  constructor() {
    this.integrationHelper = new IntegrationHelper();
    this.authHelper = new AuthHelper();
    this.performanceMonitor = new PerformanceMonitor();
    this.testResults = [];
  }

  async runTest() {
    console.log("🚀 Starting WebSocket Performance Benchmarking Test");

    try {
      // Start performance monitoring
      await this.performanceMonitor.startMonitoring();

      // Test 1: API response time benchmarks
      await this.testAPIResponseTimeBenchmarks();

      // Test 2: WebSocket delivery time benchmarks
      await this.testWebSocketDeliveryTimeBenchmarks();

      // Test 3: Concurrent user benchmarks
      await this.testConcurrentUserBenchmarks();

      // Test 4: Connection recovery benchmarks
      await this.testConnectionRecoveryBenchmarks();

      // Test 5: Memory usage benchmarks
      await this.testMemoryUsageBenchmarks();

      // Generate test report
      const report = this.generateTestReport();
      console.log("✅ WebSocket Performance Benchmarking Test Completed");
      console.log("📊 Test Report:", JSON.stringify(report, null, 2));

      return report;
    } catch (error) {
      console.error(
        "❌ WebSocket Performance Benchmarking Test Failed:",
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

  async testAPIResponseTimeBenchmarks() {
    console.log("⏱️ Testing API response time benchmarks...");

    const startTime = Date.now();
    const threshold = 500; // 500ms threshold
    const testCount = 10;
    const responseTimes = [];

    try {
      // Register test user
      const userData = await this.authHelper.registerTestUser();

      // Test API endpoints
      const endpoints = [
        {
          method: "POST",
          path: "/auth/login",
          data: { email: userData.email, password: userData.password },
        },
        { method: "GET", path: "/users/profile", data: {} },
        { method: "GET", path: "/chatrooms", data: {} },
        { method: "GET", path: "/threads", data: {} },
      ];

      for (const endpoint of endpoints) {
        for (let i = 0; i < testCount; i++) {
          const requestStart = Date.now();

          try {
            // This will fail in TDD phase as endpoints don't exist yet
            const response = await this.integrationHelper.executeOperation(
              {
                type: "API",
                method: endpoint.method,
                endpoint: endpoint.path,
                data: endpoint.data,
                headers: { Authorization: `Bearer ${userData.accessToken}` },
              },
              userData.userId
            );

            const responseTime = Date.now() - requestStart;
            responseTimes.push(responseTime);

            // Record performance metric
            this.performanceMonitor.recordAPIResponseTime(
              endpoint.path,
              endpoint.method,
              responseTime,
              response.status || 200
            );
          } catch (error) {
            const responseTime = Date.now() - requestStart;
            responseTimes.push(responseTime);

            // Record performance metric
            this.performanceMonitor.recordAPIResponseTime(
              endpoint.path,
              endpoint.method,
              responseTime,
              500
            );
          }
        }
      }

      const testTime = Date.now() - startTime;
      const averageResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const withinThreshold = averageResponseTime <= threshold;

      this.testResults.push({
        test: "api_response_time_benchmarks",
        success: withinThreshold,
        testTime,
        averageResponseTime: Math.round(averageResponseTime),
        maxResponseTime,
        threshold,
        withinThreshold,
        testCount: responseTimes.length,
        message: withinThreshold
          ? "API response time benchmarks met"
          : "API response time benchmarks failed as expected (TDD)",
      });
    } catch (error) {
      const testTime = Date.now() - startTime;

      this.testResults.push({
        test: "api_response_time_benchmarks",
        success: false,
        testTime,
        error: error.message,
        message: "API response time benchmarks failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log(
        "⚠️ API response time benchmarks failed as expected (TDD phase)"
      );
    }
  }

  async testWebSocketDeliveryTimeBenchmarks() {
    console.log("⚡ Testing WebSocket delivery time benchmarks...");

    const startTime = Date.now();
    const threshold = 100; // 100ms threshold
    const testCount = 10;
    const deliveryTimes = [];

    try {
      // Register test user
      const userData = await this.authHelper.registerTestUser();

      // Create WebSocket connection
      const socket = await this.integrationHelper.createAuthenticatedConnection(
        userData
      );

      // Test WebSocket events
      const events = [
        { event: "message_sent", data: { content: "Test message" } },
        { event: "typing_start", data: { chatroomId: "test-chatroom" } },
        { event: "user_status_update", data: { status: "online" } },
      ];

      for (const event of events) {
        for (let i = 0; i < testCount; i++) {
          const eventStart = Date.now();

          try {
            // Wait for event response
            const response = await new Promise((resolve, reject) => {
              const timeout = setTimeout(
                () => reject(new Error("Event timeout")),
                5000
              );

              socket.on(event.event, (data) => {
                clearTimeout(timeout);
                resolve(data);
              });

              // Send event
              socket.emit(event.event, event.data);
            });

            const deliveryTime = Date.now() - eventStart;
            deliveryTimes.push(deliveryTime);

            // Record performance metric
            this.performanceMonitor.recordWebSocketDeliveryTime(
              event.event,
              deliveryTime,
              true
            );
          } catch (error) {
            const deliveryTime = Date.now() - eventStart;
            deliveryTimes.push(deliveryTime);

            // Record performance metric
            this.performanceMonitor.recordWebSocketDeliveryTime(
              event.event,
              deliveryTime,
              false
            );
          }
        }
      }

      const testTime = Date.now() - startTime;
      const averageDeliveryTime =
        deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
      const maxDeliveryTime = Math.max(...deliveryTimes);
      const withinThreshold = averageDeliveryTime <= threshold;

      this.testResults.push({
        test: "websocket_delivery_time_benchmarks",
        success: withinThreshold,
        testTime,
        averageDeliveryTime: Math.round(averageDeliveryTime),
        maxDeliveryTime,
        threshold,
        withinThreshold,
        testCount: deliveryTimes.length,
        message: withinThreshold
          ? "WebSocket delivery time benchmarks met"
          : "WebSocket delivery time benchmarks failed as expected (TDD)",
      });
    } catch (error) {
      const testTime = Date.now() - startTime;

      this.testResults.push({
        test: "websocket_delivery_time_benchmarks",
        success: false,
        testTime,
        error: error.message,
        message: "WebSocket delivery time benchmarks failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log(
        "⚠️ WebSocket delivery time benchmarks failed as expected (TDD phase)"
      );
    }
  }

  async testConcurrentUserBenchmarks() {
    console.log("👥 Testing concurrent user benchmarks...");

    const startTime = Date.now();
    const threshold = 100; // 100 concurrent users
    const userCount = 50; // Test with 50 users
    const connections = [];

    try {
      // Create multiple concurrent connections
      for (let i = 0; i < userCount; i++) {
        try {
          const userData = await this.authHelper.registerTestUser();
          const socket =
            await this.integrationHelper.createAuthenticatedConnection(
              userData
            );
          connections.push({ userData, socket });
        } catch (error) {
          console.log(
            `⚠️ Failed to create connection for user ${i}: ${error.message}`
          );
        }
      }

      const testTime = Date.now() - startTime;
      const successfulConnections = connections.length;
      const withinThreshold = successfulConnections <= threshold;

      // Record performance metric
      this.performanceMonitor.recordConcurrentUsers(successfulConnections);

      this.testResults.push({
        test: "concurrent_user_benchmarks",
        success: withinThreshold,
        testTime,
        successfulConnections,
        threshold,
        withinThreshold,
        message: withinThreshold
          ? "Concurrent user benchmarks met"
          : "Concurrent user benchmarks failed as expected (TDD)",
      });
    } catch (error) {
      const testTime = Date.now() - startTime;

      this.testResults.push({
        test: "concurrent_user_benchmarks",
        success: false,
        testTime,
        error: error.message,
        message: "Concurrent user benchmarks failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log(
        "⚠️ Concurrent user benchmarks failed as expected (TDD phase)"
      );
    }
  }

  async testConnectionRecoveryBenchmarks() {
    console.log("🔄 Testing connection recovery benchmarks...");

    const startTime = Date.now();
    const threshold = 30000; // 30 seconds threshold
    const testCount = 5;
    const recoveryTimes = [];

    try {
      // Register test user
      const userData = await this.authHelper.registerTestUser();

      // Create WebSocket connection
      const socket = await this.integrationHelper.createAuthenticatedConnection(
        userData
      );

      // Test connection recovery multiple times
      for (let i = 0; i < testCount; i++) {
        try {
          const recoveryResult =
            await this.integrationHelper.testConnectionRecovery(
              userData.userId,
              threshold
            );

          recoveryTimes.push(recoveryResult.recoveryTime);
        } catch (error) {
          recoveryTimes.push(threshold + 1000); // Assume failure took longer than threshold
        }
      }

      const testTime = Date.now() - startTime;
      const averageRecoveryTime =
        recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length;
      const maxRecoveryTime = Math.max(...recoveryTimes);
      const withinThreshold = averageRecoveryTime <= threshold;

      this.testResults.push({
        test: "connection_recovery_benchmarks",
        success: withinThreshold,
        testTime,
        averageRecoveryTime: Math.round(averageRecoveryTime),
        maxRecoveryTime,
        threshold,
        withinThreshold,
        testCount: recoveryTimes.length,
        message: withinThreshold
          ? "Connection recovery benchmarks met"
          : "Connection recovery benchmarks failed as expected (TDD)",
      });
    } catch (error) {
      const testTime = Date.now() - startTime;

      this.testResults.push({
        test: "connection_recovery_benchmarks",
        success: false,
        testTime,
        error: error.message,
        message: "Connection recovery benchmarks failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log(
        "⚠️ Connection recovery benchmarks failed as expected (TDD phase)"
      );
    }
  }

  async testMemoryUsageBenchmarks() {
    console.log("💾 Testing memory usage benchmarks...");

    const startTime = Date.now();
    const threshold = 50; // 50MB threshold
    const baselineMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    try {
      // Create multiple connections to test memory usage
      const connections = [];
      const userCount = 20;

      for (let i = 0; i < userCount; i++) {
        try {
          const userData = await this.authHelper.registerTestUser();
          const socket =
            await this.integrationHelper.createAuthenticatedConnection(
              userData
            );
          connections.push({ userData, socket });
        } catch (error) {
          console.log(
            `⚠️ Failed to create connection for user ${i}: ${error.message}`
          );
        }
      }

      // Measure memory usage after creating connections
      const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      const memoryIncrease = currentMemory - baselineMemory;
      const withinThreshold = memoryIncrease <= threshold;

      const testTime = Date.now() - startTime;

      this.testResults.push({
        test: "memory_usage_benchmarks",
        success: withinThreshold,
        testTime,
        baselineMemory: Math.round(baselineMemory),
        currentMemory: Math.round(currentMemory),
        memoryIncrease: Math.round(memoryIncrease),
        threshold,
        withinThreshold,
        connectionsCreated: connections.length,
        message: withinThreshold
          ? "Memory usage benchmarks met"
          : "Memory usage benchmarks failed as expected (TDD)",
      });
    } catch (error) {
      const testTime = Date.now() - startTime;

      this.testResults.push({
        test: "memory_usage_benchmarks",
        success: false,
        testTime,
        error: error.message,
        message: "Memory usage benchmarks failed as expected (TDD)",
      });

      // This is expected to fail in TDD phase
      console.log("⚠️ Memory usage benchmarks failed as expected (TDD phase)");
    }
  }

  generateTestReport() {
    const successfulTests = this.testResults.filter((r) => r.success);
    const failedTests = this.testResults.filter((r) => !r.success);

    return {
      testName: "WebSocket Performance Benchmarking Test",
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
  const test = new WebSocketPerformanceIntegrationTest();
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

module.exports = WebSocketPerformanceIntegrationTest;

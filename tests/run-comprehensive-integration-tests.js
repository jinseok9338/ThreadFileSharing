#!/usr/bin/env node

/**
 * Comprehensive WebSocket and API Integration Test Runner
 *
 * This script executes the complete integration test suite for WebSocket and API functionality
 */

const IntegrationTestSuite = require("./suites/IntegrationTestSuite");
const TestDataGenerator = require("./generators/TestDataGenerator");
const IntegrationTestReporter = require("./reports/integration-test-reporter");
const PerformanceMonitor = require("./performance/performance-monitor");

class ComprehensiveIntegrationTestRunner {
  constructor() {
    this.testSuite = new IntegrationTestSuite();
    this.dataGenerator = new TestDataGenerator();
    this.reporter = new IntegrationTestReporter();
    this.performanceMonitor = new PerformanceMonitor();
    this.startTime = null;
    this.endTime = null;
  }

  async run() {
    console.log(
      "🚀 Starting Comprehensive WebSocket and API Integration Test Suite"
    );
    console.log("=".repeat(80));

    try {
      this.startTime = Date.now();

      // Initialize all services
      await this.initializeServices();

      // Generate test data
      await this.generateTestData();

      // Start performance monitoring
      await this.startPerformanceMonitoring();

      // Run comprehensive test suite
      const results = await this.runTestSuite();

      // Generate comprehensive report
      const report = await this.generateComprehensiveReport(results);

      // Export results
      await this.exportResults(report);

      this.endTime = Date.now();
      const totalDuration = this.endTime - this.startTime;

      console.log("=".repeat(80));
      console.log(
        "✅ Comprehensive Integration Test Suite Completed Successfully!"
      );
      console.log(`⏱️  Total Duration: ${Math.round(totalDuration / 1000)}s`);
      console.log(
        `📊 Success Rate: ${report.summary.overall.successRate.toFixed(2)}%`
      );
      console.log(
        `🎯 Performance: ${(
          report.summary.performance?.violationRate || 0
        ).toFixed(2)}% violations`
      );
      console.log("=".repeat(80));

      return { success: true, report, totalDuration };
    } catch (error) {
      console.error("❌ Comprehensive Integration Test Suite Failed!");
      console.error("Error:", error.message);
      console.error("Stack:", error.stack);

      this.endTime = Date.now();
      const totalDuration = this.endTime - this.startTime;

      return { success: false, error: error.message, totalDuration };
    } finally {
      // Cleanup
      await this.cleanup();
    }
  }

  async initializeServices() {
    console.log("🔧 Initializing services...");

    try {
      await Promise.all([
        this.testSuite.initialize(),
        this.dataGenerator.initialize(),
        this.reporter.initialize(),
        this.performanceMonitor.initialize(),
      ]);

      console.log("✅ All services initialized successfully");
    } catch (error) {
      console.error("❌ Service initialization failed:", error.message);
      throw error;
    }
  }

  async generateTestData() {
    console.log("📊 Generating test data...");

    try {
      const { dataset } = await this.dataGenerator.generateComprehensiveDataset(
        {
          userCount: 20,
          scenarioCount: 10,
          messageCount: 50,
          fileCount: 15,
          performanceOptions: {
            concurrentUsers: 100,
            testDuration: 30000,
          },
          errorOptions: {
            errorInjection: {
              enabled: true,
              rate: 0.05,
            },
          },
        }
      );

      console.log("✅ Test data generated successfully");
      console.log(`   - Users: ${dataset.users.users.length}`);
      console.log(`   - Scenarios: ${dataset.scenarios.scenarios.length}`);
      console.log(`   - Messages: ${dataset.messages.messages.length}`);
      console.log(`   - Files: ${dataset.files.files.length}`);
    } catch (error) {
      console.error("❌ Test data generation failed:", error.message);
      throw error;
    }
  }

  async startPerformanceMonitoring() {
    console.log("📈 Starting performance monitoring...");

    try {
      await this.performanceMonitor.startMonitoring();
      console.log("✅ Performance monitoring started");
    } catch (error) {
      console.error("❌ Performance monitoring failed:", error.message);
      throw error;
    }
  }

  async runTestSuite() {
    console.log("🧪 Running comprehensive test suite...");

    try {
      const { report } = await this.testSuite.runComprehensiveTestSuite({
        userId: "comprehensive-test-user",
        parameters: {
          concurrentUsers: 50,
          testDuration: 30000,
          performanceThresholds: {
            apiResponseTime: 500,
            websocketDeliveryTime: 100,
            memoryUsage: 50,
          },
        },
      });

      console.log("✅ Test suite execution completed");
      console.log(`   - Total Scenarios: ${report.summary.totalScenarios}`);
      console.log(`   - Successful: ${report.summary.successfulScenarios}`);
      console.log(`   - Failed: ${report.summary.failedScenarios}`);
      console.log(
        `   - Success Rate: ${report.summary.successRate.toFixed(2)}%`
      );

      return report;
    } catch (error) {
      console.error("❌ Test suite execution failed:", error.message);
      throw error;
    }
  }

  async generateComprehensiveReport(results) {
    console.log("📋 Generating comprehensive report...");

    try {
      const performanceSummary =
        this.performanceMonitor.getPerformanceSummary();

      const report = {
        metadata: {
          generatedAt: new Date().toISOString(),
          testSuite: "WebSocket and API Integration Testing",
          version: "1.0.0",
          duration: this.endTime - this.startTime,
        },
        summary: {
          overall: {
            totalTests: results.summary.totalScenarios,
            successfulTests: results.summary.successfulScenarios,
            failedTests: results.summary.failedScenarios,
            successRate: results.summary.successRate,
            totalDuration: results.summary.totalDuration || 0,
          },
          performance: {
            totalMetrics: performanceSummary.summary.totalMetrics,
            thresholdViolations: performanceSummary.summary.thresholdViolations,
            violationRate: performanceSummary.summary.violationRate,
            overallSuccessRate: performanceSummary.summary.overallSuccessRate,
          },
          scenarios: results.scenarios || {},
          recommendations: results.recommendations || [],
        },
        detailedResults: results,
        performanceData: performanceSummary,
        timestamp: new Date().toISOString(),
      };

      console.log("✅ Comprehensive report generated");
      return report;
    } catch (error) {
      console.error("❌ Report generation failed:", error.message);
      throw error;
    }
  }

  async exportResults(report) {
    console.log("💾 Exporting results...");

    try {
      // Export to JSON
      const jsonFile = await this.reporter.exportReport(
        `tests/reports/integration-test-report-${Date.now()}.json`
      );
      console.log(`✅ Results exported to: ${jsonFile}`);

      // Export performance metrics
      const performanceFile = await this.performanceMonitor.exportMetrics();
      console.log(`✅ Performance metrics exported to: ${performanceFile}`);
    } catch (error) {
      console.error("❌ Results export failed:", error.message);
      throw error;
    }
  }

  async cleanup() {
    console.log("🧹 Cleaning up...");

    try {
      // Stop performance monitoring
      this.performanceMonitor.stopMonitoring();

      // Clear generated data
      this.dataGenerator.clearGeneratedData();

      // Clear reporter data
      this.reporter.clearData();

      console.log("✅ Cleanup completed");
    } catch (error) {
      console.error("⚠️ Cleanup warning:", error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new ComprehensiveIntegrationTestRunner();

  runner
    .run()
    .then((result) => {
      if (result.success) {
        console.log("🎉 All tests completed successfully!");
        process.exit(0);
      } else {
        console.error("💥 Tests failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("💥 Unexpected error:", error.message);
      process.exit(1);
    });
}

module.exports = ComprehensiveIntegrationTestRunner;

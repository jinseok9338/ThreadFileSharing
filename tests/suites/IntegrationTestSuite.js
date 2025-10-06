const { EventEmitter } = require("events");
const TestScenarioService = require("../services/TestScenarioService");
const TestExecutionService = require("../services/TestExecutionService");
const PerformanceMetricsService = require("../services/PerformanceMetricsService");
const IntegrationEventService = require("../services/IntegrationEventService");
const TestCleanup = require("../utils/TestCleanup");
const TestValidation = require("../utils/TestValidation");

/**
 * Comprehensive Test Suite Orchestrator
 *
 * Orchestrates the execution of comprehensive integration tests
 */
class IntegrationTestSuite extends EventEmitter {
  constructor() {
    super();
    this.scenarioService = new TestScenarioService();
    this.executionService = new TestExecutionService();
    this.metricsService = new PerformanceMetricsService();
    this.eventService = new IntegrationEventService();
    this.cleanup = new TestCleanup();
    this.validation = new TestValidation();
    this.isRunning = false;
    this.currentTestId = null;
  }

  /**
   * Initialize test suite
   */
  async initialize() {
    try {
      await Promise.all([
        this.scenarioService.initialize(),
        this.executionService.initialize(),
        this.metricsService.initialize(),
        this.eventService.initialize(),
        this.cleanup.initialize(),
        this.validation.initialize(),
      ]);

      this.emit("initialized", { service: "IntegrationTestSuite" });
      return { success: true };
    } catch (error) {
      this.emit("error", { error: error.message });
      throw error;
    }
  }

  /**
   * Run comprehensive test suite
   */
  async runComprehensiveTestSuite(options = {}) {
    if (this.isRunning) {
      throw new Error("Test suite is already running");
    }

    this.isRunning = true;
    this.currentTestId = `comprehensive_test_${Date.now()}`;

    try {
      this.emit("testSuiteStarted", { testId: this.currentTestId });

      // Setup test isolation
      await this.setupTestIsolation();

      // Run all test scenarios
      const results = await this.runAllScenarios(options);

      // Generate comprehensive report
      const report = await this.generateComprehensiveReport(results);

      // Cleanup
      await this.cleanupTestSuite();

      this.emit("testSuiteCompleted", { testId: this.currentTestId, report });

      return { success: true, report };
    } catch (error) {
      this.emit("error", { error: error.message, testId: this.currentTestId });
      throw error;
    } finally {
      this.isRunning = false;
      this.currentTestId = null;
    }
  }

  /**
   * Setup test isolation
   */
  async setupTestIsolation() {
    try {
      await this.cleanup.setupTestIsolation(this.currentTestId, {
        database: true,
        cache: true,
        filesystem: true,
        network: true,
      });

      this.emit("testIsolationSetup", { testId: this.currentTestId });
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "setupTestIsolation",
      });
      throw error;
    }
  }

  /**
   * Run all test scenarios
   */
  async runAllScenarios(options = {}) {
    try {
      const { scenarios } = await this.scenarioService.listScenarios({
        isActive: true,
      });
      const results = [];

      this.emit("scenariosStarted", {
        testId: this.currentTestId,
        scenarioCount: scenarios.length,
      });

      for (const scenario of scenarios) {
        try {
          const result = await this.runScenario(scenario.id, options);
          results.push(result);
        } catch (error) {
          results.push({
            scenarioId: scenario.id,
            success: false,
            error: error.message,
          });
        }
      }

      this.emit("scenariosCompleted", { testId: this.currentTestId, results });

      return results;
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "runAllScenarios",
      });
      throw error;
    }
  }

  /**
   * Run individual scenario
   */
  async runScenario(scenarioId, options = {}) {
    try {
      this.emit("scenarioStarted", { testId: this.currentTestId, scenarioId });

      // Execute scenario
      const { testResult } = await this.executionService.executeScenario(
        scenarioId,
        options.userId || "test-user",
        options.parameters || {}
      );

      // Validate results
      const validationResults = await this.validateScenarioResults(testResult);

      // Collect metrics
      const metrics = await this.collectScenarioMetrics(testResult);

      const result = {
        scenarioId,
        testId: testResult.id,
        success: testResult.isSuccessful(),
        duration: testResult.duration,
        validationResults,
        metrics,
        testResult: testResult.getSummary(),
      };

      this.emit("scenarioCompleted", {
        testId: this.currentTestId,
        scenarioId,
        result,
      });

      return result;
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "runScenario",
        scenarioId,
      });
      throw error;
    }
  }

  /**
   * Validate scenario results
   */
  async validateScenarioResults(testResult) {
    try {
      const validations = [];

      // Validate API responses
      for (const response of testResult.apiResponses) {
        const validation = this.validation.validateAPIResponse(response, 200);
        validations.push(validation);
      }

      // Validate WebSocket events
      for (const event of testResult.websocketEvents) {
        const validation = this.validation.validateWebSocketEvent(
          event,
          event.event
        );
        validations.push(validation);
      }

      // Validate performance metrics
      const performanceValidation = this.validation.validatePerformanceMetrics(
        testResult.performanceMetrics
      );
      validations.push(performanceValidation);

      return validations;
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "validateScenarioResults",
      });
      throw error;
    }
  }

  /**
   * Collect scenario metrics
   */
  async collectScenarioMetrics(testResult) {
    try {
      const metrics = [];

      // Collect API response metrics
      for (const response of testResult.apiResponses) {
        const metric = await this.metricsService.recordAPIResponseTime(
          testResult.id,
          {
            endpoint: response.endpoint,
            method: response.method,
            statusCode: response.statusCode,
          },
          response.responseTime
        );
        metrics.push(metric.metric);
      }

      // Collect WebSocket delivery metrics
      for (const event of testResult.websocketEvents) {
        const metric = await this.metricsService.recordWebSocketDeliveryTime(
          testResult.id,
          {
            event: event.event,
            room: event.room,
            socketId: event.socketId,
          },
          event.deliveryTime
        );
        metrics.push(metric.metric);
      }

      return metrics;
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "collectScenarioMetrics",
      });
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport(results) {
    try {
      const [performanceSummary, eventStatistics, validationSummary] =
        await Promise.all([
          this.metricsService.getPerformanceSummary(),
          this.eventService.getEventStatistics(),
          this.validation.getValidationSummary(),
        ]);

      const report = {
        testId: this.currentTestId,
        timestamp: new Date().toISOString(),
        summary: {
          totalScenarios: results.length,
          successfulScenarios: results.filter((r) => r.success).length,
          failedScenarios: results.filter((r) => !r.success).length,
          successRate:
            results.length > 0
              ? (results.filter((r) => r.success).length / results.length) * 100
              : 0,
        },
        results,
        performanceSummary: performanceSummary.summary,
        eventStatistics: eventStatistics.statistics,
        validationSummary,
        recommendations: this.generateRecommendations(
          results,
          performanceSummary.summary
        ),
      };

      return report;
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generateComprehensiveReport",
      });
      throw error;
    }
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(results, performanceSummary) {
    const recommendations = [];

    // Check overall success rate
    const successRate =
      results.length > 0
        ? (results.filter((r) => r.success).length / results.length) * 100
        : 0;

    if (successRate < 95) {
      recommendations.push({
        type: "SUCCESS_RATE",
        priority: "HIGH",
        message: "Overall test success rate is below 95%",
        details: `Current success rate: ${successRate.toFixed(2)}%`,
        action: "Review and fix failing test scenarios",
      });
    }

    // Check performance
    if (performanceSummary.overallSuccessRate < 95) {
      recommendations.push({
        type: "PERFORMANCE",
        priority: "HIGH",
        message: "Performance success rate is below 95%",
        details: `Current performance success rate: ${performanceSummary.overallSuccessRate.toFixed(
          2
        )}%`,
        action: "Optimize performance bottlenecks",
      });
    }

    // Check threshold violations
    if (performanceSummary.thresholdViolations > 0) {
      recommendations.push({
        type: "THRESHOLD_VIOLATIONS",
        priority: "MEDIUM",
        message: "Performance threshold violations detected",
        details: `${performanceSummary.thresholdViolations} violations found`,
        action: "Review and adjust performance thresholds",
      });
    }

    return recommendations;
  }

  /**
   * Cleanup test suite
   */
  async cleanupTestSuite() {
    try {
      // Execute cleanup tasks
      await this.cleanup.executeCleanup(this.currentTestId);

      // Teardown test isolation
      await this.cleanup.teardownTestIsolation(this.currentTestId);

      this.emit("testSuiteCleanup", { testId: this.currentTestId });
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "cleanupTestSuite",
      });
      throw error;
    }
  }

  /**
   * Get test suite status
   */
  getTestSuiteStatus() {
    return {
      isRunning: this.isRunning,
      currentTestId: this.currentTestId,
      services: {
        scenarioService: !!this.scenarioService,
        executionService: !!this.executionService,
        metricsService: !!this.metricsService,
        eventService: !!this.eventService,
        cleanup: !!this.cleanup,
        validation: !!this.validation,
      },
    };
  }

  /**
   * Stop test suite
   */
  async stopTestSuite() {
    if (!this.isRunning) {
      return { success: true, message: "Test suite is not running" };
    }

    try {
      // Cancel current execution
      if (this.currentTestId) {
        await this.executionService.cancelExecution(
          this.currentTestId,
          "Test suite stopped"
        );
      }

      // Cleanup
      await this.cleanupTestSuite();

      this.isRunning = false;
      this.currentTestId = null;

      this.emit("testSuiteStopped");

      return { success: true };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "stopTestSuite" });
      throw error;
    }
  }
}

module.exports = IntegrationTestSuite;

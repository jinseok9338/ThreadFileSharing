const fs = require("fs").promises;
const path = require("path");
const { EventEmitter } = require("events");

class IntegrationTestReporter extends EventEmitter {
  /**
   * Initialize reporter
   */
  async initialize() {
    try {
      this.emit("initialized", { service: "IntegrationTestReporter" });
      return { success: true };
    } catch (error) {
      this.emit("error", { error: error.message });
      throw error;
    }
  }
  constructor(options = {}) {
    super();
    this.options = {
      outputDir: options.outputDir || "tests/reports",
      format: options.format || "json",
      includePerformance: options.includePerformance !== false,
      includeCoverage: options.includeCoverage !== false,
      includeErrors: options.includeErrors !== false,
      includeLogs: options.includeLogs !== false,
      ...options,
    };

    this.testResults = new Map();
    this.performanceMetrics = new Map();
    this.errorDetails = new Map();
    this.testLogs = new Map();
    this.coverageData = new Map();
  }

  /**
   * Record test result
   */
  recordTestResult(testId, result) {
    this.testResults.set(testId, {
      ...result,
      timestamp: new Date().toISOString(),
      recordedAt: Date.now(),
    });

    this.emit("testResultRecorded", { testId, result });
  }

  /**
   * Record performance metric
   */
  recordPerformanceMetric(metricId, metric) {
    this.performanceMetrics.set(metricId, {
      ...metric,
      timestamp: new Date().toISOString(),
      recordedAt: Date.now(),
    });

    this.emit("performanceMetricRecorded", { metricId, metric });
  }

  /**
   * Record error detail
   */
  recordErrorDetail(errorId, error) {
    this.errorDetails.set(errorId, {
      ...error,
      timestamp: new Date().toISOString(),
      recordedAt: Date.now(),
    });

    this.emit("errorDetailRecorded", { errorId, error });
  }

  /**
   * Record test log
   */
  recordTestLog(logId, log) {
    this.testLogs.set(logId, {
      ...log,
      timestamp: new Date().toISOString(),
      recordedAt: Date.now(),
    });

    this.emit("testLogRecorded", { logId, log });
  }

  /**
   * Record coverage data
   */
  recordCoverageData(coverageId, coverage) {
    this.coverageData.set(coverageId, {
      ...coverage,
      timestamp: new Date().toISOString(),
      recordedAt: Date.now(),
    });

    this.emit("coverageDataRecorded", { coverageId, coverage });
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportVersion: "1.0.0",
        testFramework: "WebSocket and API Integration Testing",
        totalTests: this.testResults.size,
        totalMetrics: this.performanceMetrics.size,
        totalErrors: this.errorDetails.size,
        totalLogs: this.testLogs.size,
        totalCoverage: this.coverageData.size,
      },
      summary: this.generateSummary(),
      testResults: this.generateTestResultsSummary(),
      performanceMetrics: this.generatePerformanceSummary(),
      errorAnalysis: this.generateErrorAnalysis(),
      coverageAnalysis: this.generateCoverageAnalysis(),
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  /**
   * Generate test summary
   */
  generateSummary() {
    const testResults = Array.from(this.testResults.values());
    const successfulTests = testResults.filter((r) => r.success);
    const failedTests = testResults.filter((r) => !r.success);

    const performanceMetrics = Array.from(this.performanceMetrics.values());
    const thresholdViolations = performanceMetrics.filter(
      (m) => !m.withinThreshold
    );

    const errors = Array.from(this.errorDetails.values());
    const criticalErrors = errors.filter((e) => e.severity === "CRITICAL");
    const warningErrors = errors.filter((e) => e.severity === "WARNING");

    return {
      overall: {
        successRate:
          testResults.length > 0
            ? Math.round((successfulTests.length / testResults.length) * 100)
            : 0,
        totalTests: testResults.length,
        successfulTests: successfulTests.length,
        failedTests: failedTests.length,
        skippedTests: testResults.filter((r) => r.status === "SKIPPED").length,
      },
      performance: {
        totalMetrics: performanceMetrics.length,
        thresholdViolations: thresholdViolations.length,
        violationRate:
          performanceMetrics.length > 0
            ? Math.round(
                (thresholdViolations.length / performanceMetrics.length) * 100
              )
            : 0,
      },
      errors: {
        totalErrors: errors.length,
        criticalErrors: criticalErrors.length,
        warningErrors: warningErrors.length,
        errorRate:
          testResults.length > 0
            ? Math.round((errors.length / testResults.length) * 100)
            : 0,
      },
      coverage: {
        totalCoverage: this.coverageData.size,
        coverageRate: this.calculateCoverageRate(),
      },
    };
  }

  /**
   * Generate test results summary
   */
  generateTestResultsSummary() {
    const testResults = Array.from(this.testResults.values());

    const byCategory = {};
    const byPriority = {};
    const byType = {};
    const byStatus = {};

    testResults.forEach((result) => {
      // Group by category
      const category = result.category || "unknown";
      if (!byCategory[category])
        byCategory[category] = { total: 0, successful: 0, failed: 0 };
      byCategory[category].total++;
      if (result.success) byCategory[category].successful++;
      else byCategory[category].failed++;

      // Group by priority
      const priority = result.priority || "unknown";
      if (!byPriority[priority])
        byPriority[priority] = { total: 0, successful: 0, failed: 0 };
      byPriority[priority].total++;
      if (result.success) byPriority[priority].successful++;
      else byPriority[priority].failed++;

      // Group by type
      const type = result.type || "unknown";
      if (!byType[type]) byType[type] = { total: 0, successful: 0, failed: 0 };
      byType[type].total++;
      if (result.success) byType[type].successful++;
      else byType[type].failed++;

      // Group by status
      const status = result.status || "unknown";
      if (!byStatus[status])
        byStatus[status] = { total: 0, successful: 0, failed: 0 };
      byStatus[status].total++;
      if (result.success) byStatus[status].successful++;
      else byStatus[status].failed++;
    });

    return {
      byCategory,
      byPriority,
      byType,
      byStatus,
      executionTime: {
        total: testResults.reduce((sum, r) => sum + (r.duration || 0), 0),
        average:
          testResults.length > 0
            ? Math.round(
                testResults.reduce((sum, r) => sum + (r.duration || 0), 0) /
                  testResults.length
              )
            : 0,
        min:
          testResults.length > 0
            ? Math.min(...testResults.map((r) => r.duration || 0))
            : 0,
        max:
          testResults.length > 0
            ? Math.max(...testResults.map((r) => r.duration || 0))
            : 0,
      },
    };
  }

  /**
   * Generate performance summary
   */
  generatePerformanceSummary() {
    const metrics = Array.from(this.performanceMetrics.values());

    const byType = {};
    const thresholdViolations = [];

    metrics.forEach((metric) => {
      const type = metric.type || "unknown";
      if (!byType[type]) {
        byType[type] = {
          total: 0,
          withinThreshold: 0,
          violations: 0,
          values: [],
        };
      }

      byType[type].total++;
      byType[type].values.push(metric.value || 0);

      if (metric.withinThreshold) {
        byType[type].withinThreshold++;
      } else {
        byType[type].violations++;
        thresholdViolations.push({
          type: metric.type,
          value: metric.value,
          threshold: metric.threshold,
          unit: metric.unit,
          timestamp: metric.timestamp,
        });
      }
    });

    // Calculate statistics for each type
    Object.keys(byType).forEach((type) => {
      const values = byType[type].values.sort((a, b) => a - b);
      if (values.length > 0) {
        byType[type].statistics = {
          average: Math.round(
            values.reduce((a, b) => a + b, 0) / values.length
          ),
          min: values[0],
          max: values[values.length - 1],
          p95: values[Math.floor(values.length * 0.95)],
          p99: values[Math.floor(values.length * 0.99)],
        };
        byType[type].successRate = Math.round(
          (byType[type].withinThreshold / byType[type].total) * 100
        );
      }
    });

    return {
      byType,
      thresholdViolations,
      overall: {
        totalMetrics: metrics.length,
        totalViolations: thresholdViolations.length,
        violationRate:
          metrics.length > 0
            ? Math.round((thresholdViolations.length / metrics.length) * 100)
            : 0,
      },
    };
  }

  /**
   * Generate error analysis
   */
  generateErrorAnalysis() {
    const errors = Array.from(this.errorDetails.values());

    const byType = {};
    const bySeverity = {};
    const byTest = {};

    errors.forEach((error) => {
      // Group by error type
      const type = error.type || "unknown";
      if (!byType[type])
        byType[type] = { total: 0, critical: 0, warning: 0, info: 0 };
      byType[type].total++;
      if (error.severity === "CRITICAL") byType[type].critical++;
      else if (error.severity === "WARNING") byType[type].warning++;
      else byType[type].info++;

      // Group by severity
      const severity = error.severity || "unknown";
      if (!bySeverity[severity]) bySeverity[severity] = { total: 0, types: {} };
      bySeverity[severity].total++;
      if (!bySeverity[severity].types[type])
        bySeverity[severity].types[type] = 0;
      bySeverity[severity].types[type]++;

      // Group by test
      const testId = error.testId || "unknown";
      if (!byTest[testId])
        byTest[testId] = { total: 0, critical: 0, warning: 0, info: 0 };
      byTest[testId].total++;
      if (error.severity === "CRITICAL") byTest[testId].critical++;
      else if (error.severity === "WARNING") byTest[testId].warning++;
      else byTest[testId].info++;
    });

    return {
      byType,
      bySeverity,
      byTest,
      overall: {
        totalErrors: errors.length,
        criticalErrors: errors.filter((e) => e.severity === "CRITICAL").length,
        warningErrors: errors.filter((e) => e.severity === "WARNING").length,
        infoErrors: errors.filter((e) => e.severity === "INFO").length,
      },
    };
  }

  /**
   * Generate coverage analysis
   */
  generateCoverageAnalysis() {
    const coverageData = Array.from(this.coverageData.values());

    const byType = {};
    const overall = {
      totalCoverage: coverageData.length,
      coverageRate: this.calculateCoverageRate(),
    };

    coverageData.forEach((coverage) => {
      const type = coverage.type || "unknown";
      if (!byType[type]) {
        byType[type] = {
          total: 0,
          covered: 0,
          uncovered: 0,
          coverageRate: 0,
        };
      }

      byType[type].total++;
      if (coverage.covered) {
        byType[type].covered++;
      } else {
        byType[type].uncovered++;
      }

      byType[type].coverageRate = Math.round(
        (byType[type].covered / byType[type].total) * 100
      );
    });

    return {
      byType,
      overall,
    };
  }

  /**
   * Calculate overall coverage rate
   */
  calculateCoverageRate() {
    const coverageData = Array.from(this.coverageData.values());
    if (coverageData.length === 0) return 0;

    const covered = coverageData.filter((c) => c.covered).length;
    return Math.round((covered / coverageData.length) * 100);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const summary = this.generateSummary();

    // Performance recommendations
    if (summary.performance.violationRate > 10) {
      recommendations.push({
        type: "PERFORMANCE",
        priority: "HIGH",
        message: "High performance threshold violation rate detected",
        details: `${summary.performance.violationRate}% of performance metrics exceed thresholds`,
        action: "Review and optimize performance bottlenecks",
      });
    }

    // Error recommendations
    if (summary.errors.errorRate > 5) {
      recommendations.push({
        type: "ERROR_HANDLING",
        priority: "HIGH",
        message: "High error rate detected",
        details: `${summary.errors.errorRate}% error rate across all tests`,
        action: "Investigate and fix recurring errors",
      });
    }

    // Coverage recommendations
    if (summary.coverage.coverageRate < 90) {
      recommendations.push({
        type: "COVERAGE",
        priority: "MEDIUM",
        message: "Test coverage below target",
        details: `${summary.coverage.coverageRate}% coverage rate (target: 90%)`,
        action: "Add additional test cases to improve coverage",
      });
    }

    // Success rate recommendations
    if (summary.overall.successRate < 95) {
      recommendations.push({
        type: "TEST_QUALITY",
        priority: "HIGH",
        message: "Test success rate below target",
        details: `${summary.overall.successRate}% success rate (target: 95%)`,
        action: "Review and fix failing tests",
      });
    }

    return recommendations;
  }

  /**
   * Export report to file
   */
  async exportReport(filename = null) {
    const report = this.generateTestReport();
    const exportFile =
      filename || `tests/reports/integration-test-report-${Date.now()}.json`;

    try {
      await fs.mkdir(path.dirname(exportFile), { recursive: true });
      await fs.writeFile(exportFile, JSON.stringify(report, null, 2));

      this.emit("reportExported", { file: exportFile, report });
      return exportFile;
    } catch (error) {
      this.emit("exportError", { error: error.message, file: exportFile });
      throw error;
    }
  }

  /**
   * Clear all data
   */
  clearData() {
    this.testResults.clear();
    this.performanceMetrics.clear();
    this.errorDetails.clear();
    this.testLogs.clear();
    this.coverageData.clear();

    this.emit("dataCleared");
  }
}

module.exports = IntegrationTestReporter;

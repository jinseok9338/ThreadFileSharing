const { v4: uuidv4 } = require("uuid");

/**
 * TestResult Entity Model
 *
 * Captures test execution outcomes, performance metrics, and validation results
 */
class TestResult {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.scenarioId = data.scenarioId || null;
    this.userId = data.userId || null;
    this.status = data.status || "PENDING";
    this.startTime = data.startTime || new Date();
    this.endTime = data.endTime || null;
    this.duration = data.duration || 0;
    this.apiResponses = data.apiResponses || [];
    this.websocketEvents = data.websocketEvents || [];
    this.performanceMetrics = data.performanceMetrics || {};
    this.errorDetails = data.errorDetails || null;
    this.validationResults = data.validationResults || [];
    this.logs = data.logs || [];
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Validate result data
   */
  validate() {
    const errors = [];

    // Status validation
    const validStatuses = [
      "PENDING",
      "RUNNING",
      "PASSED",
      "FAILED",
      "SKIPPED",
      "ERROR",
    ];
    if (!validStatuses.includes(this.status)) {
      errors.push(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // UUID validation
    if (!this.isValidUUID(this.id)) {
      errors.push("Invalid result ID format");
    }

    if (this.scenarioId && !this.isValidUUID(this.scenarioId)) {
      errors.push("Invalid scenario ID format");
    }

    if (this.userId && !this.isValidUUID(this.userId)) {
      errors.push("Invalid user ID format");
    }

    // Time validation
    if (this.startTime && this.endTime && this.startTime > this.endTime) {
      errors.push("Start time must be before end time");
    }

    // Duration validation
    if (this.duration < 0) {
      errors.push("Duration must be non-negative");
    }

    // Status-specific validation
    if (this.status === "PASSED" && this.errorDetails) {
      errors.push("Passed tests should not have error details");
    }

    if (this.status === "FAILED" && !this.errorDetails) {
      errors.push("Failed tests must have error details");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if string is valid UUID
   */
  isValidUUID(uuid) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Update result data
   */
  update(data) {
    const allowedFields = [
      "scenarioId",
      "userId",
      "status",
      "startTime",
      "endTime",
      "duration",
      "apiResponses",
      "websocketEvents",
      "performanceMetrics",
      "errorDetails",
      "validationResults",
      "logs",
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        this[field] = data[field];
      }
    });

    return this.validate();
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      scenarioId: this.scenarioId,
      userId: this.userId,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      apiResponses: this.apiResponses,
      websocketEvents: this.websocketEvents,
      performanceMetrics: this.performanceMetrics,
      errorDetails: this.errorDetails,
      validationResults: this.validationResults,
      logs: this.logs,
      createdAt: this.createdAt,
    };
  }

  /**
   * Start test execution
   */
  start() {
    this.status = "RUNNING";
    this.startTime = new Date();
    this.endTime = null;
    this.duration = 0;
    this.logs.push({
      timestamp: new Date(),
      level: "INFO",
      message: "Test execution started",
    });
    return this;
  }

  /**
   * Complete test execution
   */
  complete(status, duration = null) {
    this.status = status;
    this.endTime = new Date();
    this.duration = duration || this.endTime - this.startTime;

    this.logs.push({
      timestamp: new Date(),
      level: "INFO",
      message: `Test execution completed with status: ${status}`,
    });

    return this;
  }

  /**
   * Mark test as passed
   */
  pass(duration = null) {
    return this.complete("PASSED", duration);
  }

  /**
   * Mark test as failed
   */
  fail(error, duration = null) {
    this.errorDetails = {
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date(),
    };

    this.logs.push({
      timestamp: new Date(),
      level: "ERROR",
      message: `Test failed: ${error.message || error}`,
    });

    return this.complete("FAILED", duration);
  }

  /**
   * Mark test as skipped
   */
  skip(reason = "Test skipped") {
    this.logs.push({
      timestamp: new Date(),
      level: "INFO",
      message: `Test skipped: ${reason}`,
    });

    return this.complete("SKIPPED");
  }

  /**
   * Mark test as error
   */
  error(error, duration = null) {
    this.errorDetails = {
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date(),
    };

    this.logs.push({
      timestamp: new Date(),
      level: "ERROR",
      message: `Test error: ${error.message || error}`,
    });

    return this.complete("ERROR", duration);
  }

  /**
   * Add API response
   */
  addAPIResponse(response) {
    this.apiResponses.push({
      ...response,
      timestamp: new Date(),
    });

    this.logs.push({
      timestamp: new Date(),
      level: "DEBUG",
      message: `API response recorded: ${response.endpoint || "unknown"}`,
    });

    return this;
  }

  /**
   * Add WebSocket event
   */
  addWebSocketEvent(event) {
    this.websocketEvents.push({
      ...event,
      timestamp: new Date(),
    });

    this.logs.push({
      timestamp: new Date(),
      level: "DEBUG",
      message: `WebSocket event recorded: ${event.event || "unknown"}`,
    });

    return this;
  }

  /**
   * Add performance metric
   */
  addPerformanceMetric(metric) {
    if (!this.performanceMetrics[metric.type]) {
      this.performanceMetrics[metric.type] = [];
    }

    this.performanceMetrics[metric.type].push({
      ...metric,
      timestamp: new Date(),
    });

    this.logs.push({
      timestamp: new Date(),
      level: "DEBUG",
      message: `Performance metric recorded: ${metric.type}`,
    });

    return this;
  }

  /**
   * Add validation result
   */
  addValidationResult(validation) {
    this.validationResults.push({
      ...validation,
      timestamp: new Date(),
    });

    this.logs.push({
      timestamp: new Date(),
      level: validation.passed ? "INFO" : "WARN",
      message: `Validation ${validation.passed ? "passed" : "failed"}: ${
        validation.name
      }`,
    });

    return this;
  }

  /**
   * Add log entry
   */
  addLog(level, message, data = null) {
    this.logs.push({
      timestamp: new Date(),
      level,
      message,
      data,
    });

    return this;
  }

  /**
   * Get test summary
   */
  getSummary() {
    return {
      id: this.id,
      scenarioId: this.scenarioId,
      userId: this.userId,
      status: this.status,
      duration: this.duration,
      startTime: this.startTime,
      endTime: this.endTime,
      apiResponsesCount: this.apiResponses.length,
      websocketEventsCount: this.websocketEvents.length,
      validationResultsCount: this.validationResults.length,
      logsCount: this.logs.length,
      hasError: !!this.errorDetails,
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const summary = {};

    Object.keys(this.performanceMetrics).forEach((type) => {
      const metrics = this.performanceMetrics[type];
      if (metrics.length > 0) {
        const values = metrics.map((m) => m.value || 0);
        summary[type] = {
          count: metrics.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
        };
      }
    });

    return summary;
  }

  /**
   * Get validation summary
   */
  getValidationSummary() {
    const passed = this.validationResults.filter((v) => v.passed).length;
    const failed = this.validationResults.filter((v) => !v.passed).length;

    return {
      total: this.validationResults.length,
      passed,
      failed,
      successRate:
        this.validationResults.length > 0
          ? (passed / this.validationResults.length) * 100
          : 0,
    };
  }

  /**
   * Check if test is completed
   */
  isCompleted() {
    return ["PASSED", "FAILED", "SKIPPED", "ERROR"].includes(this.status);
  }

  /**
   * Check if test is successful
   */
  isSuccessful() {
    return this.status === "PASSED";
  }

  /**
   * Check if test has errors
   */
  hasErrors() {
    return ["FAILED", "ERROR"].includes(this.status);
  }

  /**
   * Get error message
   */
  getErrorMessage() {
    return this.errorDetails?.message || null;
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level) {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count = 10) {
    return this.logs.slice(-count);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
    return this;
  }

  /**
   * Clone result
   */
  clone() {
    return new TestResult({
      scenarioId: this.scenarioId,
      userId: this.userId,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      apiResponses: [...this.apiResponses],
      websocketEvents: [...this.websocketEvents],
      performanceMetrics: { ...this.performanceMetrics },
      errorDetails: this.errorDetails ? { ...this.errorDetails } : null,
      validationResults: [...this.validationResults],
      logs: [...this.logs],
    });
  }
}

module.exports = TestResult;

const { EventEmitter } = require("events");

/**
 * Test Validation and Assertion Helpers
 *
 * Provides comprehensive validation and assertion utilities for integration testing
 */
class TestValidation extends EventEmitter {
  constructor() {
    super();
    this.validationResults = new Map();
    this.assertionCount = 0;
    this.failureCount = 0;
  }

  /**
   * Initialize validation service
   */
  async initialize() {
    try {
      this.emit("initialized", { service: "TestValidation" });
      return { success: true };
    } catch (error) {
      this.emit("error", { error: error.message });
      throw error;
    }
  }

  /**
   * Validate API response
   */
  validateAPIResponse(response, expectedStatus = 200, expectedSchema = null) {
    const validationId = `api_response_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      const results = {
        id: validationId,
        type: "API_RESPONSE",
        timestamp: new Date(),
        passed: true,
        errors: [],
        warnings: [],
      };

      // Validate status code
      if (response.status !== expectedStatus) {
        results.passed = false;
        results.errors.push(
          `Expected status ${expectedStatus}, got ${response.status}`
        );
      }

      // Validate response structure
      if (expectedSchema) {
        const schemaValidation = this.validateSchema(
          response.data,
          expectedSchema
        );
        if (!schemaValidation.passed) {
          results.passed = false;
          results.errors.push(...schemaValidation.errors);
        }
        results.warnings.push(...schemaValidation.warnings);
      }

      // Validate response time
      if (response.responseTime > 500) {
        results.warnings.push(
          `Response time ${response.responseTime}ms exceeds 500ms threshold`
        );
      }

      this.validationResults.set(validationId, results);
      this.assertionCount++;

      if (!results.passed) {
        this.failureCount++;
      }

      this.emit("validationCompleted", { validationId, results });

      return results;
    } catch (error) {
      const results = {
        id: validationId,
        type: "API_RESPONSE",
        timestamp: new Date(),
        passed: false,
        errors: [error.message],
        warnings: [],
      };

      this.validationResults.set(validationId, results);
      this.assertionCount++;
      this.failureCount++;

      this.emit("validationFailed", { validationId, error: error.message });

      return results;
    }
  }

  /**
   * Validate WebSocket event
   */
  validateWebSocketEvent(
    event,
    expectedEvent,
    expectedData = null,
    maxDeliveryTime = 100
  ) {
    const validationId = `websocket_event_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      const results = {
        id: validationId,
        type: "WEBSOCKET_EVENT",
        timestamp: new Date(),
        passed: true,
        errors: [],
        warnings: [],
      };

      // Validate event type
      if (event.event !== expectedEvent) {
        results.passed = false;
        results.errors.push(
          `Expected event ${expectedEvent}, got ${event.event}`
        );
      }

      // Validate event data
      if (expectedData) {
        const dataValidation = this.validateEventData(event.data, expectedData);
        if (!dataValidation.passed) {
          results.passed = false;
          results.errors.push(...dataValidation.errors);
        }
        results.warnings.push(...dataValidation.warnings);
      }

      // Validate delivery time
      if (event.deliveryTime > maxDeliveryTime) {
        results.warnings.push(
          `Delivery time ${event.deliveryTime}ms exceeds ${maxDeliveryTime}ms threshold`
        );
      }

      this.validationResults.set(validationId, results);
      this.assertionCount++;

      if (!results.passed) {
        this.failureCount++;
      }

      this.emit("validationCompleted", { validationId, results });

      return results;
    } catch (error) {
      const results = {
        id: validationId,
        type: "WEBSOCKET_EVENT",
        timestamp: new Date(),
        passed: false,
        errors: [error.message],
        warnings: [],
      };

      this.validationResults.set(validationId, results);
      this.assertionCount++;
      this.failureCount++;

      this.emit("validationFailed", { validationId, error: error.message });

      return results;
    }
  }

  /**
   * Validate performance metrics
   */
  validatePerformanceMetrics(metrics, thresholds = {}) {
    const validationId = `performance_metrics_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      const results = {
        id: validationId,
        type: "PERFORMANCE_METRICS",
        timestamp: new Date(),
        passed: true,
        errors: [],
        warnings: [],
        metricResults: {},
      };

      const defaultThresholds = {
        apiResponseTime: 500,
        websocketDeliveryTime: 100,
        memoryUsage: 50,
        cpuUsage: 80,
      };

      const finalThresholds = { ...defaultThresholds, ...thresholds };

      // Validate API response time
      if (metrics.apiResponseTime !== undefined) {
        const apiResult = this.validateMetric(
          metrics.apiResponseTime,
          finalThresholds.apiResponseTime,
          "API Response Time",
          "ms"
        );
        results.metricResults.apiResponseTime = apiResult;
        if (!apiResult.passed) {
          results.passed = false;
          results.errors.push(apiResult.error);
        }
        if (apiResult.warning) {
          results.warnings.push(apiResult.warning);
        }
      }

      // Validate WebSocket delivery time
      if (metrics.websocketDeliveryTime !== undefined) {
        const wsResult = this.validateMetric(
          metrics.websocketDeliveryTime,
          finalThresholds.websocketDeliveryTime,
          "WebSocket Delivery Time",
          "ms"
        );
        results.metricResults.websocketDeliveryTime = wsResult;
        if (!wsResult.passed) {
          results.passed = false;
          results.errors.push(wsResult.error);
        }
        if (wsResult.warning) {
          results.warnings.push(wsResult.warning);
        }
      }

      // Validate memory usage
      if (metrics.memoryUsage !== undefined) {
        const memoryResult = this.validateMetric(
          metrics.memoryUsage,
          finalThresholds.memoryUsage,
          "Memory Usage",
          "MB"
        );
        results.metricResults.memoryUsage = memoryResult;
        if (!memoryResult.passed) {
          results.passed = false;
          results.errors.push(memoryResult.error);
        }
        if (memoryResult.warning) {
          results.warnings.push(memoryResult.warning);
        }
      }

      // Validate CPU usage
      if (metrics.cpuUsage !== undefined) {
        const cpuResult = this.validateMetric(
          metrics.cpuUsage,
          finalThresholds.cpuUsage,
          "CPU Usage",
          "%"
        );
        results.metricResults.cpuUsage = cpuResult;
        if (!cpuResult.passed) {
          results.passed = false;
          results.errors.push(cpuResult.error);
        }
        if (cpuResult.warning) {
          results.warnings.push(cpuResult.warning);
        }
      }

      this.validationResults.set(validationId, results);
      this.assertionCount++;

      if (!results.passed) {
        this.failureCount++;
      }

      this.emit("validationCompleted", { validationId, results });

      return results;
    } catch (error) {
      const results = {
        id: validationId,
        type: "PERFORMANCE_METRICS",
        timestamp: new Date(),
        passed: false,
        errors: [error.message],
        warnings: [],
        metricResults: {},
      };

      this.validationResults.set(validationId, results);
      this.assertionCount++;
      this.failureCount++;

      this.emit("validationFailed", { validationId, error: error.message });

      return results;
    }
  }

  /**
   * Validate individual metric
   */
  validateMetric(value, threshold, name, unit) {
    const result = {
      name,
      value,
      threshold,
      unit,
      passed: true,
      error: null,
      warning: null,
    };

    if (value > threshold) {
      result.passed = false;
      result.error = `${name} ${value}${unit} exceeds threshold ${threshold}${unit}`;
    } else if (value > threshold * 0.8) {
      result.warning = `${name} ${value}${unit} is approaching threshold ${threshold}${unit}`;
    }

    return result;
  }

  /**
   * Validate schema
   */
  validateSchema(data, schema) {
    const result = {
      passed: true,
      errors: [],
      warnings: [],
    };

    try {
      // Basic schema validation
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in data)) {
            result.passed = false;
            result.errors.push(`Missing required field: ${field}`);
          }
        }
      }

      if (schema.properties) {
        for (const [field, fieldSchema] of Object.entries(schema.properties)) {
          if (field in data) {
            const fieldValidation = this.validateField(
              data[field],
              fieldSchema,
              field
            );
            if (!fieldValidation.passed) {
              result.passed = false;
              result.errors.push(...fieldValidation.errors);
            }
            result.warnings.push(...fieldValidation.warnings);
          }
        }
      }

      return result;
    } catch (error) {
      result.passed = false;
      result.errors.push(`Schema validation error: ${error.message}`);
      return result;
    }
  }

  /**
   * Validate field
   */
  validateField(value, fieldSchema, fieldName) {
    const result = {
      passed: true,
      errors: [],
      warnings: [],
    };

    try {
      // Type validation
      if (fieldSchema.type) {
        const expectedType = fieldSchema.type;
        const actualType = typeof value;

        if (expectedType === "string" && actualType !== "string") {
          result.passed = false;
          result.errors.push(
            `Field ${fieldName} should be string, got ${actualType}`
          );
        } else if (expectedType === "number" && actualType !== "number") {
          result.passed = false;
          result.errors.push(
            `Field ${fieldName} should be number, got ${actualType}`
          );
        } else if (expectedType === "boolean" && actualType !== "boolean") {
          result.passed = false;
          result.errors.push(
            `Field ${fieldName} should be boolean, got ${actualType}`
          );
        } else if (
          expectedType === "object" &&
          (actualType !== "object" || value === null)
        ) {
          result.passed = false;
          result.errors.push(
            `Field ${fieldName} should be object, got ${actualType}`
          );
        } else if (expectedType === "array" && !Array.isArray(value)) {
          result.passed = false;
          result.errors.push(
            `Field ${fieldName} should be array, got ${actualType}`
          );
        }
      }

      // String length validation
      if (fieldSchema.type === "string" && typeof value === "string") {
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          result.passed = false;
          result.errors.push(
            `Field ${fieldName} length ${value.length} is less than minimum ${fieldSchema.minLength}`
          );
        }
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          result.passed = false;
          result.errors.push(
            `Field ${fieldName} length ${value.length} exceeds maximum ${fieldSchema.maxLength}`
          );
        }
      }

      // Number range validation
      if (fieldSchema.type === "number" && typeof value === "number") {
        if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
          result.passed = false;
          result.errors.push(
            `Field ${fieldName} value ${value} is less than minimum ${fieldSchema.minimum}`
          );
        }
        if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
          result.passed = false;
          result.errors.push(
            `Field ${fieldName} value ${value} exceeds maximum ${fieldSchema.maximum}`
          );
        }
      }

      // Enum validation
      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        result.passed = false;
        result.errors.push(
          `Field ${fieldName} value ${value} is not in allowed values: ${fieldSchema.enum.join(
            ", "
          )}`
        );
      }

      return result;
    } catch (error) {
      result.passed = false;
      result.errors.push(
        `Field validation error for ${fieldName}: ${error.message}`
      );
      return result;
    }
  }

  /**
   * Validate event data
   */
  validateEventData(data, expectedData) {
    const result = {
      passed: true,
      errors: [],
      warnings: [],
    };

    try {
      // Check required fields
      for (const [key, expectedValue] of Object.entries(expectedData)) {
        if (!(key in data)) {
          result.passed = false;
          result.errors.push(`Missing expected field: ${key}`);
        } else if (data[key] !== expectedValue) {
          result.warnings.push(
            `Field ${key} value ${data[key]} does not match expected ${expectedValue}`
          );
        }
      }

      return result;
    } catch (error) {
      result.passed = false;
      result.errors.push(`Event data validation error: ${error.message}`);
      return result;
    }
  }

  /**
   * Assert condition
   */
  assert(condition, message) {
    const assertionId = `assertion_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const result = {
      id: assertionId,
      type: "ASSERTION",
      timestamp: new Date(),
      passed: !!condition,
      message,
      errors: condition ? [] : [message],
      warnings: [],
    };

    this.validationResults.set(assertionId, result);
    this.assertionCount++;

    if (!result.passed) {
      this.failureCount++;
    }

    this.emit("assertionCompleted", { assertionId, result });

    return result;
  }

  /**
   * Assert equality
   */
  assertEqual(actual, expected, message = null) {
    const assertionMessage = message || `Expected ${expected}, got ${actual}`;
    return this.assert(actual === expected, assertionMessage);
  }

  /**
   * Assert not equal
   */
  assertNotEqual(actual, expected, message = null) {
    const assertionMessage =
      message || `Expected not ${expected}, got ${actual}`;
    return this.assert(actual !== expected, assertionMessage);
  }

  /**
   * Assert greater than
   */
  assertGreaterThan(actual, expected, message = null) {
    const assertionMessage = message || `Expected ${actual} > ${expected}`;
    return this.assert(actual > expected, assertionMessage);
  }

  /**
   * Assert less than
   */
  assertLessThan(actual, expected, message = null) {
    const assertionMessage = message || `Expected ${actual} < ${expected}`;
    return this.assert(actual < expected, assertionMessage);
  }

  /**
   * Assert contains
   */
  assertContains(container, item, message = null) {
    const assertionMessage =
      message || `Expected ${container} to contain ${item}`;
    return this.assert(container.includes(item), assertionMessage);
  }

  /**
   * Assert not contains
   */
  assertNotContains(container, item, message = null) {
    const assertionMessage =
      message || `Expected ${container} not to contain ${item}`;
    return this.assert(!container.includes(item), assertionMessage);
  }

  /**
   * Get validation summary
   */
  getValidationSummary() {
    const results = Array.from(this.validationResults.values());

    return {
      totalValidations: results.length,
      totalAssertions: this.assertionCount,
      passedValidations: results.filter((r) => r.passed).length,
      failedValidations: results.filter((r) => !r.passed).length,
      failureCount: this.failureCount,
      successRate:
        results.length > 0
          ? (results.filter((r) => r.passed).length / results.length) * 100
          : 0,
      byType: this.groupResultsByType(results),
    };
  }

  /**
   * Group results by type
   */
  groupResultsByType(results) {
    const grouped = {};

    results.forEach((result) => {
      if (!grouped[result.type]) {
        grouped[result.type] = {
          total: 0,
          passed: 0,
          failed: 0,
        };
      }

      grouped[result.type].total++;
      if (result.passed) {
        grouped[result.type].passed++;
      } else {
        grouped[result.type].failed++;
      }
    });

    return grouped;
  }

  /**
   * Clear validation results
   */
  clearResults() {
    this.validationResults.clear();
    this.assertionCount = 0;
    this.failureCount = 0;

    this.emit("resultsCleared");
  }

  /**
   * Export validation results
   */
  exportResults() {
    const results = Array.from(this.validationResults.values());

    return {
      summary: this.getValidationSummary(),
      results,
      count: results.length,
    };
  }
}

module.exports = TestValidation;

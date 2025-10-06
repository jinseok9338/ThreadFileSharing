const { v4: uuidv4 } = require("uuid");

/**
 * PerformanceMetric Entity Model
 *
 * Tracks response times, throughput, and resource usage for both API and WebSocket operations
 */
class PerformanceMetric {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.testId = data.testId || null;
    this.metricType = data.metricType || "API_RESPONSE";
    this.operation = data.operation || "unknown";
    this.value = data.value || 0;
    this.unit = data.unit || "ms";
    this.threshold = data.threshold || 0;
    this.isWithinThreshold =
      data.isWithinThreshold !== undefined ? data.isWithinThreshold : true;
    this.timestamp = data.timestamp || new Date();
    this.context = data.context || {};
  }

  /**
   * Validate metric data
   */
  validate() {
    const errors = [];

    // Metric type validation
    const validTypes = [
      "API_RESPONSE",
      "WEBSOCKET_DELIVERY",
      "MEMORY_USAGE",
      "CPU_USAGE",
    ];
    if (!validTypes.includes(this.metricType)) {
      errors.push(
        `Invalid metric type. Must be one of: ${validTypes.join(", ")}`
      );
    }

    // Value validation
    if (typeof this.value !== "number" || this.value < 0) {
      errors.push("Value must be a non-negative number");
    }

    // Threshold validation
    if (typeof this.threshold !== "number" || this.threshold < 0) {
      errors.push("Threshold must be a non-negative number");
    }

    // Unit validation
    const validUnits = [
      "ms",
      "s",
      "bytes",
      "MB",
      "GB",
      "percent",
      "count",
      "req/s",
    ];
    if (!validUnits.includes(this.unit)) {
      errors.push(`Invalid unit. Must be one of: ${validUnits.join(", ")}`);
    }

    // UUID validation
    if (!this.isValidUUID(this.id)) {
      errors.push("Invalid metric ID format");
    }

    if (this.testId && !this.isValidUUID(this.testId)) {
      errors.push("Invalid test ID format");
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
   * Update metric data
   */
  update(data) {
    const allowedFields = [
      "testId",
      "metricType",
      "operation",
      "value",
      "unit",
      "threshold",
      "isWithinThreshold",
      "timestamp",
      "context",
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
      testId: this.testId,
      metricType: this.metricType,
      operation: this.operation,
      value: this.value,
      unit: this.unit,
      threshold: this.threshold,
      isWithinThreshold: this.isWithinThreshold,
      timestamp: this.timestamp,
      context: this.context,
    };
  }

  /**
   * Create API response metric
   */
  static createAPIResponseMetric(
    testId,
    operation,
    responseTime,
    threshold = 500
  ) {
    return new PerformanceMetric({
      testId,
      metricType: "API_RESPONSE",
      operation,
      value: responseTime,
      unit: "ms",
      threshold,
      isWithinThreshold: responseTime <= threshold,
      context: {
        endpoint: operation.endpoint,
        method: operation.method,
        statusCode: operation.statusCode,
      },
    });
  }

  /**
   * Create WebSocket delivery metric
   */
  static createWebSocketDeliveryMetric(
    testId,
    operation,
    deliveryTime,
    threshold = 100
  ) {
    return new PerformanceMetric({
      testId,
      metricType: "WEBSOCKET_DELIVERY",
      operation: operation.event || operation.name,
      value: deliveryTime,
      unit: "ms",
      threshold,
      isWithinThreshold: deliveryTime <= threshold,
      context: {
        event: operation.event,
        room: operation.room,
        socketId: operation.socketId,
      },
    });
  }

  /**
   * Create memory usage metric
   */
  static createMemoryUsageMetric(
    testId,
    operation,
    memoryUsage,
    threshold = 50
  ) {
    return new PerformanceMetric({
      testId,
      metricType: "MEMORY_USAGE",
      operation,
      value: memoryUsage,
      unit: "MB",
      threshold,
      isWithinThreshold: memoryUsage <= threshold,
      context: {
        baselineMemory: operation.baselineMemory,
        currentMemory: operation.currentMemory,
        memoryIncrease: operation.memoryIncrease,
      },
    });
  }

  /**
   * Create CPU usage metric
   */
  static createCPUUsageMetric(testId, operation, cpuUsage, threshold = 80) {
    return new PerformanceMetric({
      testId,
      metricType: "CPU_USAGE",
      operation,
      value: cpuUsage,
      unit: "percent",
      threshold,
      isWithinThreshold: cpuUsage <= threshold,
      context: {
        userTime: operation.userTime,
        systemTime: operation.systemTime,
        loadAverage: operation.loadAverage,
      },
    });
  }

  /**
   * Generate test metrics
   */
  static generateTestMetrics() {
    const metrics = [];

    // API Response metrics
    metrics.push(
      new PerformanceMetric({
        testId: "123e4567-e89b-12d3-a456-426614174000",
        metricType: "API_RESPONSE",
        operation: "login",
        value: 250,
        unit: "ms",
        threshold: 500,
        isWithinThreshold: true,
        context: {
          endpoint: "/auth/login",
          method: "POST",
          statusCode: 200,
        },
      })
    );

    // WebSocket Delivery metrics
    metrics.push(
      new PerformanceMetric({
        testId: "123e4567-e89b-12d3-a456-426614174000",
        metricType: "WEBSOCKET_DELIVERY",
        operation: "message_received",
        value: 50,
        unit: "ms",
        threshold: 100,
        isWithinThreshold: true,
        context: {
          event: "message_received",
          room: "chatroom-123",
          socketId: "socket-456",
        },
      })
    );

    // Memory Usage metrics
    metrics.push(
      new PerformanceMetric({
        testId: "123e4567-e89b-12d3-a456-426614174000",
        metricType: "MEMORY_USAGE",
        operation: "concurrent_connections",
        value: 25,
        unit: "MB",
        threshold: 50,
        isWithinThreshold: true,
        context: {
          baselineMemory: 100,
          currentMemory: 125,
          memoryIncrease: 25,
        },
      })
    );

    // CPU Usage metrics
    metrics.push(
      new PerformanceMetric({
        testId: "123e4567-e89b-12d3-a456-426614174000",
        metricType: "CPU_USAGE",
        operation: "load_test",
        value: 45,
        unit: "percent",
        threshold: 80,
        isWithinThreshold: true,
        context: {
          userTime: 1000000,
          systemTime: 500000,
          loadAverage: 1.2,
        },
      })
    );

    return metrics;
  }

  /**
   * Compare metrics
   */
  equals(other) {
    return this.id === other.id && this.metricType === other.metricType;
  }

  /**
   * Check if metric is within threshold
   */
  isWithinThreshold() {
    return this.isWithinThreshold === true;
  }

  /**
   * Check if metric violates threshold
   */
  violatesThreshold() {
    return !this.isWithinThreshold;
  }

  /**
   * Get metric summary
   */
  getSummary() {
    return {
      id: this.id,
      testId: this.testId,
      metricType: this.metricType,
      operation: this.operation,
      value: this.value,
      unit: this.unit,
      threshold: this.threshold,
      isWithinThreshold: this.isWithinThreshold,
      timestamp: this.timestamp,
    };
  }

  /**
   * Get metric details
   */
  getDetails() {
    return {
      ...this.getSummary(),
      context: this.context,
    };
  }

  /**
   * Check if metric matches filters
   */
  matches(filters) {
    if (filters.metricType && this.metricType !== filters.metricType) {
      return false;
    }

    if (filters.operation && this.operation !== filters.operation) {
      return false;
    }

    if (filters.testId && this.testId !== filters.testId) {
      return false;
    }

    if (
      filters.isWithinThreshold !== undefined &&
      this.isWithinThreshold !== filters.isWithinThreshold
    ) {
      return false;
    }

    if (filters.unit && this.unit !== filters.unit) {
      return false;
    }

    return true;
  }

  /**
   * Get metric age in milliseconds
   */
  getAge() {
    return Date.now() - new Date(this.timestamp).getTime();
  }

  /**
   * Check if metric is stale
   */
  isStale(maxAge = 3600000) {
    // 1 hour default
    return this.getAge() > maxAge;
  }

  /**
   * Convert value to different unit
   */
  convertToUnit(newUnit) {
    const conversions = {
      ms: {
        s: (value) => value / 1000,
        min: (value) => value / 60000,
      },
      s: {
        ms: (value) => value * 1000,
        min: (value) => value / 60,
      },
      bytes: {
        MB: (value) => value / 1048576,
        GB: (value) => value / 1073741824,
      },
      MB: {
        bytes: (value) => value * 1048576,
        GB: (value) => value / 1024,
      },
      GB: {
        bytes: (value) => value * 1073741824,
        MB: (value) => value * 1024,
      },
    };

    if (conversions[this.unit] && conversions[this.unit][newUnit]) {
      const convertedValue = conversions[this.unit][newUnit](this.value);
      return new PerformanceMetric({
        ...this.toJSON(),
        value: convertedValue,
        unit: newUnit,
      });
    }

    return this; // Return original if conversion not available
  }

  /**
   * Get performance grade
   */
  getPerformanceGrade() {
    if (this.isWithinThreshold) {
      const ratio = this.value / this.threshold;
      if (ratio <= 0.5) return "A"; // Excellent
      if (ratio <= 0.7) return "B"; // Good
      if (ratio <= 0.9) return "C"; // Acceptable
      return "D"; // Poor but within threshold
    } else {
      const ratio = this.value / this.threshold;
      if (ratio <= 1.2) return "F"; // Just over threshold
      if (ratio <= 1.5) return "F-"; // Moderately over threshold
      return "F--"; // Significantly over threshold
    }
  }

  /**
   * Clone metric
   */
  clone() {
    return new PerformanceMetric({
      testId: this.testId,
      metricType: this.metricType,
      operation: this.operation,
      value: this.value,
      unit: this.unit,
      threshold: this.threshold,
      isWithinThreshold: this.isWithinThreshold,
      timestamp: this.timestamp,
      context: { ...this.context },
    });
  }
}

module.exports = PerformanceMetric;

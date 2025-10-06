const PerformanceMetric = require("../models/PerformanceMetric");
const { EventEmitter } = require("events");

/**
 * Performance Metrics Collection Service
 *
 * Collects, aggregates, and analyzes performance metrics
 */
class PerformanceMetricsService extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.aggregatedMetrics = new Map();
    this.thresholds = new Map();
  }

  /**
   * Initialize service with default thresholds
   */
  async initialize() {
    try {
      // Set default thresholds
      this.thresholds.set("API_RESPONSE", 500); // 500ms
      this.thresholds.set("WEBSOCKET_DELIVERY", 100); // 100ms
      this.thresholds.set("MEMORY_USAGE", 50); // 50MB
      this.thresholds.set("CPU_USAGE", 80); // 80%

      this.emit("initialized", { service: "PerformanceMetricsService" });
      return { success: true };
    } catch (error) {
      this.emit("error", { error: error.message });
      throw error;
    }
  }

  /**
   * Record performance metric
   */
  async recordMetric(data) {
    try {
      const metric = new PerformanceMetric(data);
      const validation = metric.validate();

      if (!validation.isValid) {
        throw new Error(`Invalid metric data: ${validation.errors.join(", ")}`);
      }

      this.metrics.set(metric.id, metric);
      this.emit("metricRecorded", { metricId: metric.id, metric });

      return { success: true, metric };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "recordMetric" });
      throw error;
    }
  }

  /**
   * Record API response time
   */
  async recordAPIResponseTime(
    testId,
    operation,
    responseTime,
    statusCode = 200
  ) {
    try {
      const threshold = this.thresholds.get("API_RESPONSE") || 500;

      const metric = PerformanceMetric.createAPIResponseMetric(
        testId,
        { ...operation, statusCode },
        responseTime,
        threshold
      );

      this.metrics.set(metric.id, metric);
      this.emit("apiResponseTimeRecorded", { metricId: metric.id, metric });

      return { success: true, metric };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "recordAPIResponseTime",
      });
      throw error;
    }
  }

  /**
   * Record WebSocket delivery time
   */
  async recordWebSocketDeliveryTime(testId, operation, deliveryTime) {
    try {
      const threshold = this.thresholds.get("WEBSOCKET_DELIVERY") || 100;

      const metric = PerformanceMetric.createWebSocketDeliveryMetric(
        testId,
        operation,
        deliveryTime,
        threshold
      );

      this.metrics.set(metric.id, metric);
      this.emit("websocketDeliveryTimeRecorded", {
        metricId: metric.id,
        metric,
      });

      return { success: true, metric };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "recordWebSocketDeliveryTime",
      });
      throw error;
    }
  }

  /**
   * Record memory usage
   */
  async recordMemoryUsage(testId, operation, memoryUsage) {
    try {
      const threshold = this.thresholds.get("MEMORY_USAGE") || 50;

      const metric = PerformanceMetric.createMemoryUsageMetric(
        testId,
        operation,
        memoryUsage,
        threshold
      );

      this.metrics.set(metric.id, metric);
      this.emit("memoryUsageRecorded", { metricId: metric.id, metric });

      return { success: true, metric };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "recordMemoryUsage",
      });
      throw error;
    }
  }

  /**
   * Record CPU usage
   */
  async recordCPUUsage(testId, operation, cpuUsage) {
    try {
      const threshold = this.thresholds.get("CPU_USAGE") || 80;

      const metric = PerformanceMetric.createCPUUsageMetric(
        testId,
        operation,
        cpuUsage,
        threshold
      );

      this.metrics.set(metric.id, metric);
      this.emit("cpuUsageRecorded", { metricId: metric.id, metric });

      return { success: true, metric };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "recordCPUUsage" });
      throw error;
    }
  }

  /**
   * Get metric by ID
   */
  async getMetric(metricId) {
    try {
      const metric = this.metrics.get(metricId);

      if (!metric) {
        throw new Error(`Metric not found: ${metricId}`);
      }

      return { success: true, metric };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getMetric",
        metricId,
      });
      throw error;
    }
  }

  /**
   * List metrics with filters
   */
  async listMetrics(filters = {}) {
    try {
      let metrics = Array.from(this.metrics.values());

      // Apply filters
      if (filters.metricType) {
        metrics = metrics.filter((m) => m.metricType === filters.metricType);
      }

      if (filters.operation) {
        metrics = metrics.filter((m) => m.operation === filters.operation);
      }

      if (filters.testId) {
        metrics = metrics.filter((m) => m.testId === filters.testId);
      }

      if (filters.isWithinThreshold !== undefined) {
        metrics = metrics.filter(
          (m) => m.isWithinThreshold === filters.isWithinThreshold
        );
      }

      if (filters.startTime) {
        metrics = metrics.filter(
          (m) => new Date(m.timestamp) >= new Date(filters.startTime)
        );
      }

      if (filters.endTime) {
        metrics = metrics.filter(
          (m) => new Date(m.timestamp) <= new Date(filters.endTime)
        );
      }

      const results = metrics.map((metric) => metric.getSummary());

      return { success: true, metrics: results, count: results.length };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "listMetrics" });
      throw error;
    }
  }

  /**
   * Get aggregated metrics
   */
  async getAggregatedMetrics(filters = {}) {
    try {
      let metrics = Array.from(this.metrics.values());

      // Apply filters
      if (filters.metricType) {
        metrics = metrics.filter((m) => m.metricType === filters.metricType);
      }

      if (filters.operation) {
        metrics = metrics.filter((m) => m.operation === filters.operation);
      }

      if (filters.startTime) {
        metrics = metrics.filter(
          (m) => new Date(m.timestamp) >= new Date(filters.startTime)
        );
      }

      if (filters.endTime) {
        metrics = metrics.filter(
          (m) => new Date(m.timestamp) <= new Date(filters.endTime)
        );
      }

      // Group by metric type and operation
      const aggregated = {};

      metrics.forEach((metric) => {
        const key = `${metric.metricType}_${metric.operation}`;

        if (!aggregated[key]) {
          aggregated[key] = {
            metricType: metric.metricType,
            operation: metric.operation,
            unit: metric.unit,
            threshold: metric.threshold,
            values: [],
            count: 0,
            sum: 0,
            min: Infinity,
            max: -Infinity,
            withinThreshold: 0,
            violations: 0,
          };
        }

        const agg = aggregated[key];
        agg.values.push(metric.value);
        agg.count++;
        agg.sum += metric.value;
        agg.min = Math.min(agg.min, metric.value);
        agg.max = Math.max(agg.max, metric.value);

        if (metric.isWithinThreshold) {
          agg.withinThreshold++;
        } else {
          agg.violations++;
        }
      });

      // Calculate statistics
      Object.keys(aggregated).forEach((key) => {
        const agg = aggregated[key];
        agg.average = agg.count > 0 ? agg.sum / agg.count : 0;
        agg.successRate =
          agg.count > 0 ? (agg.withinThreshold / agg.count) * 100 : 0;
        agg.violationRate =
          agg.count > 0 ? (agg.violations / agg.count) * 100 : 0;

        // Calculate percentiles
        if (agg.values.length > 0) {
          agg.values.sort((a, b) => a - b);
          agg.p50 = agg.values[Math.floor(agg.values.length * 0.5)];
          agg.p95 = agg.values[Math.floor(agg.values.length * 0.95)];
          agg.p99 = agg.values[Math.floor(agg.values.length * 0.99)];
        }

        // Remove values array to reduce size
        delete agg.values;
      });

      return { success: true, aggregated };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getAggregatedMetrics",
      });
      throw error;
    }
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary() {
    try {
      const metrics = Array.from(this.metrics.values());

      const summary = {
        total: metrics.length,
        byType: {},
        byOperation: {},
        thresholdViolations: 0,
        overallSuccessRate: 0,
      };

      // Group by type
      metrics.forEach((metric) => {
        if (!summary.byType[metric.metricType]) {
          summary.byType[metric.metricType] = {
            count: 0,
            withinThreshold: 0,
            violations: 0,
            average: 0,
            min: Infinity,
            max: -Infinity,
          };
        }

        const typeSummary = summary.byType[metric.metricType];
        typeSummary.count++;
        typeSummary.min = Math.min(typeSummary.min, metric.value);
        typeSummary.max = Math.max(typeSummary.max, metric.value);

        if (metric.isWithinThreshold) {
          typeSummary.withinThreshold++;
        } else {
          typeSummary.violations++;
          summary.thresholdViolations++;
        }
      });

      // Calculate averages
      Object.keys(summary.byType).forEach((type) => {
        const typeMetrics = metrics.filter((m) => m.metricType === type);
        const typeSummary = summary.byType[type];

        if (typeMetrics.length > 0) {
          typeSummary.average =
            typeMetrics.reduce((sum, m) => sum + m.value, 0) /
            typeMetrics.length;
          typeSummary.successRate =
            (typeSummary.withinThreshold / typeSummary.count) * 100;
        }
      });

      // Group by operation
      metrics.forEach((metric) => {
        if (!summary.byOperation[metric.operation]) {
          summary.byOperation[metric.operation] = {
            count: 0,
            withinThreshold: 0,
            violations: 0,
          };
        }

        const opSummary = summary.byOperation[metric.operation];
        opSummary.count++;

        if (metric.isWithinThreshold) {
          opSummary.withinThreshold++;
        } else {
          opSummary.violations++;
        }
      });

      // Calculate overall success rate
      if (metrics.length > 0) {
        const withinThreshold = metrics.filter(
          (m) => m.isWithinThreshold
        ).length;
        summary.overallSuccessRate = (withinThreshold / metrics.length) * 100;
      }

      return { success: true, summary };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getPerformanceSummary",
      });
      throw error;
    }
  }

  /**
   * Get threshold violations
   */
  async getThresholdViolations(filters = {}) {
    try {
      let metrics = Array.from(this.metrics.values()).filter(
        (m) => !m.isWithinThreshold
      );

      // Apply filters
      if (filters.metricType) {
        metrics = metrics.filter((m) => m.metricType === filters.metricType);
      }

      if (filters.operation) {
        metrics = metrics.filter((m) => m.operation === filters.operation);
      }

      if (filters.startTime) {
        metrics = metrics.filter(
          (m) => new Date(m.timestamp) >= new Date(filters.startTime)
        );
      }

      if (filters.endTime) {
        metrics = metrics.filter(
          (m) => new Date(m.timestamp) <= new Date(filters.endTime)
        );
      }

      const violations = metrics.map((metric) => ({
        id: metric.id,
        metricType: metric.metricType,
        operation: metric.operation,
        value: metric.value,
        threshold: metric.threshold,
        unit: metric.unit,
        violationAmount: metric.value - metric.threshold,
        violationPercentage:
          ((metric.value - metric.threshold) / metric.threshold) * 100,
        timestamp: metric.timestamp,
        testId: metric.testId,
      }));

      return { success: true, violations, count: violations.length };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getThresholdViolations",
      });
      throw error;
    }
  }

  /**
   * Set threshold
   */
  async setThreshold(metricType, threshold) {
    try {
      this.thresholds.set(metricType, threshold);

      this.emit("thresholdSet", { metricType, threshold });

      return { success: true, metricType, threshold };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "setThreshold",
        metricType,
      });
      throw error;
    }
  }

  /**
   * Get threshold
   */
  async getThreshold(metricType) {
    try {
      const threshold = this.thresholds.get(metricType);

      if (threshold === undefined) {
        throw new Error(`Threshold not found: ${metricType}`);
      }

      return { success: true, metricType, threshold };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getThreshold",
        metricType,
      });
      throw error;
    }
  }

  /**
   * Get all thresholds
   */
  async getAllThresholds() {
    try {
      const thresholds = Object.fromEntries(this.thresholds);

      return { success: true, thresholds };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getAllThresholds",
      });
      throw error;
    }
  }

  /**
   * Clear metrics
   */
  async clearMetrics() {
    try {
      const count = this.metrics.size;
      this.metrics.clear();

      this.emit("metricsCleared", { count });

      return { success: true, clearedCount: count };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "clearMetrics" });
      throw error;
    }
  }

  /**
   * Export metrics
   */
  async exportMetrics(filters = {}) {
    try {
      const { metrics } = await this.listMetrics(filters);

      return { success: true, metrics, count: metrics.length };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "exportMetrics" });
      throw error;
    }
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(filters = {}) {
    try {
      const [summary, aggregated, violations] = await Promise.all([
        this.getPerformanceSummary(),
        this.getAggregatedMetrics(filters),
        this.getThresholdViolations(filters),
      ]);

      const report = {
        timestamp: new Date().toISOString(),
        summary: summary.summary,
        aggregated: aggregated.aggregated,
        violations: violations.violations,
        recommendations: this.generateRecommendations(
          summary.summary,
          violations.violations
        ),
      };

      return { success: true, report };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generatePerformanceReport",
      });
      throw error;
    }
  }

  /**
   * Generate recommendations based on performance data
   */
  generateRecommendations(summary, violations) {
    const recommendations = [];

    // Check overall success rate
    if (summary.overallSuccessRate < 95) {
      recommendations.push({
        type: "PERFORMANCE",
        priority: "HIGH",
        message: "Overall performance success rate is below 95%",
        details: `Current success rate: ${summary.overallSuccessRate.toFixed(
          2
        )}%`,
        action: "Review and optimize performance bottlenecks",
      });
    }

    // Check threshold violations
    if (violations.length > 0) {
      const violationRate = (violations.length / summary.total) * 100;

      if (violationRate > 10) {
        recommendations.push({
          type: "THRESHOLD_VIOLATIONS",
          priority: "HIGH",
          message: "High threshold violation rate detected",
          details: `${violations.length} violations (${violationRate.toFixed(
            2
          )}% of total metrics)`,
          action: "Investigate and fix performance issues",
        });
      }
    }

    // Check specific metric types
    Object.keys(summary.byType).forEach((type) => {
      const typeSummary = summary.byType[type];

      if (typeSummary.successRate < 90) {
        recommendations.push({
          type: "METRIC_TYPE",
          priority: "MEDIUM",
          message: `Low success rate for ${type} metrics`,
          details: `Success rate: ${typeSummary.successRate.toFixed(2)}%`,
          action: `Optimize ${type.toLowerCase()} performance`,
        });
      }
    });

    return recommendations;
  }
}

module.exports = PerformanceMetricsService;

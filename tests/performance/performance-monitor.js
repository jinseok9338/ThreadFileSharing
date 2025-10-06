const { EventEmitter } = require("events");
const os = require("os");
const fs = require("fs").promises;
const path = require("path");

class PerformanceMonitor extends EventEmitter {
  constructor(options = {}) {
    super();

    /**
     * Initialize performance monitor
     */
    this.initialize = async () => {
      try {
        this.emit("initialized", { service: "PerformanceMonitor" });
        return { success: true };
      } catch (error) {
        this.emit("error", { error: error.message });
        throw error;
      }
    };
    this.options = {
      interval: options.interval || 1000,
      logFile: options.logFile || "tests/logs/performance.log",
      thresholds: options.thresholds || {
        apiResponseTime: 500,
        websocketDeliveryTime: 100,
        memoryUsage: 50,
        cpuUsage: 80,
      },
      ...options,
    };

    this.metrics = new Map();
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.baselineMetrics = null;
  }

  /**
   * Start performance monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.baselineMetrics = await this.collectSystemMetrics();

    this.monitoringInterval = setInterval(async () => {
      const metrics = await this.collectSystemMetrics();
      this.processMetrics(metrics);
    }, this.options.interval);

    this.emit("monitoringStarted");
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emit("monitoringStopped");
  }

  /**
   * Collect system metrics
   */
  async collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const loadAvg = os.loadavg();

    return {
      timestamp: Date.now(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      system: {
        loadAverage: loadAvg,
        uptime: os.uptime(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
      },
    };
  }

  /**
   * Process collected metrics
   */
  processMetrics(metrics) {
    const processedMetrics = {
      ...metrics,
      memoryUsageMB: Math.round(metrics.memory.heapUsed / 1024 / 1024),
      memoryUsagePercent: Math.round(
        (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100
      ),
      cpuUsagePercent: this.calculateCpuUsage(metrics.cpu),
      loadAverage: metrics.system.loadAverage[0],
    };

    // Check thresholds
    const violations = this.checkThresholds(processedMetrics);

    if (violations.length > 0) {
      this.emit("thresholdViolation", {
        metrics: processedMetrics,
        violations,
        timestamp: new Date().toISOString(),
      });
    }

    this.metrics.set(metrics.timestamp, processedMetrics);
    this.emit("metricsCollected", processedMetrics);
  }

  /**
   * Calculate CPU usage percentage
   */
  calculateCpuUsage(cpuUsage) {
    const total = cpuUsage.user + cpuUsage.system;
    return Math.round((total / 1000000) * 100); // Convert to percentage
  }

  /**
   * Check performance thresholds
   */
  checkThresholds(metrics) {
    const violations = [];

    if (metrics.memoryUsageMB > this.options.thresholds.memoryUsage) {
      violations.push({
        type: "MEMORY_USAGE",
        value: metrics.memoryUsageMB,
        threshold: this.options.thresholds.memoryUsage,
        unit: "MB",
      });
    }

    if (metrics.cpuUsagePercent > this.options.thresholds.cpuUsage) {
      violations.push({
        type: "CPU_USAGE",
        value: metrics.cpuUsagePercent,
        threshold: this.options.thresholds.cpuUsage,
        unit: "%",
      });
    }

    return violations;
  }

  /**
   * Record API response time
   */
  recordAPIResponseTime(endpoint, method, responseTime, statusCode) {
    const metric = {
      type: "API_RESPONSE",
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: Date.now(),
      withinThreshold: responseTime <= this.options.thresholds.apiResponseTime,
    };

    this.metrics.set(`api_${Date.now()}_${Math.random()}`, metric);
    this.emit("apiResponseRecorded", metric);

    if (!metric.withinThreshold) {
      this.emit("thresholdViolation", {
        metrics: metric,
        violations: [
          {
            type: "API_RESPONSE_TIME",
            value: responseTime,
            threshold: this.options.thresholds.apiResponseTime,
            unit: "ms",
          },
        ],
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Record WebSocket delivery time
   */
  recordWebSocketDeliveryTime(event, deliveryTime, success) {
    const metric = {
      type: "WEBSOCKET_DELIVERY",
      event,
      deliveryTime,
      success,
      timestamp: Date.now(),
      withinThreshold:
        deliveryTime <= this.options.thresholds.websocketDeliveryTime,
    };

    this.metrics.set(`ws_${Date.now()}_${Math.random()}`, metric);
    this.emit("websocketDeliveryRecorded", metric);

    if (!metric.withinThreshold) {
      this.emit("thresholdViolation", {
        metrics: metric,
        violations: [
          {
            type: "WEBSOCKET_DELIVERY_TIME",
            value: deliveryTime,
            threshold: this.options.thresholds.websocketDeliveryTime,
            unit: "ms",
          },
        ],
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Record concurrent user count
   */
  recordConcurrentUsers(userCount) {
    const metric = {
      type: "CONCURRENT_USERS",
      userCount,
      timestamp: Date.now(),
      withinThreshold: userCount <= this.options.thresholds.concurrentUsers,
    };

    this.metrics.set(`users_${Date.now()}`, metric);
    this.emit("concurrentUsersRecorded", metric);

    if (!metric.withinThreshold) {
      this.emit("thresholdViolation", {
        metrics: metric,
        violations: [
          {
            type: "CONCURRENT_USERS",
            value: userCount,
            threshold: this.options.thresholds.concurrentUsers,
            unit: "users",
          },
        ],
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const metricsArray = Array.from(this.metrics.values());
    const apiMetrics = metricsArray.filter((m) => m.type === "API_RESPONSE");
    const wsMetrics = metricsArray.filter(
      (m) => m.type === "WEBSOCKET_DELIVERY"
    );
    const userMetrics = metricsArray.filter(
      (m) => m.type === "CONCURRENT_USERS"
    );
    const systemMetrics = metricsArray.filter(
      (m) => m.memoryUsageMB !== undefined
    );

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalMetrics: metricsArray.length,
        apiResponses: apiMetrics.length,
        websocketDeliveries: wsMetrics.length,
        concurrentUserRecords: userMetrics.length,
        systemMetrics: systemMetrics.length,
      },
      apiPerformance: this.calculateAPIPerformance(apiMetrics),
      websocketPerformance: this.calculateWebSocketPerformance(wsMetrics),
      concurrentUsers: this.calculateConcurrentUsers(userMetrics),
      systemPerformance: this.calculateSystemPerformance(systemMetrics),
      thresholdViolations: this.getThresholdViolations(),
    };
  }

  /**
   * Calculate API performance metrics
   */
  calculateAPIPerformance(apiMetrics) {
    if (apiMetrics.length === 0) {
      return { average: 0, min: 0, max: 0, p95: 0, p99: 0, withinThreshold: 0 };
    }

    const responseTimes = apiMetrics
      .map((m) => m.responseTime)
      .sort((a, b) => a - b);
    const withinThreshold = apiMetrics.filter((m) => m.withinThreshold).length;

    return {
      average: Math.round(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      ),
      min: responseTimes[0],
      max: responseTimes[responseTimes.length - 1],
      p95: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99: responseTimes[Math.floor(responseTimes.length * 0.99)],
      withinThreshold: Math.round((withinThreshold / apiMetrics.length) * 100),
    };
  }

  /**
   * Calculate WebSocket performance metrics
   */
  calculateWebSocketPerformance(wsMetrics) {
    if (wsMetrics.length === 0) {
      return { average: 0, min: 0, max: 0, p95: 0, p99: 0, withinThreshold: 0 };
    }

    const deliveryTimes = wsMetrics
      .map((m) => m.deliveryTime)
      .sort((a, b) => a - b);
    const withinThreshold = wsMetrics.filter((m) => m.withinThreshold).length;

    return {
      average: Math.round(
        deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
      ),
      min: deliveryTimes[0],
      max: deliveryTimes[deliveryTimes.length - 1],
      p95: deliveryTimes[Math.floor(deliveryTimes.length * 0.95)],
      p99: deliveryTimes[Math.floor(deliveryTimes.length * 0.99)],
      withinThreshold: Math.round((withinThreshold / wsMetrics.length) * 100),
    };
  }

  /**
   * Calculate concurrent users metrics
   */
  calculateConcurrentUsers(userMetrics) {
    if (userMetrics.length === 0) {
      return { average: 0, min: 0, max: 0, withinThreshold: 0 };
    }

    const userCounts = userMetrics.map((m) => m.userCount);
    const withinThreshold = userMetrics.filter((m) => m.withinThreshold).length;

    return {
      average: Math.round(
        userCounts.reduce((a, b) => a + b, 0) / userCounts.length
      ),
      min: Math.min(...userCounts),
      max: Math.max(...userCounts),
      withinThreshold: Math.round((withinThreshold / userMetrics.length) * 100),
    };
  }

  /**
   * Calculate system performance metrics
   */
  calculateSystemPerformance(systemMetrics) {
    if (systemMetrics.length === 0) {
      return { memoryUsage: 0, cpuUsage: 0, loadAverage: 0 };
    }

    const memoryUsages = systemMetrics.map((m) => m.memoryUsageMB);
    const cpuUsages = systemMetrics.map((m) => m.cpuUsagePercent);
    const loadAverages = systemMetrics.map((m) => m.loadAverage);

    return {
      memoryUsage: {
        average: Math.round(
          memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length
        ),
        min: Math.min(...memoryUsages),
        max: Math.max(...memoryUsages),
      },
      cpuUsage: {
        average: Math.round(
          cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length
        ),
        min: Math.min(...cpuUsages),
        max: Math.max(...cpuUsages),
      },
      loadAverage: {
        average:
          Math.round(
            (loadAverages.reduce((a, b) => a + b, 0) / loadAverages.length) *
              100
          ) / 100,
        min: Math.min(...loadAverages),
        max: Math.max(...loadAverages),
      },
    };
  }

  /**
   * Get threshold violations
   */
  getThresholdViolations() {
    const violations = [];

    this.metrics.forEach((metric, key) => {
      if (metric.type === "API_RESPONSE" && !metric.withinThreshold) {
        violations.push({
          type: "API_RESPONSE_TIME",
          value: metric.responseTime,
          threshold: this.options.thresholds.apiResponseTime,
          unit: "ms",
          timestamp: new Date(metric.timestamp).toISOString(),
        });
      } else if (
        metric.type === "WEBSOCKET_DELIVERY" &&
        !metric.withinThreshold
      ) {
        violations.push({
          type: "WEBSOCKET_DELIVERY_TIME",
          value: metric.deliveryTime,
          threshold: this.options.thresholds.websocketDeliveryTime,
          unit: "ms",
          timestamp: new Date(metric.timestamp).toISOString(),
        });
      }
    });

    return violations;
  }

  /**
   * Export metrics to file
   */
  async exportMetrics(filename = null) {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: this.getPerformanceSummary(),
      metrics: Array.from(this.metrics.values()),
      thresholds: this.options.thresholds,
    };

    const exportFile =
      filename || `tests/reports/performance-${Date.now()}.json`;

    try {
      await fs.mkdir(path.dirname(exportFile), { recursive: true });
      await fs.writeFile(exportFile, JSON.stringify(exportData, null, 2));

      this.emit("metricsExported", {
        file: exportFile,
        count: this.metrics.size,
      });
      return exportFile;
    } catch (error) {
      this.emit("exportError", { error: error.message, file: exportFile });
      throw error;
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
    this.emit("metricsCleared");
  }
}

module.exports = PerformanceMonitor;

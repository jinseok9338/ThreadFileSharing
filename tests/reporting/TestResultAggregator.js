const { EventEmitter } = require("events");

/**
 * Test Result Aggregation and Reporting Service
 *
 * Aggregates test results and generates comprehensive reports
 */
class TestResultAggregator extends EventEmitter {
  constructor() {
    super();
    this.aggregatedResults = new Map();
    this.reportTemplates = new Map();
  }

  /**
   * Initialize aggregator
   */
  async initialize() {
    try {
      // Load default report templates
      this.loadDefaultReportTemplates();

      this.emit("initialized", { service: "TestResultAggregator" });
      return { success: true };
    } catch (error) {
      this.emit("error", { error: error.message });
      throw error;
    }
  }

  /**
   * Load default report templates
   */
  loadDefaultReportTemplates() {
    // Summary report template
    this.reportTemplates.set("summary", {
      name: "Summary Report",
      description: "High-level summary of test execution results",
      sections: ["overview", "scenarios", "performance", "recommendations"],
    });

    // Detailed report template
    this.reportTemplates.set("detailed", {
      name: "Detailed Report",
      description: "Comprehensive detailed report with all test data",
      sections: [
        "overview",
        "scenarios",
        "performance",
        "events",
        "validation",
        "recommendations",
      ],
    });

    // Performance report template
    this.reportTemplates.set("performance", {
      name: "Performance Report",
      description: "Performance-focused report with metrics and benchmarks",
      sections: ["overview", "performance", "thresholds", "recommendations"],
    });

    // Error report template
    this.reportTemplates.set("error", {
      name: "Error Report",
      description: "Error-focused report with failure analysis",
      sections: ["overview", "errors", "failures", "recommendations"],
    });
  }

  /**
   * Aggregate test results
   */
  async aggregateResults(testResults, options = {}) {
    try {
      const aggregationId = `aggregation_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const aggregated = {
        id: aggregationId,
        timestamp: new Date(),
        options,
        summary: this.calculateSummary(testResults),
        scenarios: this.aggregateScenarios(testResults),
        performance: this.aggregatePerformance(testResults),
        events: this.aggregateEvents(testResults),
        validation: this.aggregateValidation(testResults),
        errors: this.aggregateErrors(testResults),
        recommendations: this.generateRecommendations(testResults),
      };

      this.aggregatedResults.set(aggregationId, aggregated);

      this.emit("resultsAggregated", { aggregationId, aggregated });

      return { success: true, aggregated };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "aggregateResults",
      });
      throw error;
    }
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(testResults) {
    const total = testResults.length;
    const successful = testResults.filter((r) => r.success).length;
    const failed = testResults.filter((r) => !r.success).length;
    const totalDuration = testResults.reduce(
      (sum, r) => sum + (r.duration || 0),
      0
    );

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
      averageDuration: total > 0 ? totalDuration / total : 0,
      totalDuration,
      minDuration:
        total > 0 ? Math.min(...testResults.map((r) => r.duration || 0)) : 0,
      maxDuration:
        total > 0 ? Math.max(...testResults.map((r) => r.duration || 0)) : 0,
    };
  }

  /**
   * Aggregate scenario results
   */
  aggregateScenarios(testResults) {
    const scenarios = {};

    testResults.forEach((result) => {
      const scenarioId = result.scenarioId;

      if (!scenarios[scenarioId]) {
        scenarios[scenarioId] = {
          scenarioId,
          total: 0,
          successful: 0,
          failed: 0,
          totalDuration: 0,
          results: [],
        };
      }

      scenarios[scenarioId].total++;
      scenarios[scenarioId].totalDuration += result.duration || 0;
      scenarios[scenarioId].results.push(result);

      if (result.success) {
        scenarios[scenarioId].successful++;
      } else {
        scenarios[scenarioId].failed++;
      }
    });

    // Calculate statistics for each scenario
    Object.keys(scenarios).forEach((scenarioId) => {
      const scenario = scenarios[scenarioId];
      scenario.successRate =
        scenario.total > 0 ? (scenario.successful / scenario.total) * 100 : 0;
      scenario.averageDuration =
        scenario.total > 0 ? scenario.totalDuration / scenario.total : 0;
    });

    return scenarios;
  }

  /**
   * Aggregate performance data
   */
  aggregatePerformance(testResults) {
    const performance = {
      apiResponseTimes: [],
      websocketDeliveryTimes: [],
      memoryUsage: [],
      cpuUsage: [],
      thresholdViolations: 0,
    };

    testResults.forEach((result) => {
      if (result.metrics) {
        result.metrics.forEach((metric) => {
          switch (metric.metricType) {
            case "API_RESPONSE":
              performance.apiResponseTimes.push(metric.value);
              break;
            case "WEBSOCKET_DELIVERY":
              performance.websocketDeliveryTimes.push(metric.value);
              break;
            case "MEMORY_USAGE":
              performance.memoryUsage.push(metric.value);
              break;
            case "CPU_USAGE":
              performance.cpuUsage.push(metric.value);
              break;
          }

          if (!metric.isWithinThreshold) {
            performance.thresholdViolations++;
          }
        });
      }
    });

    // Calculate performance statistics
    performance.apiResponseTimeStats = this.calculateStats(
      performance.apiResponseTimes
    );
    performance.websocketDeliveryTimeStats = this.calculateStats(
      performance.websocketDeliveryTimes
    );
    performance.memoryUsageStats = this.calculateStats(performance.memoryUsage);
    performance.cpuUsageStats = this.calculateStats(performance.cpuUsage);

    return performance;
  }

  /**
   * Calculate statistics for array of values
   */
  calculateStats(values) {
    if (values.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);

    return {
      count: values.length,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Aggregate events
   */
  aggregateEvents(testResults) {
    const events = {
      total: 0,
      byType: {},
      bySource: {},
      byTarget: {},
      processingTimes: [],
    };

    testResults.forEach((result) => {
      if (result.testResult && result.testResult.websocketEvents) {
        result.testResult.websocketEvents.forEach((event) => {
          events.total++;
          events.processingTimes.push(event.deliveryTime || 0);

          // Group by type
          if (!events.byType[event.event]) {
            events.byType[event.event] = 0;
          }
          events.byType[event.event]++;

          // Group by source (assuming WebSocket events)
          if (!events.bySource["WEBSOCKET"]) {
            events.bySource["WEBSOCKET"] = 0;
          }
          events.bySource["WEBSOCKET"]++;

          // Group by target (assuming API)
          if (!events.byTarget["API"]) {
            events.byTarget["API"] = 0;
          }
          events.byTarget["API"]++;
        });
      }
    });

    // Calculate event statistics
    events.processingTimeStats = this.calculateStats(events.processingTimes);

    return events;
  }

  /**
   * Aggregate validation results
   */
  aggregateValidation(testResults) {
    const validation = {
      total: 0,
      passed: 0,
      failed: 0,
      byType: {},
      errors: [],
    };

    testResults.forEach((result) => {
      if (result.validationResults) {
        result.validationResults.forEach((validationResult) => {
          validation.total++;

          if (validationResult.passed) {
            validation.passed++;
          } else {
            validation.failed++;
            validation.errors.push(...validationResult.errors);
          }

          // Group by type
          if (!validation.byType[validationResult.type]) {
            validation.byType[validationResult.type] = {
              total: 0,
              passed: 0,
              failed: 0,
            };
          }

          validation.byType[validationResult.type].total++;
          if (validationResult.passed) {
            validation.byType[validationResult.type].passed++;
          } else {
            validation.byType[validationResult.type].failed++;
          }
        });
      }
    });

    // Calculate validation statistics
    validation.successRate =
      validation.total > 0 ? (validation.passed / validation.total) * 100 : 0;

    return validation;
  }

  /**
   * Aggregate errors
   */
  aggregateErrors(testResults) {
    const errors = {
      total: 0,
      byType: {},
      byScenario: {},
      messages: [],
    };

    testResults.forEach((result) => {
      if (!result.success && result.error) {
        errors.total++;
        errors.messages.push(result.error);

        // Group by scenario
        if (!errors.byScenario[result.scenarioId]) {
          errors.byScenario[result.scenarioId] = 0;
        }
        errors.byScenario[result.scenarioId]++;

        // Group by error type (simplified)
        const errorType = this.categorizeError(result.error);
        if (!errors.byType[errorType]) {
          errors.byType[errorType] = 0;
        }
        errors.byType[errorType]++;
      }
    });

    return errors;
  }

  /**
   * Categorize error type
   */
  categorizeError(errorMessage) {
    const message = errorMessage.toLowerCase();

    if (message.includes("timeout")) return "TIMEOUT";
    if (message.includes("connection")) return "CONNECTION";
    if (message.includes("authentication")) return "AUTHENTICATION";
    if (message.includes("validation")) return "VALIDATION";
    if (message.includes("performance")) return "PERFORMANCE";
    if (message.includes("network")) return "NETWORK";

    return "OTHER";
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(testResults) {
    const recommendations = [];
    const summary = this.calculateSummary(testResults);

    // Success rate recommendations
    if (summary.successRate < 95) {
      recommendations.push({
        type: "SUCCESS_RATE",
        priority: "HIGH",
        message: "Test success rate is below 95%",
        details: `Current success rate: ${summary.successRate.toFixed(2)}%`,
        action: "Review and fix failing test scenarios",
      });
    }

    // Performance recommendations
    const performance = this.aggregatePerformance(testResults);
    if (performance.thresholdViolations > 0) {
      recommendations.push({
        type: "PERFORMANCE",
        priority: "MEDIUM",
        message: "Performance threshold violations detected",
        details: `${performance.thresholdViolations} violations found`,
        action: "Review and optimize performance bottlenecks",
      });
    }

    // Duration recommendations
    if (summary.averageDuration > 30000) {
      recommendations.push({
        type: "DURATION",
        priority: "MEDIUM",
        message: "Average test duration is high",
        details: `Average duration: ${Math.round(summary.averageDuration)}ms`,
        action: "Optimize test execution time",
      });
    }

    // Error recommendations
    const errors = this.aggregateErrors(testResults);
    if (errors.total > 0) {
      recommendations.push({
        type: "ERRORS",
        priority: "HIGH",
        message: "Test errors detected",
        details: `${errors.total} errors found`,
        action: "Investigate and fix test errors",
      });
    }

    return recommendations;
  }

  /**
   * Generate report
   */
  async generateReport(aggregationId, templateName = "summary") {
    try {
      const aggregated = this.aggregatedResults.get(aggregationId);

      if (!aggregated) {
        throw new Error(`Aggregation not found: ${aggregationId}`);
      }

      const template = this.reportTemplates.get(templateName);

      if (!template) {
        throw new Error(`Report template not found: ${templateName}`);
      }

      const report = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        template: templateName,
        timestamp: new Date().toISOString(),
        aggregationId,
        metadata: {
          name: template.name,
          description: template.description,
          sections: template.sections,
        },
        data: {},
      };

      // Generate sections based on template
      template.sections.forEach((section) => {
        switch (section) {
          case "overview":
            report.data.overview = {
              summary: aggregated.summary,
              timestamp: aggregated.timestamp,
            };
            break;
          case "scenarios":
            report.data.scenarios = aggregated.scenarios;
            break;
          case "performance":
            report.data.performance = aggregated.performance;
            break;
          case "events":
            report.data.events = aggregated.events;
            break;
          case "validation":
            report.data.validation = aggregated.validation;
            break;
          case "errors":
            report.data.errors = aggregated.errors;
            break;
          case "recommendations":
            report.data.recommendations = aggregated.recommendations;
            break;
        }
      });

      this.emit("reportGenerated", { reportId: report.id, report });

      return { success: true, report };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generateReport",
        aggregationId,
      });
      throw error;
    }
  }

  /**
   * Export report
   */
  async exportReport(report, format = "json") {
    try {
      let exportedData;

      switch (format) {
        case "json":
          exportedData = JSON.stringify(report, null, 2);
          break;
        case "csv":
          exportedData = this.convertToCSV(report);
          break;
        case "html":
          exportedData = this.convertToHTML(report);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      this.emit("reportExported", { reportId: report.id, format });

      return { success: true, data: exportedData, format };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "exportReport" });
      throw error;
    }
  }

  /**
   * Convert report to CSV
   */
  convertToCSV(report) {
    // Simplified CSV conversion
    const lines = [];
    lines.push("Section,Key,Value");

    if (report.data.overview) {
      Object.entries(report.data.overview.summary).forEach(([key, value]) => {
        lines.push(`overview,${key},${value}`);
      });
    }

    return lines.join("\n");
  }

  /**
   * Convert report to HTML
   */
  convertToHTML(report) {
    // Simplified HTML conversion
    return `
      <html>
        <head>
          <title>Test Report - ${report.id}</title>
        </head>
        <body>
          <h1>Test Report</h1>
          <p>Generated: ${report.timestamp}</p>
          <pre>${JSON.stringify(report.data, null, 2)}</pre>
        </body>
      </html>
    `;
  }

  /**
   * Clear aggregated results
   */
  clearAggregatedResults() {
    this.aggregatedResults.clear();
    this.emit("aggregatedResultsCleared");
  }
}

module.exports = TestResultAggregator;

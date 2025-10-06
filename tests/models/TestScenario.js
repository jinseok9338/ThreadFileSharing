const { v4: uuidv4 } = require("uuid");

/**
 * TestScenario Entity Model
 *
 * Defines specific integration test cases covering API-WebSocket interaction patterns
 */
class TestScenario {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || `Test Scenario ${Date.now()}`;
    this.description = data.description || "Integration test scenario";
    this.type = data.type || "INTEGRATION";
    this.priority = data.priority || "MEDIUM";
    this.category = data.category || "general";
    this.apiEndpoints = data.apiEndpoints || [];
    this.websocketEvents = data.websocketEvents || [];
    this.expectedResults = data.expectedResults || {};
    this.timeout = data.timeout || 30000;
    this.retryCount = data.retryCount || 3;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Validate scenario data
   */
  validate() {
    const errors = [];

    // Name validation
    if (!this.name || this.name.trim().length === 0) {
      errors.push("Scenario name is required");
    }

    // Type validation
    const validTypes = ["API_ONLY", "WEBSOCKET_ONLY", "INTEGRATION"];
    if (!validTypes.includes(this.type)) {
      errors.push(`Invalid type. Must be one of: ${validTypes.join(", ")}`);
    }

    // Priority validation
    const validPriorities = ["HIGH", "MEDIUM", "LOW"];
    if (!validPriorities.includes(this.priority)) {
      errors.push(
        `Invalid priority. Must be one of: ${validPriorities.join(", ")}`
      );
    }

    // Timeout validation
    if (this.timeout < 1000 || this.timeout > 300000) {
      errors.push("Timeout must be between 1000ms and 300000ms");
    }

    // Retry count validation
    if (this.retryCount < 0 || this.retryCount > 10) {
      errors.push("Retry count must be between 0 and 10");
    }

    // UUID validation
    if (!this.isValidUUID(this.id)) {
      errors.push("Invalid scenario ID format");
    }

    // API endpoints validation
    if (this.apiEndpoints.length === 0 && this.type !== "WEBSOCKET_ONLY") {
      errors.push(
        "API endpoints are required for non-WebSocket-only scenarios"
      );
    }

    // WebSocket events validation
    if (this.websocketEvents.length === 0 && this.type !== "API_ONLY") {
      errors.push("WebSocket events are required for non-API-only scenarios");
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
   * Update scenario data
   */
  update(data) {
    const allowedFields = [
      "name",
      "description",
      "type",
      "priority",
      "category",
      "apiEndpoints",
      "websocketEvents",
      "expectedResults",
      "timeout",
      "retryCount",
      "isActive",
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
      name: this.name,
      description: this.description,
      type: this.type,
      priority: this.priority,
      category: this.category,
      apiEndpoints: this.apiEndpoints,
      websocketEvents: this.websocketEvents,
      expectedResults: this.expectedResults,
      timeout: this.timeout,
      retryCount: this.retryCount,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }

  /**
   * Create scenario from template
   */
  static fromTemplate(template) {
    return new TestScenario({
      name: template.name,
      description: template.description,
      type: template.type,
      priority: template.priority,
      category: template.category,
      apiEndpoints: template.apiEndpoints,
      websocketEvents: template.websocketEvents,
      expectedResults: template.expectedResults,
      timeout: template.timeout,
      retryCount: template.retryCount,
    });
  }

  /**
   * Generate test scenarios
   */
  static generateTestScenarios() {
    const scenarios = [];

    // Authentication Integration Scenario
    scenarios.push(
      new TestScenario({
        name: "API-WebSocket Authentication Integration",
        description:
          "Test authentication flow between API and WebSocket connections",
        type: "INTEGRATION",
        priority: "HIGH",
        category: "auth",
        apiEndpoints: ["/auth/register", "/auth/login", "/websocket/connect"],
        websocketEvents: [
          "connection_established",
          "authentication_success",
          "user_joined_company",
        ],
        expectedResults: {
          apiResponseTime: "< 500ms",
          websocketDeliveryTime: "< 100ms",
          authenticationSuccess: true,
          connectionStability: true,
        },
        timeout: 30000,
        retryCount: 3,
      })
    );

    // Real-time Messaging Scenario
    scenarios.push(
      new TestScenario({
        name: "Real-time Messaging Integration",
        description: "Test real-time messaging between API and WebSocket",
        type: "INTEGRATION",
        priority: "HIGH",
        category: "messaging",
        apiEndpoints: [
          "/messages/send",
          "/messages/list",
          "/websocket/send_message",
        ],
        websocketEvents: [
          "message_received",
          "typing_indicator",
          "message_delivered",
        ],
        expectedResults: {
          apiResponseTime: "< 500ms",
          websocketDeliveryTime: "< 100ms",
          messageDelivery: true,
          realTimeSync: true,
        },
        timeout: 30000,
        retryCount: 3,
      })
    );

    // File Upload Scenario
    scenarios.push(
      new TestScenario({
        name: "File Upload Integration",
        description: "Test file upload with WebSocket progress updates",
        type: "INTEGRATION",
        priority: "MEDIUM",
        category: "file_upload",
        apiEndpoints: [
          "/files/upload/initiate",
          "/files/upload/chunk",
          "/files/upload/complete",
        ],
        websocketEvents: [
          "file_upload_progress",
          "file_upload_completed",
          "file_processed",
        ],
        expectedResults: {
          apiResponseTime: "< 500ms",
          websocketDeliveryTime: "< 100ms",
          uploadSuccess: true,
          progressUpdates: true,
        },
        timeout: 300000,
        retryCount: 2,
      })
    );

    // Performance Testing Scenario
    scenarios.push(
      new TestScenario({
        name: "Performance Benchmarking",
        description:
          "Test performance benchmarks for API and WebSocket operations",
        type: "INTEGRATION",
        priority: "HIGH",
        category: "performance",
        apiEndpoints: [
          "/auth/login",
          "/messages/send",
          "/files/upload/initiate",
        ],
        websocketEvents: [
          "connection_established",
          "message_received",
          "file_upload_progress",
        ],
        expectedResults: {
          apiResponseTime: "< 500ms",
          websocketDeliveryTime: "< 100ms",
          concurrentUsers: 100,
          memoryUsage: "< 50MB",
        },
        timeout: 60000,
        retryCount: 1,
      })
    );

    // Error Handling Scenario
    scenarios.push(
      new TestScenario({
        name: "Error Handling and Recovery",
        description: "Test error handling and recovery mechanisms",
        type: "INTEGRATION",
        priority: "MEDIUM",
        category: "error_handling",
        apiEndpoints: [
          "/auth/login",
          "/invalid/endpoint",
          "/websocket/connect",
        ],
        websocketEvents: ["error", "connection_recovered", "retry_attempt"],
        expectedResults: {
          errorHandling: true,
          recoveryTime: "< 30s",
          retrySuccess: true,
        },
        timeout: 30000,
        retryCount: 5,
      })
    );

    return scenarios;
  }

  /**
   * Compare scenarios
   */
  equals(other) {
    return this.id === other.id && this.name === other.name;
  }

  /**
   * Check if scenario is active
   */
  isActive() {
    return this.isActive === true;
  }

  /**
   * Activate scenario
   */
  activate() {
    this.isActive = true;
    return this;
  }

  /**
   * Deactivate scenario
   */
  deactivate() {
    this.isActive = false;
    return this;
  }

  /**
   * Check if scenario matches filters
   */
  matches(filters) {
    if (filters.category && this.category !== filters.category) {
      return false;
    }

    if (filters.priority && this.priority !== filters.priority) {
      return false;
    }

    if (filters.type && this.type !== filters.type) {
      return false;
    }

    if (filters.isActive !== undefined && this.isActive !== filters.isActive) {
      return false;
    }

    if (
      filters.name &&
      !this.name.toLowerCase().includes(filters.name.toLowerCase())
    ) {
      return false;
    }

    return true;
  }

  /**
   * Get scenario summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      priority: this.priority,
      category: this.category,
      isActive: this.isActive,
      apiEndpointsCount: this.apiEndpoints.length,
      websocketEventsCount: this.websocketEvents.length,
      timeout: this.timeout,
      retryCount: this.retryCount,
    };
  }

  /**
   * Get scenario details
   */
  getDetails() {
    return {
      ...this.getSummary(),
      description: this.description,
      apiEndpoints: this.apiEndpoints,
      websocketEvents: this.websocketEvents,
      expectedResults: this.expectedResults,
      createdAt: this.createdAt,
    };
  }

  /**
   * Check if scenario is ready for execution
   */
  isReadyForExecution() {
    const validation = this.validate();
    return validation.isValid && this.isActive;
  }

  /**
   * Get execution requirements
   */
  getExecutionRequirements() {
    return {
      apiEndpoints: this.apiEndpoints,
      websocketEvents: this.websocketEvents,
      timeout: this.timeout,
      retryCount: this.retryCount,
      expectedResults: this.expectedResults,
    };
  }

  /**
   * Clone scenario
   */
  clone() {
    return new TestScenario({
      name: `${this.name} (Copy)`,
      description: this.description,
      type: this.type,
      priority: this.priority,
      category: this.category,
      apiEndpoints: [...this.apiEndpoints],
      websocketEvents: [...this.websocketEvents],
      expectedResults: { ...this.expectedResults },
      timeout: this.timeout,
      retryCount: this.retryCount,
      isActive: this.isActive,
    });
  }
}

module.exports = TestScenario;

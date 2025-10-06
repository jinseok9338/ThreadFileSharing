const { v4: uuidv4 } = require("uuid");
const { EventEmitter } = require("events");
const TestUser = require("../models/TestUser");
const TestScenario = require("../models/TestScenario");

/**
 * Test Data Generator for Dynamic Test Scenarios
 *
 * Generates dynamic test data for comprehensive integration testing
 */
class TestDataGenerator extends EventEmitter {
  constructor() {
    super();
    this.generatedData = new Map();
    this.generationCount = 0;
  }

  /**
   * Initialize generator
   */
  async initialize() {
    try {
      this.emit("initialized", { service: "TestDataGenerator" });
      return { success: true };
    } catch (error) {
      this.emit("error", { error: error.message });
      throw error;
    }
  }

  /**
   * Generate test users
   */
  generateTestUsers(count = 5, options = {}) {
    try {
      const users = [];
      const roles = options.roles || ["OWNER", "ADMIN", "MEMBER", "GUEST"];
      const companies = options.companies || [uuidv4()];

      for (let i = 0; i < count; i++) {
        const user = new TestUser({
          email: options.emailPrefix
            ? `${options.emailPrefix}-${i + 1}@example.com`
            : `test-user-${Date.now()}-${i + 1}@example.com`,
          password: options.password || "testpassword123",
          fullName: options.fullNamePrefix
            ? `${options.fullNamePrefix} ${i + 1}`
            : `Test User ${i + 1}`,
          companyId: companies[i % companies.length],
          role: roles[i % roles.length],
        });

        users.push(user);
      }

      const generationId = `users_${Date.now()}`;
      this.generatedData.set(generationId, { type: "users", data: users });
      this.generationCount++;

      return { success: true, users, generationId };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generateTestUsers",
      });
      throw error;
    }
  }

  /**
   * Generate test scenarios
   */
  generateTestScenarios(count = 3, options = {}) {
    try {
      const scenarios = [];
      const categories = options.categories || [
        "auth",
        "messaging",
        "file_upload",
      ];
      const priorities = options.priorities || ["HIGH", "MEDIUM", "LOW"];
      const types = options.types || [
        "INTEGRATION",
        "API_ONLY",
        "WEBSOCKET_ONLY",
      ];

      for (let i = 0; i < count; i++) {
        const scenario = new TestScenario({
          name: options.namePrefix
            ? `${options.namePrefix} ${i + 1}`
            : `Generated Test Scenario ${i + 1}`,
          description: options.descriptionPrefix
            ? `${options.descriptionPrefix} ${i + 1}`
            : `Generated test scenario for integration testing ${i + 1}`,
          type: types[i % types.length],
          priority: priorities[i % priorities.length],
          category: categories[i % categories.length],
          apiEndpoints: this.generateAPIEndpoints(
            categories[i % categories.length]
          ),
          websocketEvents: this.generateWebSocketEvents(
            categories[i % categories.length]
          ),
          expectedResults: this.generateExpectedResults(
            categories[i % categories.length]
          ),
          timeout: options.timeout || 30000,
          retryCount: options.retryCount || 3,
        });

        scenarios.push(scenario);
      }

      const generationId = `scenarios_${Date.now()}`;
      this.generatedData.set(generationId, {
        type: "scenarios",
        data: scenarios,
      });
      this.generationCount++;

      return { success: true, scenarios, generationId };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generateTestScenarios",
      });
      throw error;
    }
  }

  /**
   * Generate API endpoints based on category
   */
  generateAPIEndpoints(category) {
    const endpointTemplates = {
      auth: ["/auth/register", "/auth/login", "/auth/logout", "/auth/refresh"],
      messaging: [
        "/messages/send",
        "/messages/list",
        "/messages/delete",
        "/messages/update",
      ],
      file_upload: [
        "/files/upload/initiate",
        "/files/upload/chunk",
        "/files/upload/complete",
        "/files/delete",
      ],
      performance: ["/auth/login", "/messages/send", "/files/upload/initiate"],
      error_handling: ["/auth/login", "/invalid/endpoint", "/internal/error"],
    };

    return endpointTemplates[category] || endpointTemplates.auth;
  }

  /**
   * Generate WebSocket events based on category
   */
  generateWebSocketEvents(category) {
    const eventTemplates = {
      auth: [
        "connection_established",
        "authentication_success",
        "user_joined_company",
      ],
      messaging: ["message_received", "typing_indicator", "message_delivered"],
      file_upload: [
        "file_upload_progress",
        "file_upload_completed",
        "file_processed",
      ],
      performance: [
        "connection_established",
        "message_received",
        "file_upload_progress",
      ],
      error_handling: ["error", "connection_recovered", "retry_attempt"],
    };

    return eventTemplates[category] || eventTemplates.auth;
  }

  /**
   * Generate expected results based on category
   */
  generateExpectedResults(category) {
    const resultTemplates = {
      auth: {
        apiResponseTime: "< 500ms",
        websocketDeliveryTime: "< 100ms",
        authenticationSuccess: true,
        connectionStability: true,
      },
      messaging: {
        apiResponseTime: "< 500ms",
        websocketDeliveryTime: "< 100ms",
        messageDelivery: true,
        realTimeSync: true,
      },
      file_upload: {
        apiResponseTime: "< 500ms",
        websocketDeliveryTime: "< 100ms",
        uploadSuccess: true,
        progressUpdates: true,
      },
      performance: {
        apiResponseTime: "< 500ms",
        websocketDeliveryTime: "< 100ms",
        concurrentUsers: 100,
        memoryUsage: "< 50MB",
      },
      error_handling: {
        errorHandling: true,
        recoveryTime: "< 30s",
        retrySuccess: true,
      },
    };

    return resultTemplates[category] || resultTemplates.auth;
  }

  /**
   * Generate test messages
   */
  generateTestMessages(count = 10, options = {}) {
    try {
      const messages = [];
      const messageTypes = options.messageTypes || ["TEXT", "SYSTEM"];
      const chatroomId = options.chatroomId || uuidv4();
      const threadId = options.threadId || uuidv4();

      const sampleMessages = [
        "Hello, this is a test message for integration testing.",
        "This is a longer test message to validate message handling with more content and ensure proper WebSocket event delivery and API synchronization.",
        "Short msg",
        "This message contains special characters: !@#$%^&*()_+-=[]{}|;':\",./<>?",
        "Message with numbers: 1234567890",
        "Unicode message: 🌟 Hello World! 🚀",
        "Message with line breaks:\nLine 1\nLine 2\nLine 3",
        'JSON-like message: {"key": "value", "number": 42}',
        "Message with URLs: https://example.com and http://test.org",
        "Final test message for comprehensive validation.",
      ];

      for (let i = 0; i < count; i++) {
        const message = {
          id: uuidv4(),
          content: options.customMessages
            ? options.customMessages[i % options.customMessages.length]
            : sampleMessages[i % sampleMessages.length],
          messageType: messageTypes[i % messageTypes.length],
          chatroomId,
          threadId,
          userId: options.userId || uuidv4(),
          createdAt: new Date(Date.now() - (count - i) * 1000), // Stagger timestamps
        };

        messages.push(message);
      }

      const generationId = `messages_${Date.now()}`;
      this.generatedData.set(generationId, {
        type: "messages",
        data: messages,
      });
      this.generationCount++;

      return { success: true, messages, generationId };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generateTestMessages",
      });
      throw error;
    }
  }

  /**
   * Generate test files
   */
  generateTestFiles(count = 5, options = {}) {
    try {
      const files = [];
      const fileTypes = options.fileTypes || [
        { name: "document.pdf", mimeType: "application/pdf", size: 1048576 },
        { name: "image.jpg", mimeType: "image/jpeg", size: 2097152 },
        { name: "text.txt", mimeType: "text/plain", size: 512000 },
        {
          name: "spreadsheet.xlsx",
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          size: 1572864,
        },
        {
          name: "presentation.pptx",
          mimeType:
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          size: 3145728,
        },
      ];

      for (let i = 0; i < count; i++) {
        const fileType = fileTypes[i % fileTypes.length];
        const file = {
          id: uuidv4(),
          fileName: options.fileNamePrefix
            ? `${options.fileNamePrefix}-${i + 1}.${fileType.name
                .split(".")
                .pop()}`
            : `test-${fileType.name}`,
          originalName: fileType.name,
          mimeType: fileType.mimeType,
          sizeBytes: options.sizeBytes || fileType.size,
          hash: this.generateFileHash(),
          storageKey: `test-files/${uuidv4()}`,
          storageBucket: options.bucket || "test-bucket",
          downloadUrl: `https://example.com/files/${uuidv4()}`,
          metadata: {
            uploadedBy: options.userId || uuidv4(),
            uploadedAt: new Date(),
            testFile: true,
          },
          isProcessed:
            options.isProcessed !== undefined ? options.isProcessed : true,
          processingStatus: "COMPLETED",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        files.push(file);
      }

      const generationId = `files_${Date.now()}`;
      this.generatedData.set(generationId, { type: "files", data: files });
      this.generationCount++;

      return { success: true, files, generationId };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generateTestFiles",
      });
      throw error;
    }
  }

  /**
   * Generate file hash
   */
  generateFileHash() {
    // Simulate SHA-256 hash
    const chars = "0123456789abcdef";
    let hash = "";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  /**
   * Generate performance test data
   */
  generatePerformanceTestData(options = {}) {
    try {
      const performanceData = {
        concurrentUsers: options.concurrentUsers || 100,
        testDuration: options.testDuration || 30000,
        operations: options.operations || [
          { name: "login", type: "API", weight: 1 },
          { name: "send_message", type: "WEBSOCKET", weight: 2 },
          { name: "file_upload", type: "API", weight: 1 },
          { name: "typing_indicator", type: "WEBSOCKET", weight: 3 },
        ],
        thresholds: options.thresholds || {
          apiResponseTime: 500,
          websocketDeliveryTime: 100,
          memoryUsage: 50,
          cpuUsage: 80,
        },
        loadPattern: options.loadPattern || "linear", // linear, exponential, step
      };

      const generationId = `performance_${Date.now()}`;
      this.generatedData.set(generationId, {
        type: "performance",
        data: performanceData,
      });
      this.generationCount++;

      return { success: true, performanceData, generationId };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generatePerformanceTestData",
      });
      throw error;
    }
  }

  /**
   * Generate error test data
   */
  generateErrorTestData(options = {}) {
    try {
      const errorData = {
        errorTypes: options.errorTypes || [
          { type: "TIMEOUT", probability: 0.1, message: "Request timeout" },
          {
            type: "CONNECTION",
            probability: 0.05,
            message: "Connection failed",
          },
          {
            type: "AUTHENTICATION",
            probability: 0.02,
            message: "Authentication failed",
          },
          {
            type: "VALIDATION",
            probability: 0.08,
            message: "Validation error",
          },
          {
            type: "PERFORMANCE",
            probability: 0.03,
            message: "Performance threshold exceeded",
          },
        ],
        recoveryStrategies: options.recoveryStrategies || [
          { strategy: "RETRY", maxAttempts: 3, delay: 1000 },
          { strategy: "FALLBACK", fallbackEndpoint: "/fallback" },
          { strategy: "CIRCUIT_BREAKER", threshold: 5, timeout: 30000 },
        ],
        errorInjection: options.errorInjection || {
          enabled: true,
          rate: 0.05, // 5% error rate
          patterns: ["random", "burst", "gradual"],
        },
      };

      const generationId = `errors_${Date.now()}`;
      this.generatedData.set(generationId, { type: "errors", data: errorData });
      this.generationCount++;

      return { success: true, errorData, generationId };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generateErrorTestData",
      });
      throw error;
    }
  }

  /**
   * Generate comprehensive test dataset
   */
  generateComprehensiveDataset(options = {}) {
    try {
      const dataset = {
        users: this.generateTestUsers(
          options.userCount || 10,
          options.userOptions
        ),
        scenarios: this.generateTestScenarios(
          options.scenarioCount || 5,
          options.scenarioOptions
        ),
        messages: this.generateTestMessages(
          options.messageCount || 20,
          options.messageOptions
        ),
        files: this.generateTestFiles(
          options.fileCount || 8,
          options.fileOptions
        ),
        performance: this.generatePerformanceTestData(
          options.performanceOptions
        ),
        errors: this.generateErrorTestData(options.errorOptions),
      };

      const generationId = `comprehensive_${Date.now()}`;
      this.generatedData.set(generationId, {
        type: "comprehensive",
        data: dataset,
      });
      this.generationCount++;

      return { success: true, dataset, generationId };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "generateComprehensiveDataset",
      });
      throw error;
    }
  }

  /**
   * Get generated data
   */
  getGeneratedData(generationId) {
    const data = this.generatedData.get(generationId);

    if (!data) {
      throw new Error(`Generated data not found: ${generationId}`);
    }

    return { success: true, data };
  }

  /**
   * List all generated data
   */
  listGeneratedData() {
    const data = Array.from(this.generatedData.entries()).map(([id, item]) => ({
      id,
      type: item.type,
      dataCount: Array.isArray(item.data) ? item.data.length : 1,
      generatedAt: new Date(parseInt(id.split("_")[1])),
    }));

    return { success: true, data, count: data.length };
  }

  /**
   * Clear generated data
   */
  clearGeneratedData(generationId = null) {
    if (generationId) {
      this.generatedData.delete(generationId);
    } else {
      this.generatedData.clear();
    }

    this.emit("generatedDataCleared", { generationId });
  }

  /**
   * Get generation statistics
   */
  getGenerationStatistics() {
    const data = Array.from(this.generatedData.values());

    const statistics = {
      totalGenerations: this.generationCount,
      activeGenerations: data.length,
      byType: {},
    };

    data.forEach((item) => {
      if (!statistics.byType[item.type]) {
        statistics.byType[item.type] = 0;
      }
      statistics.byType[item.type]++;
    });

    return { success: true, statistics };
  }
}

module.exports = TestDataGenerator;

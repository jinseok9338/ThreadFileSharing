const { v4: uuidv4 } = require("uuid");

/**
 * IntegrationEvent Entity Model
 *
 * Represents real-time events that should be synchronized between API operations and WebSocket broadcasting
 */
class IntegrationEvent {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.eventType = data.eventType || "unknown";
    this.source = data.source || "API";
    this.target = data.target || "WEBSOCKET";
    this.userId = data.userId || null;
    this.resourceId = data.resourceId || null;
    this.resourceType = data.resourceType || "unknown";
    this.eventData = data.eventData || {};
    this.timestamp = data.timestamp || new Date();
    this.isProcessed =
      data.isProcessed !== undefined ? data.isProcessed : false;
    this.processingTime = data.processingTime || 0;
    this.retryCount = data.retryCount || 0;
    this.errorMessage = data.errorMessage || null;
  }

  /**
   * Validate event data
   */
  validate() {
    const errors = [];

    // Event type validation
    if (!this.eventType || this.eventType.trim().length === 0) {
      errors.push("Event type is required");
    }

    // Source validation
    const validSources = ["API", "WEBSOCKET"];
    if (!validSources.includes(this.source)) {
      errors.push(`Invalid source. Must be one of: ${validSources.join(", ")}`);
    }

    // Target validation
    const validTargets = ["API", "WEBSOCKET"];
    if (!validTargets.includes(this.target)) {
      errors.push(`Invalid target. Must be one of: ${validTargets.join(", ")}`);
    }

    // Source and target must be different
    if (this.source === this.target) {
      errors.push("Source and target must be different");
    }

    // UUID validation
    if (!this.isValidUUID(this.id)) {
      errors.push("Invalid event ID format");
    }

    if (this.userId && !this.isValidUUID(this.userId)) {
      errors.push("Invalid user ID format");
    }

    if (this.resourceId && !this.isValidUUID(this.resourceId)) {
      errors.push("Invalid resource ID format");
    }

    // Processing time validation
    if (this.processingTime < 0) {
      errors.push("Processing time must be non-negative");
    }

    // Retry count validation
    if (this.retryCount < 0) {
      errors.push("Retry count must be non-negative");
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
   * Update event data
   */
  update(data) {
    const allowedFields = [
      "eventType",
      "source",
      "target",
      "userId",
      "resourceId",
      "resourceType",
      "eventData",
      "timestamp",
      "isProcessed",
      "processingTime",
      "retryCount",
      "errorMessage",
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
      eventType: this.eventType,
      source: this.source,
      target: this.target,
      userId: this.userId,
      resourceId: this.resourceId,
      resourceType: this.resourceType,
      eventData: this.eventData,
      timestamp: this.timestamp,
      isProcessed: this.isProcessed,
      processingTime: this.processingTime,
      retryCount: this.retryCount,
      errorMessage: this.errorMessage,
    };
  }

  /**
   * Create event from API operation
   */
  static fromAPIOperation(operation, userId, resourceId, resourceType) {
    return new IntegrationEvent({
      eventType: operation.eventType || "api_operation",
      source: "API",
      target: "WEBSOCKET",
      userId,
      resourceId,
      resourceType,
      eventData: {
        operation: operation.operation || "unknown",
        endpoint: operation.endpoint,
        method: operation.method,
        data: operation.data,
        response: operation.response,
      },
    });
  }

  /**
   * Create event from WebSocket event
   */
  static fromWebSocketEvent(event, userId, resourceId, resourceType) {
    return new IntegrationEvent({
      eventType: event.eventType || event.event || "websocket_event",
      source: "WEBSOCKET",
      target: "API",
      userId,
      resourceId,
      resourceType,
      eventData: {
        event: event.event,
        data: event.data,
        room: event.room,
        socketId: event.socketId,
      },
    });
  }

  /**
   * Generate test events
   */
  static generateTestEvents() {
    const events = [];

    // Authentication events
    events.push(
      new IntegrationEvent({
        eventType: "user_authenticated",
        source: "API",
        target: "WEBSOCKET",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        resourceId: "123e4567-e89b-12d3-a456-426614174000",
        resourceType: "user",
        eventData: {
          operation: "login",
          endpoint: "/auth/login",
          method: "POST",
          success: true,
        },
      })
    );

    // Message events
    events.push(
      new IntegrationEvent({
        eventType: "message_sent",
        source: "API",
        target: "WEBSOCKET",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        resourceId: "456e7890-e89b-12d3-a456-426614174001",
        resourceType: "message",
        eventData: {
          operation: "send_message",
          endpoint: "/messages/send",
          method: "POST",
          content: "Test message",
          messageType: "TEXT",
        },
      })
    );

    // File upload events
    events.push(
      new IntegrationEvent({
        eventType: "file_uploaded",
        source: "API",
        target: "WEBSOCKET",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        resourceId: "789e0123-e89b-12d3-a456-426614174002",
        resourceType: "file",
        eventData: {
          operation: "upload_file",
          endpoint: "/files/upload/complete",
          method: "POST",
          fileName: "test-file.pdf",
          fileSize: 1048576,
        },
      })
    );

    // WebSocket connection events
    events.push(
      new IntegrationEvent({
        eventType: "connection_established",
        source: "WEBSOCKET",
        target: "API",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        resourceId: "123e4567-e89b-12d3-a456-426614174000",
        resourceType: "connection",
        eventData: {
          event: "connection_established",
          socketId: "socket-123",
          room: "company-123",
        },
      })
    );

    return events;
  }

  /**
   * Compare events
   */
  equals(other) {
    return this.id === other.id && this.eventType === other.eventType;
  }

  /**
   * Check if event is processed
   */
  isProcessed() {
    return this.isProcessed === true;
  }

  /**
   * Mark event as processed
   */
  markAsProcessed(processingTime = 0) {
    this.isProcessed = true;
    this.processingTime = processingTime;
    this.errorMessage = null;
    return this;
  }

  /**
   * Mark event as failed
   */
  markAsFailed(error, processingTime = 0) {
    this.isProcessed = false;
    this.processingTime = processingTime;
    this.errorMessage = error.message || error;
    this.retryCount++;
    return this;
  }

  /**
   * Check if event can be retried
   */
  canRetry(maxRetries = 3) {
    return this.retryCount < maxRetries && !this.isProcessed;
  }

  /**
   * Get event summary
   */
  getSummary() {
    return {
      id: this.id,
      eventType: this.eventType,
      source: this.source,
      target: this.target,
      userId: this.userId,
      resourceId: this.resourceId,
      resourceType: this.resourceType,
      isProcessed: this.isProcessed,
      processingTime: this.processingTime,
      retryCount: this.retryCount,
      hasError: !!this.errorMessage,
      timestamp: this.timestamp,
    };
  }

  /**
   * Get event details
   */
  getDetails() {
    return {
      ...this.getSummary(),
      eventData: this.eventData,
      errorMessage: this.errorMessage,
    };
  }

  /**
   * Check if event matches filters
   */
  matches(filters) {
    if (filters.eventType && this.eventType !== filters.eventType) {
      return false;
    }

    if (filters.source && this.source !== filters.source) {
      return false;
    }

    if (filters.target && this.target !== filters.target) {
      return false;
    }

    if (filters.userId && this.userId !== filters.userId) {
      return false;
    }

    if (filters.resourceType && this.resourceType !== filters.resourceType) {
      return false;
    }

    if (
      filters.isProcessed !== undefined &&
      this.isProcessed !== filters.isProcessed
    ) {
      return false;
    }

    if (
      filters.hasError !== undefined &&
      !!this.errorMessage !== filters.hasError
    ) {
      return false;
    }

    return true;
  }

  /**
   * Get processing status
   */
  getProcessingStatus() {
    if (this.isProcessed) {
      return "PROCESSED";
    } else if (this.errorMessage) {
      return "FAILED";
    } else {
      return "PENDING";
    }
  }

  /**
   * Get event age in milliseconds
   */
  getAge() {
    return Date.now() - new Date(this.timestamp).getTime();
  }

  /**
   * Check if event is stale
   */
  isStale(maxAge = 300000) {
    // 5 minutes default
    return this.getAge() > maxAge;
  }

  /**
   * Clone event
   */
  clone() {
    return new IntegrationEvent({
      eventType: this.eventType,
      source: this.source,
      target: this.target,
      userId: this.userId,
      resourceId: this.resourceId,
      resourceType: this.resourceType,
      eventData: { ...this.eventData },
      timestamp: this.timestamp,
      isProcessed: this.isProcessed,
      processingTime: this.processingTime,
      retryCount: this.retryCount,
      errorMessage: this.errorMessage,
    });
  }
}

module.exports = IntegrationEvent;

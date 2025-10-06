const IntegrationEvent = require("../models/IntegrationEvent");
const { EventEmitter } = require("events");

/**
 * Integration Event Tracking Service
 *
 * Tracks and manages integration events between API and WebSocket operations
 */
class IntegrationEventService extends EventEmitter {
  constructor() {
    super();
    this.events = new Map();
    this.eventQueue = [];
    this.processingQueue = [];
    this.isProcessing = false;
  }

  /**
   * Initialize service
   */
  async initialize() {
    try {
      this.emit("initialized", { service: "IntegrationEventService" });
      return { success: true };
    } catch (error) {
      this.emit("error", { error: error.message });
      throw error;
    }
  }

  /**
   * Create integration event
   */
  async createEvent(data) {
    try {
      const event = new IntegrationEvent(data);
      const validation = event.validate();

      if (!validation.isValid) {
        throw new Error(`Invalid event data: ${validation.errors.join(", ")}`);
      }

      this.events.set(event.id, event);
      this.eventQueue.push(event);

      this.emit("eventCreated", { eventId: event.id, event });

      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processEventQueue();
      }

      return { success: true, event };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "createEvent" });
      throw error;
    }
  }

  /**
   * Create event from API operation
   */
  async createEventFromAPIOperation(
    operation,
    userId,
    resourceId,
    resourceType
  ) {
    try {
      const event = IntegrationEvent.fromAPIOperation(
        operation,
        userId,
        resourceId,
        resourceType
      );

      this.events.set(event.id, event);
      this.eventQueue.push(event);

      this.emit("apiEventCreated", { eventId: event.id, event });

      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processEventQueue();
      }

      return { success: true, event };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "createEventFromAPIOperation",
      });
      throw error;
    }
  }

  /**
   * Create event from WebSocket event
   */
  async createEventFromWebSocketEvent(
    wsEvent,
    userId,
    resourceId,
    resourceType
  ) {
    try {
      const event = IntegrationEvent.fromWebSocketEvent(
        wsEvent,
        userId,
        resourceId,
        resourceType
      );

      this.events.set(event.id, event);
      this.eventQueue.push(event);

      this.emit("websocketEventCreated", { eventId: event.id, event });

      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processEventQueue();
      }

      return { success: true, event };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "createEventFromWebSocketEvent",
      });
      throw error;
    }
  }

  /**
   * Process event queue
   */
  async processEventQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        this.processingQueue.push(event);

        try {
          const startTime = Date.now();
          await this.processEvent(event);
          const processingTime = Date.now() - startTime;

          event.markAsProcessed(processingTime);
          this.events.set(event.id, event);

          this.emit("eventProcessed", {
            eventId: event.id,
            event,
            processingTime,
          });
        } catch (error) {
          const processingTime = Date.now() - Date.parse(event.timestamp);
          event.markAsFailed(error, processingTime);
          this.events.set(event.id, event);

          this.emit("eventProcessingFailed", {
            eventId: event.id,
            event,
            error: error.message,
          });
        }

        // Remove from processing queue
        const index = this.processingQueue.indexOf(event);
        if (index > -1) {
          this.processingQueue.splice(index, 1);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual event
   */
  async processEvent(event) {
    try {
      // Simulate event processing based on event type
      switch (event.eventType) {
        case "user_authenticated":
          await this.processAuthenticationEvent(event);
          break;
        case "message_sent":
          await this.processMessageEvent(event);
          break;
        case "file_uploaded":
          await this.processFileUploadEvent(event);
          break;
        case "connection_established":
          await this.processConnectionEvent(event);
          break;
        default:
          await this.processGenericEvent(event);
      }
    } catch (error) {
      throw new Error(
        `Failed to process event ${event.eventType}: ${error.message}`
      );
    }
  }

  /**
   * Process authentication event
   */
  async processAuthenticationEvent(event) {
    // Simulate authentication event processing
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Emit corresponding WebSocket event
    this.emit("websocketEvent", {
      event: "authentication_success",
      data: {
        userId: event.userId,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Process message event
   */
  async processMessageEvent(event) {
    // Simulate message event processing
    await new Promise((resolve) => setTimeout(resolve, 75));

    // Emit corresponding WebSocket event
    this.emit("websocketEvent", {
      event: "message_received",
      data: {
        messageId: event.resourceId,
        userId: event.userId,
        content: event.eventData.content,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Process file upload event
   */
  async processFileUploadEvent(event) {
    // Simulate file upload event processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Emit corresponding WebSocket event
    this.emit("websocketEvent", {
      event: "file_upload_completed",
      data: {
        fileId: event.resourceId,
        userId: event.userId,
        fileName: event.eventData.fileName,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Process connection event
   */
  async processConnectionEvent(event) {
    // Simulate connection event processing
    await new Promise((resolve) => setTimeout(resolve, 25));

    // Emit corresponding API event
    this.emit("apiEvent", {
      endpoint: "/websocket/connection/established",
      method: "POST",
      data: {
        userId: event.userId,
        socketId: event.eventData.socketId,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Process generic event
   */
  async processGenericEvent(event) {
    // Simulate generic event processing
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Emit corresponding event based on source/target
    if (event.source === "API" && event.target === "WEBSOCKET") {
      this.emit("websocketEvent", {
        event: event.eventType,
        data: {
          ...event.eventData,
          timestamp: new Date(),
        },
      });
    } else if (event.source === "WEBSOCKET" && event.target === "API") {
      this.emit("apiEvent", {
        endpoint: `/websocket/${event.eventType}`,
        method: "POST",
        data: {
          ...event.eventData,
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId) {
    try {
      const event = this.events.get(eventId);

      if (!event) {
        throw new Error(`Event not found: ${eventId}`);
      }

      return { success: true, event };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getEvent",
        eventId,
      });
      throw error;
    }
  }

  /**
   * List events with filters
   */
  async listEvents(filters = {}) {
    try {
      let events = Array.from(this.events.values());

      // Apply filters
      if (filters.eventType) {
        events = events.filter((e) => e.eventType === filters.eventType);
      }

      if (filters.source) {
        events = events.filter((e) => e.source === filters.source);
      }

      if (filters.target) {
        events = events.filter((e) => e.target === filters.target);
      }

      if (filters.userId) {
        events = events.filter((e) => e.userId === filters.userId);
      }

      if (filters.resourceType) {
        events = events.filter((e) => e.resourceType === filters.resourceType);
      }

      if (filters.isProcessed !== undefined) {
        events = events.filter((e) => e.isProcessed === filters.isProcessed);
      }

      if (filters.startTime) {
        events = events.filter(
          (e) => new Date(e.timestamp) >= new Date(filters.startTime)
        );
      }

      if (filters.endTime) {
        events = events.filter(
          (e) => new Date(e.timestamp) <= new Date(filters.endTime)
        );
      }

      const results = events.map((event) => event.getSummary());

      return { success: true, events: results, count: results.length };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "listEvents" });
      throw error;
    }
  }

  /**
   * Get event statistics
   */
  async getEventStatistics() {
    try {
      const events = Array.from(this.events.values());

      const statistics = {
        total: events.length,
        processed: events.filter((e) => e.isProcessed).length,
        pending: events.filter((e) => !e.isProcessed && !e.errorMessage).length,
        failed: events.filter((e) => e.errorMessage).length,
        queued: this.eventQueue.length,
        processing: this.processingQueue.length,
        byType: {},
        bySource: {},
        byTarget: {},
        averageProcessingTime: 0,
      };

      // Group by type
      events.forEach((event) => {
        if (!statistics.byType[event.eventType]) {
          statistics.byType[event.eventType] = 0;
        }
        statistics.byType[event.eventType]++;
      });

      // Group by source
      events.forEach((event) => {
        if (!statistics.bySource[event.source]) {
          statistics.bySource[event.source] = 0;
        }
        statistics.bySource[event.source]++;
      });

      // Group by target
      events.forEach((event) => {
        if (!statistics.byTarget[event.target]) {
          statistics.byTarget[event.target] = 0;
        }
        statistics.byTarget[event.target]++;
      });

      // Calculate average processing time
      const processedEvents = events.filter(
        (e) => e.isProcessed && e.processingTime > 0
      );
      if (processedEvents.length > 0) {
        const totalProcessingTime = processedEvents.reduce(
          (sum, e) => sum + e.processingTime,
          0
        );
        statistics.averageProcessingTime = Math.round(
          totalProcessingTime / processedEvents.length
        );
      }

      return { success: true, statistics };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getEventStatistics",
      });
      throw error;
    }
  }

  /**
   * Get synchronization status
   */
  async getSynchronizationStatus(userId, resourceId, resourceType) {
    try {
      const events = Array.from(this.events.values())
        .filter(
          (e) =>
            e.userId === userId &&
            e.resourceId === resourceId &&
            e.resourceType === resourceType
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const status = {
        userId,
        resourceId,
        resourceType,
        totalEvents: events.length,
        processedEvents: events.filter((e) => e.isProcessed).length,
        failedEvents: events.filter((e) => e.errorMessage).length,
        lastEventTime:
          events.length > 0 ? events[events.length - 1].timestamp : null,
        synchronizationRate: 0,
        isSynchronized: false,
      };

      // Calculate synchronization rate
      if (events.length > 0) {
        status.synchronizationRate =
          (status.processedEvents / events.length) * 100;
        status.isSynchronized =
          status.synchronizationRate === 100 && status.failedEvents === 0;
      }

      return { success: true, status };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "getSynchronizationStatus",
      });
      throw error;
    }
  }

  /**
   * Retry failed events
   */
  async retryFailedEvents(maxRetries = 3) {
    try {
      const failedEvents = Array.from(this.events.values()).filter(
        (e) => e.errorMessage && e.canRetry(maxRetries)
      );

      const retryResults = [];

      for (const event of failedEvents) {
        try {
          this.eventQueue.push(event);
          retryResults.push({ eventId: event.id, status: "queued" });
        } catch (error) {
          retryResults.push({
            eventId: event.id,
            status: "failed",
            error: error.message,
          });
        }
      }

      // Process queue if not already processing
      if (!this.isProcessing && this.eventQueue.length > 0) {
        this.processEventQueue();
      }

      this.emit("failedEventsRetried", { count: retryResults.length });

      return { success: true, retryResults, count: retryResults.length };
    } catch (error) {
      this.emit("error", {
        error: error.message,
        operation: "retryFailedEvents",
      });
      throw error;
    }
  }

  /**
   * Clear events
   */
  async clearEvents() {
    try {
      const count = this.events.size;
      this.events.clear();
      this.eventQueue.length = 0;
      this.processingQueue.length = 0;

      this.emit("eventsCleared", { count });

      return { success: true, clearedCount: count };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "clearEvents" });
      throw error;
    }
  }

  /**
   * Export events
   */
  async exportEvents(filters = {}) {
    try {
      const { events } = await this.listEvents(filters);

      return { success: true, events, count: events.length };
    } catch (error) {
      this.emit("error", { error: error.message, operation: "exportEvents" });
      throw error;
    }
  }
}

module.exports = IntegrationEventService;

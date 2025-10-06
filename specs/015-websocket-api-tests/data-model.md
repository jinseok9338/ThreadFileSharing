# Data Model: WebSocket and API Integration Scenario Testing

**Feature**: 015-websocket-api-tests  
**Date**: 2025-10-06

## Core Entities

### TestUser

**Purpose**: Represents authenticated users with different roles for comprehensive permission testing

**Attributes**:

- `id`: string (UUID) - Unique user identifier
- `email`: string - User email address
- `password`: string - User password (hashed)
- `fullName`: string - User's full name
- `companyId`: string (UUID) - Associated company ID
- `role`: enum (OWNER, ADMIN, MEMBER, GUEST) - User role in company
- `accessToken`: string - JWT access token
- `refreshToken`: string - JWT refresh token
- `isActive`: boolean - User account status
- `createdAt`: Date - Account creation timestamp
- `lastLoginAt`: Date - Last login timestamp

**Relationships**:

- Belongs to Company (many-to-one)
- Has many WebSocketConnections (one-to-many)
- Has many TestResults (one-to-many)

**Validation Rules**:

- Email must be unique across system
- Password must meet security requirements
- Role must be valid enum value
- Tokens must be valid JWT format

### TestScenario

**Purpose**: Defines specific integration test cases covering API-WebSocket interaction patterns

**Attributes**:

- `id`: string (UUID) - Unique scenario identifier
- `name`: string - Scenario name
- `description`: string - Scenario description
- `type`: enum (API_ONLY, WEBSOCKET_ONLY, INTEGRATION) - Test type
- `priority`: enum (HIGH, MEDIUM, LOW) - Test priority
- `category`: string - Test category (auth, messaging, file_upload, etc.)
- `apiEndpoints`: string[] - List of API endpoints involved
- `websocketEvents`: string[] - List of WebSocket events involved
- `expectedResults`: object - Expected test outcomes
- `timeout`: number - Test timeout in milliseconds
- `retryCount`: number - Maximum retry attempts
- `isActive`: boolean - Whether scenario is active
- `createdAt`: Date - Scenario creation timestamp

**Relationships**:

- Has many TestResults (one-to-many)
- Belongs to TestSuite (many-to-one)

**Validation Rules**:

- Name must be unique within category
- Timeout must be positive number
- Retry count must be non-negative
- API endpoints must be valid URL patterns
- WebSocket events must be valid event names

### TestResult

**Purpose**: Captures test execution outcomes, performance metrics, and validation results

**Attributes**:

- `id`: string (UUID) - Unique result identifier
- `scenarioId`: string (UUID) - Associated test scenario
- `userId`: string (UUID) - Test execution user
- `status`: enum (PASSED, FAILED, SKIPPED, ERROR) - Test execution status
- `startTime`: Date - Test execution start time
- `endTime`: Date - Test execution end time
- `duration`: number - Test execution duration in milliseconds
- `apiResponses`: object[] - API response data
- `websocketEvents`: object[] - WebSocket event data
- `performanceMetrics`: object - Performance measurements
- `errorDetails`: object - Error information if failed
- `validationResults`: object[] - Individual validation results
- `logs`: string[] - Test execution logs
- `createdAt`: Date - Result creation timestamp

**Relationships**:

- Belongs to TestScenario (many-to-one)
- Belongs to TestUser (many-to-one)

**Validation Rules**:

- Status must be valid enum value
- Duration must be positive if test completed
- Start time must be before end time
- Error details required if status is FAILED or ERROR

### IntegrationEvent

**Purpose**: Represents real-time events that should be synchronized between API operations and WebSocket broadcasting

**Attributes**:

- `id`: string (UUID) - Unique event identifier
- `eventType`: string - Event type (message_sent, file_uploaded, user_joined, etc.)
- `source`: enum (API, WEBSOCKET) - Event source
- `target`: enum (API, WEBSOCKET) - Event target
- `userId`: string (UUID) - User who triggered event
- `resourceId`: string (UUID) - Related resource ID
- `resourceType`: string - Resource type (chatroom, thread, file, etc.)
- `eventData`: object - Event payload data
- `timestamp`: Date - Event occurrence time
- `isProcessed`: boolean - Whether event was processed
- `processingTime`: number - Processing duration in milliseconds
- `retryCount`: number - Retry attempts for failed processing
- `errorMessage`: string - Error message if processing failed

**Relationships**:

- Belongs to TestUser (many-to-one)
- Has many TestResults (one-to-many)

**Validation Rules**:

- Event type must be valid enum value
- Source and target must be different
- Timestamp must be valid date
- Processing time must be positive if processed
- Retry count must be non-negative

### PerformanceMetric

**Purpose**: Tracks response times, throughput, and resource usage for both API and WebSocket operations

**Attributes**:

- `id`: string (UUID) - Unique metric identifier
- `testId`: string (UUID) - Associated test result
- `metricType`: enum (API_RESPONSE, WEBSOCKET_DELIVERY, MEMORY_USAGE, CPU_USAGE) - Metric type
- `operation`: string - Operation name (login, send_message, file_upload, etc.)
- `value`: number - Metric value
- `unit`: string - Metric unit (ms, bytes, percent, etc.)
- `threshold`: number - Expected threshold value
- `isWithinThreshold`: boolean - Whether metric meets threshold
- `timestamp`: Date - Metric collection time
- `context`: object - Additional context data
- `createdAt`: Date - Metric creation timestamp

**Relationships**:

- Belongs to TestResult (many-to-one)

**Validation Rules**:

- Metric type must be valid enum value
- Value must be positive number
- Unit must be valid measurement unit
- Threshold must be positive number
- Timestamp must be valid date

## State Transitions

### TestScenario States

```
DRAFT → ACTIVE → EXECUTING → COMPLETED
  ↓       ↓         ↓
FAILED ← ERROR ← TIMEOUT
```

### TestResult States

```
PENDING → RUNNING → PASSED
    ↓        ↓        ↓
  SKIPPED → FAILED → ERROR
```

### IntegrationEvent States

```
PENDING → PROCESSING → PROCESSED
    ↓         ↓           ↓
  FAILED ← RETRYING ← ERROR
```

## Business Rules

### Test Execution Rules

1. **Sequential Execution**: Tests must run in defined order to prevent race conditions
2. **Cleanup Requirement**: Each test must clean up its data after execution
3. **Isolation Requirement**: Tests must not interfere with each other
4. **Timeout Handling**: Tests exceeding timeout must be marked as failed
5. **Retry Logic**: Failed tests may be retried up to maximum retry count

### Performance Validation Rules

1. **API Response Time**: Must be under 500ms for all endpoints
2. **WebSocket Delivery**: Must be under 100ms for all events
3. **Concurrent Users**: Must support 100+ simultaneous connections
4. **Memory Usage**: Must not exceed baseline + 50MB
5. **Error Rate**: Must be under 1% for all operations

### Data Consistency Rules

1. **API-WebSocket Sync**: API operations must trigger corresponding WebSocket events
2. **Event Ordering**: Events must be delivered in correct chronological order
3. **State Synchronization**: Connection recovery must restore correct state
4. **Permission Consistency**: Permission changes must be immediately reflected
5. **Data Integrity**: No data corruption during concurrent operations

## Validation Constraints

### TestUser Constraints

- Email uniqueness across all test users
- Password strength requirements (minimum 8 characters, special characters)
- Role assignment validation (only valid roles)
- Token expiration handling (automatic refresh)

### TestScenario Constraints

- Scenario name uniqueness within category
- Timeout values must be reasonable (1s - 300s)
- Retry count must be limited (0-5 attempts)
- API endpoints must be valid and accessible
- WebSocket events must be defined in event schema

### TestResult Constraints

- Execution time must be positive
- Status transitions must be valid
- Error details required for failed tests
- Performance metrics must be within thresholds
- Log entries must be properly formatted

### IntegrationEvent Constraints

- Event type must be supported by system
- Source and target must be different systems
- Processing time must be reasonable
- Retry attempts must be limited
- Error messages must be descriptive

### PerformanceMetric Constraints

- Metric values must be positive numbers
- Units must be standard measurement units
- Thresholds must be achievable targets
- Collection timestamps must be accurate
- Context data must be relevant and complete

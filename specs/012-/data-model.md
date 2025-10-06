# Data Model: API Scenario Test Improvements

**Feature**: 012- API Scenario Test Improvements  
**Date**: 2025-01-05  
**Status**: Complete

## Test Data Entities

### TestScenario

Represents an individual test scenario that needs improvement

**Fields**:

- `id`: string - Unique identifier for the test scenario
- `name`: string - Descriptive name of the test scenario
- `file`: string - Path to the test file containing this scenario
- `currentExpectation`: TestExpectation - Current test expectation (may be incorrect)
- `actualBackendBehavior`: BackendBehavior - Actual backend implementation status
- `improvementType`: ImprovementType - Type of improvement needed
- `priority`: Priority - Priority level for improvement
- `dependencies`: string[] - Other test scenarios this depends on

**Validation Rules**:

- `name` must be non-empty and descriptive
- `file` must be a valid path to existing test file
- `priority` must be one of: HIGH, MEDIUM, LOW

**State Transitions**:

- `IDENTIFIED` → `ANALYZED` → `UPDATED` → `VALIDATED` → `COMPLETE`

### TestExpectation

Represents what a test currently expects from the backend

**Fields**:

- `statusCode`: number - Expected HTTP status code
- `responseSchema`: object - Expected response structure
- `errorType`: string - Expected error type (if error expected)
- `successData`: object - Expected success response data
- `validationRules`: ValidationRule[] - Specific validation rules

**Validation Rules**:

- `statusCode` must be a valid HTTP status code (100-599)
- `responseSchema` must be a valid JSON schema
- If `errorType` is set, `statusCode` should be 4xx or 5xx

### BackendBehavior

Represents the actual backend implementation behavior

**Fields**:

- `isImplemented`: boolean - Whether the feature is actually implemented
- `actualStatusCode`: number - Actual HTTP status code returned
- `actualResponseSchema`: object - Actual response structure
- `implementationStatus`: ImplementationStatus - Current implementation status
- `apiEndpoint`: string - The actual API endpoint
- `supportedMethods`: string[] - HTTP methods supported

**Validation Rules**:

- `actualStatusCode` must match `isImplemented` status
- `apiEndpoint` must be a valid API path
- `supportedMethods` must contain valid HTTP methods

### ImprovementType

Enum representing the type of improvement needed

**Values**:

- `EXPECTATION_UPDATE` - Update test expectation to match backend
- `ERROR_TO_SUCCESS` - Change from expecting error to expecting success
- `SUCCESS_TO_ERROR` - Change from expecting success to expecting error
- `SCHEMA_UPDATE` - Update response schema expectations
- `NEW_VALIDATION` - Add new validation for implemented feature
- `REMOVE_INVALID` - Remove tests for non-existent features

### Priority

Enum representing improvement priority

**Values**:

- `HIGH` - Business critical features (file management, user roles)
- `MEDIUM` - Important functionality (search, analytics)
- `LOW` - Nice-to-have features (debug endpoints, monitoring)

## Test Execution Context

### TestExecution

Represents a test execution session

**Fields**:

- `sessionId`: string - Unique session identifier
- `startTime`: Date - When the test session started
- `endTime`: Date - When the test session completed
- `scenarios`: TestScenario[] - Scenarios executed in this session
- `results`: TestResult[] - Results of each scenario execution
- `overallStatus`: TestStatus - Overall session status

**Validation Rules**:

- `startTime` must be before `endTime`
- `scenarios` must not be empty
- `results` length must match `scenarios` length

### TestResult

Represents the result of executing a single test scenario

**Fields**:

- `scenarioId`: string - ID of the executed scenario
- `status`: TestStatus - Execution status
- `executionTime`: number - Time taken to execute (ms)
- `actualResponse`: object - Actual response received
- `validationPassed`: boolean - Whether validation passed
- `errors`: string[] - Any errors encountered
- `improvements`: string[] - Improvements made during execution

**Validation Rules**:

- `executionTime` must be positive
- `validationPassed` must be boolean
- `errors` should be empty if `status` is SUCCESS

### TestStatus

Enum representing test execution status

**Values**:

- `SUCCESS` - Test passed with expected results
- `FAILURE` - Test failed with unexpected results
- `ERROR` - Test execution encountered an error
- `SKIPPED` - Test was skipped due to dependencies
- `IMPROVED` - Test was updated and now passes

## API Contract Entities

### APIContract

Represents the contract for a specific API endpoint

**Fields**:

- `endpoint`: string - API endpoint path
- `method`: string - HTTP method
- `requestSchema`: object - Expected request schema
- `responseSchema`: object - Expected response schema
- `statusCodes`: StatusCodeMapping[] - Mapping of status codes to responses
- `authenticationRequired`: boolean - Whether authentication is required
- `authorizationLevel`: AuthorizationLevel - Required authorization level

**Validation Rules**:

- `endpoint` must start with `/api/v1/`
- `method` must be valid HTTP method
- `requestSchema` and `responseSchema` must be valid JSON schemas
- `statusCodes` must include at least one mapping

### StatusCodeMapping

Maps HTTP status codes to response schemas

**Fields**:

- `statusCode`: number - HTTP status code
- `description`: string - Description of when this status is returned
- `responseSchema`: object - Response schema for this status
- `example`: object - Example response for this status

**Validation Rules**:

- `statusCode` must be valid HTTP status code
- `description` must be non-empty
- `responseSchema` must be valid JSON schema

### AuthorizationLevel

Enum representing authorization levels

**Values**:

- `PUBLIC` - No authentication required
- `AUTHENTICATED` - Valid JWT token required
- `COMPANY_MEMBER` - User must be member of company
- `ADMIN` - User must have admin role
- `OWNER` - User must have owner role

## Test Improvement Workflow

### ImprovementWorkflow

Represents the workflow for improving a test scenario

**Fields**:

- `workflowId`: string - Unique workflow identifier
- `scenarioId`: string - ID of scenario being improved
- `steps`: WorkflowStep[] - Steps in the improvement process
- `currentStep`: number - Current step index
- `status`: WorkflowStatus - Current workflow status

**State Transitions**:

- `INITIATED` → `ANALYZING` → `UPDATING` → `VALIDATING` → `COMPLETED`
- `ANALYZING` → `BLOCKED` (if dependencies not met)
- `BLOCKED` → `ANALYZING` (when dependencies resolved)

### WorkflowStep

Represents a single step in the improvement workflow

**Fields**:

- `stepId`: string - Unique step identifier
- `name`: string - Step name
- `description`: string - Step description
- `action`: WorkflowAction - Action to perform
- `status`: StepStatus - Current step status
- `dependencies`: string[] - Step dependencies
- `output`: object - Step output data

**Validation Rules**:

- `name` and `description` must be non-empty
- `dependencies` must reference valid step IDs
- `status` must be valid StepStatus value

### WorkflowAction

Enum representing workflow actions

**Values**:

- `ANALYZE_BACKEND` - Analyze backend implementation
- `UPDATE_EXPECTATION` - Update test expectation
- `VALIDATE_RESPONSE` - Validate API response
- `UPDATE_SCHEMA` - Update response schema
- `ADD_VALIDATION` - Add new validation rules
- `REMOVE_TEST` - Remove invalid test

### WorkflowStatus

Enum representing workflow status

**Values**:

- `PENDING` - Workflow not started
- `IN_PROGRESS` - Workflow in progress
- `COMPLETED` - Workflow completed successfully
- `FAILED` - Workflow failed
- `BLOCKED` - Workflow blocked by dependencies

## Relationships

### TestScenario Relationships

- `TestScenario` has one `TestExpectation`
- `TestScenario` has one `BackendBehavior`
- `TestScenario` belongs to one `TestExecution`
- `TestScenario` can have many `TestScenario` dependencies

### TestExecution Relationships

- `TestExecution` contains many `TestScenario`
- `TestExecution` produces many `TestResult`

### API Contract Relationships

- `APIContract` has many `StatusCodeMapping`
- `APIContract` references one `AuthorizationLevel`

### Workflow Relationships

- `ImprovementWorkflow` belongs to one `TestScenario`
- `ImprovementWorkflow` contains many `WorkflowStep`
- `WorkflowStep` can depend on many `WorkflowStep`

## Business Rules

### Test Improvement Rules

1. A test scenario can only be improved if its current expectation is incorrect
2. Backend behavior analysis must be completed before updating expectations
3. Test improvements must maintain or improve test coverage
4. Updated tests must validate actual backend functionality
5. Test improvements must not break existing passing tests

### Validation Rules

1. All test expectations must be validated against actual backend behavior
2. Response schemas must match actual API responses
3. Status codes must match actual HTTP responses
4. Error messages must match actual error responses
5. Authentication and authorization must be properly validated

### Workflow Rules

1. Workflow steps must be executed in dependency order
2. Blocked workflows must wait for dependency resolution
3. Failed workflows must be retried or marked as failed
4. Completed workflows must be validated before marking as complete
5. Workflow status must be updated after each step completion

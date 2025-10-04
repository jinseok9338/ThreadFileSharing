# Data Model: Comprehensive API Testing Suite

**Feature**: 011-api-api  
**Date**: 2025-10-04  
**Status**: Design Phase

## Overview

This document defines the data models and entities required for the comprehensive API testing suite. The models cover test data entities, test scenarios, test results, and permission structures.

## Core Test Entities

### TestUser

Represents a test user with specific role and permissions for testing scenarios.

**Fields**:

- `id`: UUID - Unique identifier
- `email`: String - User email (format: test-{role}@example.com)
- `username`: String - Username (format: test*{role}*{number})
- `password`: String - Hashed password for authentication
- `fullName`: String - Display name
- `role`: Enum - User role (OWNER, ADMIN, MEMBER, GUEST)
- `companyId`: UUID - Associated company ID
- `isActive`: Boolean - Account status
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Email must be unique across all test users
- Username must be unique across all test users
- Role must be one of the defined enum values
- CompanyId must reference valid test company

**State Transitions**:

- INACTIVE → ACTIVE (account activation)
- ACTIVE → INACTIVE (account deactivation)
- ROLE changes (permission updates)

### TestCompany

Represents a test company for multi-tenant testing scenarios.

**Fields**:

- `id`: UUID - Unique identifier
- `name`: String - Company name (format: TestCompany\_{number})
- `domain`: String - Company domain (format: testcompany{number}.com)
- `maxStorageBytes`: Number - Storage limit in bytes
- `ownerId`: UUID - Company owner user ID
- `isActive`: Boolean - Company status
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Name must be unique across all test companies
- Domain must be unique and valid format
- OwnerId must reference valid test user
- MaxStorageBytes must be positive number

**State Transitions**:

- INACTIVE → ACTIVE (company activation)
- ACTIVE → INACTIVE (company deactivation)
- OWNER changes (ownership transfer)

### TestChatroom

Represents a test chatroom for testing chat-related functionality.

**Fields**:

- `id`: UUID - Unique identifier
- `name`: String - Chatroom name (format: TestChatroom\_{number})
- `description`: String - Chatroom description
- `companyId`: UUID - Associated company ID
- `createdBy`: UUID - Creator user ID
- `isPrivate`: Boolean - Privacy setting
- `memberCount`: Number - Number of members
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Name must be unique within company
- CompanyId must reference valid test company
- CreatedBy must reference valid test user
- MemberCount must be non-negative

**State Transitions**:

- PUBLIC → PRIVATE (privacy change)
- PRIVATE → PUBLIC (privacy change)
- MEMBER additions/removals (membership changes)

### TestThread

Represents a test thread for testing thread-related functionality.

**Fields**:

- `id`: UUID - Unique identifier
- `title`: String - Thread title (format: TestThread\_{number})
- `description`: String - Thread description
- `chatroomId`: UUID - Associated chatroom ID
- `createdBy`: UUID - Creator user ID
- `isArchived`: Boolean - Archive status
- `participantCount`: Number - Number of participants
- `fileCount`: Number - Number of associated files
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Title must be unique within chatroom
- ChatroomId must reference valid test chatroom
- CreatedBy must reference valid test user
- ParticipantCount must be non-negative
- FileCount must be non-negative

**State Transitions**:

- ACTIVE → ARCHIVED (thread archiving)
- ARCHIVED → ACTIVE (thread restoration)
- PARTICIPANT additions/removals (membership changes)
- FILE associations/disassociations (file changes)

### TestMessage

Represents a test message for testing message functionality.

**Fields**:

- `id`: UUID - Unique identifier
- `content`: String - Message content
- `chatroomId`: UUID - Associated chatroom ID
- `senderId`: UUID - Sender user ID
- `messageType`: Enum - Message type (TEXT, SYSTEM)
- `isEdited`: Boolean - Edit status
- `replyToId`: UUID - Reply to message ID (optional)
- `threadId`: UUID - Associated thread ID (optional)
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Content must not be empty
- ChatroomId must reference valid test chatroom
- SenderId must reference valid test user
- ReplyToId must reference valid test message (if provided)
- ThreadId must reference valid test thread (if provided)

**State Transitions**:

- CREATED → EDITED (message editing)
- CREATED → DELETED (message deletion)

### TestFile

Represents a test file for testing file upload/download functionality.

**Fields**:

- `id`: UUID - Unique identifier
- `filename`: String - Original filename
- `originalName`: String - Original file name
- `mimeType`: String - File MIME type
- `size`: Number - File size in bytes
- `uploadedBy`: UUID - Uploader user ID
- `chatroomId`: UUID - Associated chatroom ID (optional)
- `threadId`: UUID - Associated thread ID (optional)
- `storagePath`: String - File storage path
- `isPublic`: Boolean - Public access flag
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Filename must not be empty
- Size must be positive number
- UploadedBy must reference valid test user
- StoragePath must be valid file path
- Either chatroomId or threadId must be provided

**State Transitions**:

- UPLOADING → UPLOADED (upload completion)
- UPLOADED → DELETED (file deletion)
- PRIVATE → PUBLIC (access change)
- PUBLIC → PRIVATE (access change)

## Test Scenario Entities

### TestScenario

Represents a specific test scenario with expected outcomes.

**Fields**:

- `id`: UUID - Unique identifier
- `name`: String - Scenario name
- `description`: String - Scenario description
- `category`: Enum - Test category (AUTH, USER, COMPANY, CHATROOM, THREAD, MESSAGE, FILE, SECURITY, PERFORMANCE)
- `type`: Enum - Scenario type (SUCCESS, FAILURE, EDGE_CASE)
- `priority`: Enum - Test priority (CRITICAL, HIGH, MEDIUM, LOW)
- `expectedStatus`: Number - Expected HTTP status code
- `expectedResponse`: Object - Expected response structure
- `preConditions`: Array - Required pre-conditions
- `postConditions`: Array - Expected post-conditions
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Name must be unique across all scenarios
- Category must be one of the defined enum values
- Type must be one of the defined enum values
- Priority must be one of the defined enum values
- ExpectedStatus must be valid HTTP status code

### TestExecution

Represents the execution of a test scenario.

**Fields**:

- `id`: UUID - Unique identifier
- `scenarioId`: UUID - Associated test scenario ID
- `executionId`: UUID - Test run execution ID
- `status`: Enum - Execution status (PENDING, RUNNING, PASSED, FAILED, SKIPPED)
- `startTime`: DateTime - Execution start time
- `endTime`: DateTime - Execution end time
- `duration`: Number - Execution duration in milliseconds
- `actualStatus`: Number - Actual HTTP status code received
- `actualResponse`: Object - Actual response received
- `errorMessage`: String - Error message (if failed)
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- ScenarioId must reference valid test scenario
- ExecutionId must reference valid test run
- Status must be one of the defined enum values
- StartTime must be before EndTime (if both provided)
- Duration must be non-negative

### TestRun

Represents a complete test execution run.

**Fields**:

- `id`: UUID - Unique identifier
- `name`: String - Test run name
- `description`: String - Test run description
- `environment`: String - Test environment
- `totalScenarios`: Number - Total number of scenarios
- `passedScenarios`: Number - Number of passed scenarios
- `failedScenarios`: Number - Number of failed scenarios
- `skippedScenarios`: Number - Number of skipped scenarios
- `startTime`: DateTime - Run start time
- `endTime`: DateTime - Run end time
- `duration`: Number - Total run duration in milliseconds
- `status`: Enum - Run status (RUNNING, COMPLETED, FAILED, CANCELLED)
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Name must be unique across all test runs
- TotalScenarios must equal sum of passed, failed, and skipped scenarios
- StartTime must be before EndTime (if both provided)
- Duration must be non-negative
- Status must be one of the defined enum values

## Permission Entities

### RolePermission

Represents the permissions associated with a specific role.

**Fields**:

- `id`: UUID - Unique identifier
- `role`: Enum - User role (OWNER, ADMIN, MEMBER, GUEST)
- `resource`: String - Resource type (USER, COMPANY, CHATROOM, THREAD, MESSAGE, FILE)
- `action`: String - Action type (CREATE, READ, UPDATE, DELETE, MANAGE)
- `isGranted`: Boolean - Permission granted flag
- `conditions`: Object - Additional permission conditions
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Role must be one of the defined enum values
- Resource must be one of the defined resource types
- Action must be one of the defined action types
- Conditions must be valid JSON object (if provided)

### AccessControl

Represents access control rules for specific resources.

**Fields**:

- `id`: UUID - Unique identifier
- `resourceType`: String - Type of resource
- `resourceId`: UUID - Specific resource ID
- `userId`: UUID - User ID (optional for role-based access)
- `role`: Enum - User role (optional for user-specific access)
- `permissions`: Array - List of granted permissions
- `inheritedFrom`: UUID - Parent resource ID (for inheritance)
- `isActive`: Boolean - Access control active flag
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Validation Rules**:

- Either userId or role must be provided
- ResourceType must be valid resource type
- ResourceId must reference valid resource
- Permissions must be valid permission list
- InheritedFrom must reference valid parent resource (if provided)

## Test Data Relationships

### Entity Relationships

- TestUser belongs to TestCompany (many-to-one)
- TestChatroom belongs to TestCompany (many-to-one)
- TestThread belongs to TestChatroom (many-to-one)
- TestMessage belongs to TestChatroom (many-to-one)
- TestMessage can belong to TestThread (many-to-one, optional)
- TestFile can belong to TestChatroom or TestThread (many-to-one, optional)
- TestExecution belongs to TestScenario (many-to-one)
- TestExecution belongs to TestRun (many-to-one)
- RolePermission defines permissions for roles
- AccessControl defines access rules for resources

### Data Generation Rules

- Test users must be created with valid role assignments
- Test companies must have at least one owner user
- Test chatrooms must belong to valid companies
- Test threads must belong to valid chatrooms
- Test messages must be sent by valid users
- Test files must be uploaded by valid users
- Test scenarios must have valid expected outcomes
- Test executions must reference valid scenarios

### Data Cleanup Rules

- Test data must be cleaned up between test runs
- Orphaned records must be prevented
- Referential integrity must be maintained
- Test data must not interfere with production data
- Cleanup must be atomic and reversible

## Validation and Constraints

### Business Rules

- Users can only access resources within their company
- Chatroom members can only access threads within that chatroom
- Thread participants can only access messages within that thread
- File access is controlled by chatroom/thread permissions
- Permission inheritance flows from company to chatroom to thread

### Data Integrity Rules

- All foreign key relationships must be valid
- Cascade deletes must be handled properly
- Unique constraints must be enforced
- Required fields must not be null
- Data types must be validated

### Security Rules

- Test data must not contain sensitive information
- Test passwords must be strong but predictable
- Test data must be isolated from production data
- Access to test data must be controlled
- Test data cleanup must be thorough and secure

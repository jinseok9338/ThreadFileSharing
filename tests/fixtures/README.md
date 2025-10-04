# Test Fixtures

This directory contains test data fixtures and templates for the comprehensive API testing suite.

## Structure

- `test-users.json` - Test user data with different roles
- `test-companies.json` - Test company data
- `test-chatrooms.json` - Test chatroom data
- `test-threads.json` - Test thread data
- `test-messages.json` - Test message data
- `test-files/` - Test file uploads and samples
- `test-scenarios.json` - Test scenario definitions
- `test-executions.json` - Test execution tracking data
- `test-runs.json` - Test run management data
- `role-permissions.json` - Role-based permission matrix
- `access-control.json` - Access control rules

## Usage

These fixtures are used by the test automation scripts to:

1. Generate consistent test data
2. Validate API responses against expected data
3. Create test scenarios with known data
4. Perform cleanup operations

## Data Generation Rules

- All test data follows consistent naming conventions
- Test data is isolated from production data
- Test data includes both valid and invalid scenarios
- Test data supports all user roles (Owner, Admin, Member, Guest)
- Test data covers all API endpoints and scenarios

## Cleanup

Test data is automatically cleaned up between test runs to ensure:

- No data pollution between tests
- Consistent test results
- Isolated test environments

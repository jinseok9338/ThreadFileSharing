# Test Automation Framework

This directory contains automation scripts for the comprehensive API testing suite.

## Scripts

### Core Scripts

- `test-data-generator.ts` - Generates test data from fixtures
- `test-environment-setup.ts` - Sets up test environment
- `test-runner.ts` - Executes Bruno tests
- `test-result-analyzer.ts` - Analyzes test results
- `script-generator.ts` - Generates documentation scripts
- `report-generator.ts` - Generates test reports
- `documentation-generator.ts` - Generates documentation
- `test-cleanup.ts` - Cleans up test data

### Helper Scripts

- `auth-helpers.ts` - Authentication helper functions
- `validation-utils.ts` - Data validation utilities
- `assertion-helpers.ts` - Test assertion helpers
- `test-config.ts` - Test configuration management
- `test-logger.ts` - Test logging and monitoring

## Features

- **Automated Test Execution**: Runs all Bruno tests in sequence
- **Test Data Management**: Generates and manages test data
- **Result Analysis**: Analyzes test results and generates reports
- **Documentation Generation**: Creates executable test scripts for documentation
- **Environment Management**: Sets up and tears down test environments
- **Performance Monitoring**: Tracks test execution performance
- **Error Handling**: Comprehensive error handling and reporting

## Usage

```bash
# Generate test data
npm run test:data:generate

# Setup test environment
npm run test:env:setup

# Run all tests
npm run test:run

# Analyze results
npm run test:analyze

# Generate documentation
npm run test:docs:generate

# Cleanup test data
npm run test:cleanup
```

## Configuration

All scripts use configuration from:

- Environment variables
- `test-config.ts`
- Bruno environment files
- Test fixture data

## Output

Scripts generate:

- Test execution reports (JSON, HTML, XML)
- Documentation scripts (Markdown, HTML, PDF)
- Performance metrics
- Error logs and debugging information

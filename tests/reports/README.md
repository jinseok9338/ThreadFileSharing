# Test Reports and Documentation

This directory contains generated test reports and documentation from the comprehensive API testing suite.

## Report Types

### Test Execution Reports

- `test-results.json` - Raw test results in JSON format
- `test-results.html` - HTML test report with visual charts
- `test-results.xml` - JUnit XML format for CI/CD integration
- `test-summary.md` - Markdown summary of test results

### Performance Reports

- `performance-metrics.json` - Performance test results
- `performance-charts.html` - Visual performance charts
- `load-test-results.md` - Load testing analysis

### Security Reports

- `security-test-results.json` - Security test results
- `vulnerability-report.md` - Security vulnerability analysis
- `compliance-report.md` - Security compliance report

### Documentation Scripts

- `executable-test-scripts.md` - Executable test scripts for documentation
- `api-testing-guide.md` - Comprehensive API testing guide
- `test-scenario-documentation.md` - Detailed test scenario documentation

## Report Generation

Reports are automatically generated after each test run:

1. **Test Execution**: Bruno tests are executed
2. **Result Collection**: Test results are collected and parsed
3. **Analysis**: Results are analyzed for patterns and issues
4. **Report Generation**: Multiple report formats are generated
5. **Documentation**: Documentation scripts are created

## Report Structure

### Test Results Format

```json
{
  "testRun": {
    "id": "uuid",
    "timestamp": "ISO 8601",
    "duration": "milliseconds",
    "environment": "local|test|staging|production"
  },
  "summary": {
    "total": 108,
    "passed": 95,
    "failed": 8,
    "skipped": 5,
    "successRate": 87.96
  },
  "results": [
    {
      "testId": "T009",
      "name": "POST /api/v1/auth/register success",
      "status": "passed",
      "duration": 245,
      "assertions": 5,
      "passedAssertions": 5
    }
  ],
  "performance": {
    "averageResponseTime": 156,
    "slowestEndpoint": "/api/v1/files/upload/chunk",
    "fastestEndpoint": "/api/v1/auth/me"
  },
  "security": {
    "vulnerabilities": [],
    "securityScore": 95
  }
}
```

## Usage

Reports can be:

- Viewed directly in the browser (HTML reports)
- Integrated into CI/CD pipelines (XML reports)
- Used for documentation (Markdown reports)
- Analyzed programmatically (JSON reports)
- Shared with stakeholders (PDF reports)

## Archive

Old reports are archived in the `archive/` directory with timestamps for historical analysis and trend tracking.

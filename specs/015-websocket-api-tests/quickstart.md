# Quickstart: WebSocket and API Integration Scenario Testing

**Feature**: 015-websocket-api-tests  
**Date**: 2025-10-06

## Prerequisites

### System Requirements

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git repository cloned
- Backend services running (PostgreSQL, Redis, MinIO)

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd ThreadFileSharing

# Install dependencies
npm install

# Start backend services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Verify backend health
curl http://localhost:3001/api/v1/health
```

## Quick Test Execution

### 1. Basic Integration Test

```bash
# Navigate to test directory
cd tests/websocket_test

# Run basic WebSocket authentication test
node test-websocket-auth.js

# Expected output:
# ✅ WebSocket connection established
# ✅ Authentication successful
# ✅ User joined company room
# ✅ Test completed successfully
```

### 2. API-WebSocket Integration Test

```bash
# Run comprehensive integration test
node test-integration-validation.js

# Expected output:
# ✅ API authentication successful
# ✅ WebSocket connection established
# ✅ Real-time event synchronization validated
# ✅ Performance metrics within thresholds
# ✅ Integration test completed successfully
```

### 3. Performance Benchmark Test

```bash
# Run performance test
node test-storage-performance.js

# Expected output:
# ✅ Concurrent connections: 100/100 successful
# ✅ API response time: < 500ms average
# ✅ WebSocket delivery: < 100ms average
# ✅ Memory usage: +3MB (stable)
# ✅ Performance test completed successfully
```

## Comprehensive Test Suite

### Phase 1: Basic Integration

```bash
# Test WebSocket authentication
node test-websocket-auth.js

# Test simple WebSocket events
node test-websocket-simple.js

# Test multiple user connections
node test-multiple-users.js
```

### Phase 2: Event Integration

```bash
# Test comprehensive WebSocket events
node test-websocket-events-improved.js

# Test detailed event scenarios
node test-websocket-events-detailed-improved.js

# Test file upload integration
node test-file-upload-improved.js
```

### Phase 3: Advanced Integration

```bash
# Test chatroom and thread integration
node test-chatroom-thread-integration.js

# Test file upload simulation
node test-file-upload-simulation.js

# Test file upload API integration
node test-file-upload-integration.js
```

### Phase 4: Performance and Error Handling

```bash
# Test storage and performance
node test-storage-performance.js

# Test error handling scenarios
node test-error-handling.js

# Test comprehensive validation
node test-integration-validation.js
```

## Test Configuration

### Environment Variables

```bash
# Backend API URL
export API_BASE_URL=http://localhost:3001/api/v1

# WebSocket URL
export WEBSOCKET_URL=ws://localhost:3001

# Test timeout (milliseconds)
export TEST_TIMEOUT=30000

# Performance thresholds
export API_RESPONSE_THRESHOLD=500
export WEBSOCKET_DELIVERY_THRESHOLD=100
export CONCURRENT_USERS_THRESHOLD=100
```

### Test Data Management

```bash
# Use existing fixtures
export USE_FIXTURES=true

# Generate dynamic test data
export GENERATE_DYNAMIC_DATA=true

# Cleanup after tests
export CLEANUP_AFTER_TESTS=true
```

## Expected Results

### Success Criteria

- ✅ All WebSocket connections establish successfully
- ✅ All API endpoints respond within 500ms
- ✅ All WebSocket events deliver within 100ms
- ✅ 100+ concurrent users supported
- ✅ Connection recovery within 30 seconds
- ✅ 100% test coverage achieved

### Performance Benchmarks

- **API Response Time**: < 500ms average
- **WebSocket Delivery**: < 100ms average
- **Concurrent Connections**: 100+ users
- **Memory Usage**: < +50MB from baseline
- **Error Rate**: < 1% for all operations

### Test Coverage

- **API Endpoints**: 100% of existing endpoints
- **WebSocket Events**: 100% of existing events
- **Integration Scenarios**: 100% of existing scenarios
- **Error Handling**: All error scenarios covered
- **Performance**: All performance scenarios covered

## Troubleshooting

### Common Issues

#### 1. WebSocket Connection Failed

```bash
# Check backend services
docker-compose ps

# Check WebSocket server logs
docker-compose logs backend

# Verify port availability
netstat -an | grep 3001
```

#### 2. API Authentication Failed

```bash
# Check API server
curl http://localhost:3001/api/v1/health

# Verify JWT token generation
node -e "console.log(require('jsonwebtoken').sign({test: true}, 'secret'))"
```

#### 3. Performance Test Failures

```bash
# Check system resources
top -p $(pgrep node)

# Check memory usage
free -h

# Check network connectivity
ping localhost
```

#### 4. Test Timeout Issues

```bash
# Increase timeout
export TEST_TIMEOUT=60000

# Check test logs
tail -f tests/websocket_test/test-*.log
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=websocket:*

# Run test with verbose output
node test-websocket-auth.js --verbose

# Check test results
cat tests/websocket_test/results.json
```

## Test Reports

### Generated Reports

- `tests/websocket_test/results.json` - Detailed test results
- `tests/websocket_test/performance.json` - Performance metrics
- `tests/websocket_test/coverage.json` - Test coverage report
- `tests/websocket_test/errors.json` - Error details and stack traces

### Report Analysis

```bash
# View test summary
node -e "console.log(JSON.stringify(require('./tests/websocket_test/results.json'), null, 2))"

# Check performance metrics
node -e "console.log(JSON.stringify(require('./tests/websocket_test/performance.json'), null, 2))"

# Analyze coverage
node -e "console.log(JSON.stringify(require('./tests/websocket_test/coverage.json'), null, 2))"
```

## Next Steps

### After Successful Tests

1. **Review Test Reports**: Analyze performance metrics and coverage
2. **Fix Any Issues**: Address failed tests or performance problems
3. **Update Documentation**: Update test documentation with new findings
4. **Deploy to Production**: Deploy tested backend to production environment

### Continuous Integration

```bash
# Add to CI/CD pipeline
npm run test:integration

# Add to pre-commit hooks
npm run test:quick

# Add to deployment pipeline
npm run test:full
```

## Support

### Getting Help

- Check test logs in `tests/websocket_test/`
- Review backend logs with `docker-compose logs backend`
- Check API documentation at `http://localhost:3001/docs`
- Review WebSocket event schemas in `specs/015-websocket-api-tests/contracts/`

### Reporting Issues

- Create issue with test logs and error details
- Include system information and environment variables
- Provide steps to reproduce the issue
- Attach relevant test reports and performance metrics

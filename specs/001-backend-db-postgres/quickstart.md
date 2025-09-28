# Quickstart: Backend Project Setup

## Prerequisites Verification

### System Requirements

```bash
# Check Node.js version (required: 18+)
node --version

# Check Docker and Docker Compose
docker --version
docker-compose --version

# Check available ports
netstat -an | grep :3001  # Should be empty
netstat -an | grep :5432  # Should be empty
```

## Environment Setup

### 1. Environment Files Creation

```bash
# Create environment files
cp .env.example .env.local
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production

# Edit .env.local for local development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=dev_password
DATABASE_NAME=threadfilesharing_local
PORT=3001
NODE_ENV=local
```

### 2. Docker Compose Startup

```bash
# Start PostgreSQL database
docker-compose up -d postgres

# Wait for database to be ready (30 seconds)
sleep 30

# Verify database is running
docker-compose ps
```

### 3. Backend Application Setup

```bash
# Install dependencies
cd packages/backend
npm install

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

## Validation Tests

### 1. Health Check Endpoints

```bash
# Basic health check
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}

# Database health check
curl http://localhost:3001/health/database
# Expected: {"status":"ok","connection":{"connected":true,...},...}

# Readiness probe
curl http://localhost:3001/health/ready
# Expected: {"ready":true,"checks":{"database":true,"migrations":true}}

# Liveness probe
curl http://localhost:3001/health/live
# Expected: {"alive":true,"timestamp":"..."}
```

### 2. Database Connection Test

```bash
# Connect to database directly
docker exec -it threadfilesharing-postgres psql -U postgres -d threadfilesharing_local

# Check migrations table
\dt
# Expected: migrations table should exist

# Check health_check table
SELECT * FROM health_check;
# Expected: At least one row with status 'ok'

# Exit database
\q
```

### 3. Bruno API Testing

```bash
# Install Bruno CLI (if not already installed)
npm install -g @usebruno/cli

# Run API tests
cd tests/bruno
bru run --env local

# Expected output: All tests should pass
```

## Environment-Specific Validation

### Local Environment (.env.local)

```bash
# Set environment
export NODE_ENV=local

# Start application
npm run start:dev

# Validate endpoints respond correctly
curl http://localhost:3001/health
```

### Development Environment (.env.development)

```bash
# Set environment
export NODE_ENV=development

# Start application
npm run start:dev

# Validate with development database settings
curl http://localhost:3001/health/database
```

### Staging Environment (.env.staging)

```bash
# Set environment
export NODE_ENV=staging

# Start application (with staging database)
npm run start:prod

# Validate staging configuration
curl http://localhost:3001/health
```

### Production Environment (.env.production)

```bash
# Set environment
export NODE_ENV=production

# Start application (production mode)
npm run start:prod

# Validate production readiness
curl http://localhost:3001/health/ready
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL container status
docker-compose logs postgres

# Restart database container
docker-compose restart postgres

# Check database connectivity
docker exec -it threadfilesharing-postgres pg_isready -U postgres
```

### Migration Issues

```bash
# Check migration status
npm run migration:show

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate -- -n MigrationName
```

### Port Conflicts

```bash
# Find process using port 3001
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Change port in .env file if necessary
PORT=3002
```

### Docker Issues

```bash
# Clean up Docker containers
docker-compose down -v

# Remove all containers and volumes
docker system prune -a --volumes

# Rebuild containers
docker-compose up --build -d
```

## Success Criteria Validation

### ✅ Docker Compose Environment

- [ ] PostgreSQL container running
- [ ] Backend container can connect to database
- [ ] Volumes persist data across restarts
- [ ] Environment variables loaded correctly

### ✅ NestJS Application

- [ ] Application starts without errors
- [ ] Health endpoints respond correctly
- [ ] Database connection established
- [ ] TypeORM migrations executed successfully

### ✅ Database Setup

- [ ] PostgreSQL database created
- [ ] Migrations table exists
- [ ] Health check table exists
- [ ] Connection pooling configured

### ✅ API Testing

- [ ] Bruno tests pass for all environments
- [ ] Health check endpoints return expected responses
- [ ] Error handling works correctly
- [ ] API documentation accessible

### ✅ Environment Configuration

- [ ] All four .env files configured
- [ ] Environment-specific settings work
- [ ] Database connections per environment
- [ ] Port configurations correct

## Next Steps

After successful validation:

1. Commit the working setup to version control
2. Document any environment-specific configurations
3. Set up CI/CD pipeline for automated testing
4. Configure monitoring and alerting
5. Proceed with feature development using `/tasks` command

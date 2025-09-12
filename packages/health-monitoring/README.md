# @turnkey/health-monitoring

Comprehensive health monitoring endpoints and utilities for TurnkeyHMS microservices. This package provides standardized health check endpoints, dependency monitoring, metrics collection, and integration testing capabilities.

## Features

- **Standardized Health Endpoints**: `/health`, `/health/detailed`, `/health/dependencies`, `/health/integration-test`
- **Dependency Monitoring**: Built-in checkers for databases, caches, HTTP services, message queues, and file systems
- **Metrics Collection**: Request counting, error rate tracking, response time monitoring, and custom metrics
- **Integration Testing**: Framework for end-to-end service testing
- **Framework Support**: Express and Fastify middleware included
- **TypeScript**: Full type safety with comprehensive type definitions
- **Zero Dependencies**: No external runtime dependencies for maximum compatibility

## Installation

```bash
npm install @turnkey/health-monitoring
```

## Quick Start

### Basic Express.js Setup

```typescript
import express from 'express';
import { HealthMonitor, MetricsCollector, createExpressMiddleware } from '@turnkey/health-monitoring';

const app = express();
const healthMonitor = new HealthMonitor('user-service', '1.2.0');
const metricsCollector = new MetricsCollector();

// Add metrics collection middleware
app.use(createExpressMiddleware(metricsCollector));

// Health endpoints
app.get('/health', async (req, res) => {
  const health = await healthMonitor.getBasicHealth();
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

app.get('/health/detailed', async (req, res) => {
  const health = await healthMonitor.getDetailedHealth();
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

app.get('/health/dependencies', async (req, res) => {
  const health = await healthMonitor.getDependenciesHealth();
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

app.get('/health/integration-test', async (req, res) => {
  const health = await healthMonitor.getIntegrationTestHealth();
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});
```

### Registering Dependencies

```typescript
import { DependencyCheckers, DependencyType } from '@turnkey/health-monitoring';

// Database dependency
healthMonitor.registerDependency({
  name: 'postgres-db',
  type: DependencyType.DATABASE,
  critical: true,
  checker: async () => {
    const db = getDbConnection(); // Your DB connection
    return DependencyCheckers.checkDatabase('postgres-db', db);
  }
});

// HTTP service dependency
healthMonitor.registerDependency({
  name: 'api-gateway',
  type: DependencyType.EXTERNAL_API,
  critical: true,
  checker: async () => DependencyCheckers.checkHttpService(
    'api-gateway',
    'https://api.example.com/health',
    { timeout: 5000 }
  )
});

// Redis cache dependency
healthMonitor.registerDependency({
  name: 'redis-cache',
  type: DependencyType.CACHE,
  critical: false,
  checker: async () => {
    const redis = getRedisConnection(); // Your Redis connection
    return DependencyCheckers.checkRedisCache('redis-cache', redis);
  }
});
```

### Adding Integration Tests

```typescript
healthMonitor.registerIntegrationTest('user-creation-flow', async () => {
  const startTime = Date.now();
  
  try {
    // Test your critical user flows
    await testUserRegistration();
    await testUserAuthentication();
    await testUserProfileUpdate();
    
    return {
      name: 'user-creation-flow',
      status: HealthStatus.HEALTHY,
      duration: Date.now() - startTime,
      details: {
        steps: ['registration', 'authentication', 'profile-update'],
        performance: 'good'
      }
    };
  } catch (error) {
    return {
      name: 'user-creation-flow',
      status: HealthStatus.UNHEALTHY,
      duration: Date.now() - startTime,
      error: error.message
    };
  }
});
```

### Custom Metrics

```typescript
// Update service metrics periodically
setInterval(() => {
  const metrics = metricsCollector.getMetrics();
  healthMonitor.updateMetrics(metrics);
  
  // Add custom business metrics
  metricsCollector.recordCustomMetric('active_users', 1250);
  metricsCollector.recordCustomMetric('conversion_rate', 0.23);
  metricsCollector.incrementCounter('api_calls');
}, 30000);
```

## API Reference

### HealthMonitor

Main class for managing service health checks.

#### Constructor
```typescript
new HealthMonitor(serviceName: string, serviceVersion?: string)
```

#### Methods

##### `getBasicHealth(options?: HealthCheckOptions): Promise<HealthResponse>`
Returns basic service health status.

##### `getDetailedHealth(options?: HealthCheckOptions): Promise<DetailedHealthResponse>`
Returns detailed health information including system metrics, uptime, and memory usage.

##### `getDependenciesHealth(options?: HealthCheckOptions): Promise<DependenciesHealthResponse>`
Checks all registered dependencies and returns their health status.

##### `getIntegrationTestHealth(options?: HealthCheckOptions): Promise<IntegrationTestResponse>`
Runs all registered integration tests and returns results.

##### `registerDependency(config: DependencyConfig): void`
Register a dependency for health checking.

##### `registerIntegrationTest(name: string, testFn: () => Promise<IntegrationTestResult>): void`
Register an integration test.

##### `updateMetrics(metrics: Partial<ServiceMetrics>): void`
Update service metrics.

### MetricsCollector

Class for collecting and managing service metrics.

#### Methods

##### `recordRequest(responseTime: number, isError?: boolean): void`
Record a request with its response time and error status.

##### `recordCustomMetric(key: string, value: number | string): void`
Record a custom metric value.

##### `incrementCounter(key: string, value?: number): void`
Increment a counter metric.

##### `getMetrics(): ServiceMetrics`
Get current metrics snapshot.

##### `reset(): void`
Reset all collected metrics.

### DependencyCheckers

Static utility class with pre-built dependency checkers.

#### Methods

##### `checkDatabase(name: string, connection: DatabaseConnection, timeout?: number): Promise<DependencyHealth>`
Check database connection health.

##### `checkRedisCache(name: string, connection: CacheConnection, timeout?: number): Promise<DependencyHealth>`
Check Redis cache connection health.

##### `checkHttpService(name: string, url: string, options?: HttpCheckOptions): Promise<DependencyHealth>`
Check HTTP service health.

##### `checkMessageQueue(name: string, connection: MessageQueueConnection, queueName?: string, timeout?: number): Promise<DependencyHealth>`
Check message queue health.

##### `checkFileSystem(name: string, path: string, timeout?: number): Promise<DependencyHealth>`
Check file system access.

##### `createCustomChecker<T>(name: string, type: DependencyType, checkFn: () => Promise<T>, evaluator: (result: T) => HealthEvaluation): () => Promise<DependencyHealth>`
Create a custom dependency checker.

## Health Status Values

- `healthy`: Service is operating normally
- `degraded`: Service is operational but with reduced performance
- `unhealthy`: Service is not functioning properly

## Response Format Standards

All health endpoints return:
- HTTP 200 for `healthy`/`degraded` states
- HTTP 503 for `unhealthy` states
- JSON content-type
- ISO 8601 timestamps
- Service name matching Docker service name

## Framework Examples

### FastAPI (Python)
See `examples/fastapi-adapter.py` for a complete Python implementation.

### Frontend Services
See `examples/react-widget-example.ts` for frontend-specific health monitoring.

### Backend Services
See `examples/express-example.ts` for a comprehensive backend service implementation.

## Service-Specific Requirements

### Frontend Services
- Bundle size and load time metrics
- API gateway connectivity checks
- User experience metrics (conversion rates, session counts)

### Backend Services
- Database connection pool status
- Message queue depth monitoring
- Cache hit rate tracking

### AI/Analytics Services
- Model loading status
- Data pipeline health
- Processing queue metrics

## OpenTelemetry Integration

The health monitoring system works alongside OpenTelemetry:

```typescript
import { trace } from '@opentelemetry/api';

// In your service startup
const tracer = trace.getTracer('user-service');

// Add tracing to health checks
app.get('/health', async (req, res) => {
  const span = tracer.startSpan('health-check');
  try {
    const health = await healthMonitor.getBasicHealth();
    span.setAttributes({
      'health.status': health.status,
      'health.service': health.service
    });
    res.json(health);
  } finally {
    span.end();
  }
});
```

## Testing Your Implementation

Test all endpoints:

```bash
# Basic health
curl http://localhost:8000/health

# Detailed health  
curl http://localhost:8000/health/detailed

# Dependencies
curl http://localhost:8000/health/dependencies

# Integration tests
curl http://localhost:8000/health/integration-test
```

## Best Practices

1. **Timeout Configuration**: Set appropriate timeouts for dependency checks
2. **Critical vs Non-Critical**: Mark dependencies as critical or non-critical appropriately
3. **Integration Tests**: Keep integration tests lightweight and fast
4. **Metrics Collection**: Don't collect too many custom metrics to avoid memory issues
5. **Error Handling**: Always handle errors gracefully in health endpoints
6. **Authentication**: Health endpoints should be accessible without authentication for monitoring systems

## Contributing

This package is part of the TurnkeyHMS monorepo. See the main repository for contribution guidelines.

## License

MIT - See LICENSE file for details.
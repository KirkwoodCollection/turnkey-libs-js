# Health Monitoring Package

## Purpose
Standardized health check endpoints, service monitoring utilities, and observability patterns for all TurnkeyHMS microservices.

## Core Components

### Health Check Framework
Provides standardized health check endpoints that can be consumed by Kubernetes, load balancers, and monitoring systems:

```typescript
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  service: string;
  version: string;
  checks: {
    [checkName: string]: {
      status: 'pass' | 'fail' | 'warn';
      output?: string;
      observedValue?: any;
      observedUnit?: string;
      time?: string;
    };
  };
  uptime: number;
  environment: string;
}
```

### Dependency Health Checks
Monitor external dependencies and services:

#### Database Health Checks
- **Firestore**: Connection status, query latency, document read/write tests
- **Redis**: Connection pool status, ping/pong tests, memory usage
- **BigQuery**: Query execution tests, dataset access validation

#### Service Health Checks
- **HTTP Services**: Endpoint availability, response time, circuit breaker status
- **Pub/Sub**: Topic/subscription status, message processing lag
- **WebSocket**: Connection pool health, message throughput

#### External Integration Health
- **Skipper**: API connectivity, booking engine status
- **Payment Gateway**: Transaction processing capability
- **Authentication**: Firebase Auth service availability

### Health Check Types

#### Startup Probes
Verify service initialization and readiness:
```typescript
export const startupChecks = {
  configurationLoaded: () => Promise<HealthCheckResult>,
  databaseConnections: () => Promise<HealthCheckResult>,
  externalServices: () => Promise<HealthCheckResult>
};
```

#### Liveness Probes
Verify service is running and responsive:
```typescript
export const livenessChecks = {
  processHealth: () => Promise<HealthCheckResult>,
  memoryUsage: () => Promise<HealthCheckResult>,
  threadPool: () => Promise<HealthCheckResult>
};
```

#### Readiness Probes
Verify service can handle traffic:
```typescript
export const readinessChecks = {
  dependencyHealth: () => Promise<HealthCheckResult>,
  circuitBreakerStatus: () => Promise<HealthCheckResult>,
  queueCapacity: () => Promise<HealthCheckResult>
};
```

## Express/Fastify Integration

### Middleware
```typescript
import { healthCheckMiddleware } from '@turnkey/health-monitoring';

app.use('/health', healthCheckMiddleware({
  service: 'booking-service',
  version: process.env.SERVICE_VERSION,
  checks: {
    database: databaseHealthCheck,
    redis: redisHealthCheck,
    pubsub: pubsubHealthCheck
  }
}));
```

### Route Handlers
```typescript
// Basic health endpoint
app.get('/health', basicHealthCheck);

// Detailed health with dependencies
app.get('/health/detailed', detailedHealthCheck);

// Kubernetes-specific endpoints
app.get('/health/startup', startupProbe);
app.get('/health/liveness', livenessProbe);
app.get('/health/readiness', readinessProbe);
```

## Monitoring Utilities

### Performance Metrics
```typescript
export class PerformanceMonitor {
  trackRequestDuration(route: string, method: string): void;
  trackDatabaseQuery(query: string, duration: number): void;
  trackCacheHitRatio(key: string, hit: boolean): void;
  trackErrorRate(service: string, errorType: string): void;
}
```

### Circuit Breaker Monitoring
```typescript
export class CircuitBreakerMonitor {
  trackCircuitState(service: string, state: 'closed' | 'open' | 'half-open'): void;
  trackFailureRate(service: string, failures: number, total: number): void;
  trackRecoveryTime(service: string, duration: number): void;
}
```

### Resource Monitoring
```typescript
export class ResourceMonitor {
  getMemoryUsage(): MemoryInfo;
  getCpuUsage(): CpuInfo;
  getDiskUsage(): DiskInfo;
  getNetworkStats(): NetworkInfo;
}
```

## Configuration Integration

### Service Configuration
Integrates with `@turnkey/service-config` for environment-specific health check configuration:
```typescript
import { getServiceConfig } from '@turnkey/service-config';

const healthConfig = getServiceConfig('health-monitoring');
// Returns timeout values, retry policies, threshold settings
```

### Constants Integration
Uses `@turnkey/constants` for health check thresholds and status codes:
```typescript
import { METRICS, HTTP_STATUS } from '@turnkey/constants';

const isHealthy = responseTime < METRICS.MAX_API_RESPONSE_TIME_MS;
```

## Kubernetes Integration

### Probe Configuration
```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/readiness
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 30
```

### Service Mesh Integration
- **Istio**: Provides sidecar health metrics
- **Linkerd**: Traffic metrics and success rates
- **Consul Connect**: Service registry health status

## Observability Features

### Structured Logging
Integrates with `@turnkey/logging` for health event logging:
```typescript
logger.info('Health check completed', {
  service: 'booking-service',
  status: 'healthy',
  checks: completedChecks,
  duration: checkDuration
});
```

### Metrics Export
- **Prometheus**: Metrics endpoint for scraping
- **OpenTelemetry**: Distributed tracing integration
- **Custom Metrics**: Business-specific health indicators

### Alerting Integration
```typescript
export class AlertManager {
  triggerAlert(severity: 'critical' | 'warning' | 'info', message: string): void;
  healthCheckFailed(service: string, check: string, error: Error): void;
  dependencyUnhealthy(dependency: string, status: string): void;
}
```

## Usage Example

```typescript
import { createHealthMonitor } from '@turnkey/health-monitoring';

const healthMonitor = createHealthMonitor({
  service: 'booking-service',
  version: '1.2.3',
  environment: 'production',
  dependencies: {
    firestore: firestoreHealthCheck,
    redis: redisHealthCheck,
    'payment-service': paymentServiceHealthCheck
  },
  thresholds: {
    responseTime: 2000,
    errorRate: 0.05,
    memoryUsage: 0.8
  }
});

// Start health monitoring
await healthMonitor.start();

// Register with Express
app.use('/health', healthMonitor.middleware);
```

This package ensures consistent health monitoring across all TurnkeyHMS microservices, enabling reliable service discovery, load balancing, and operational monitoring.
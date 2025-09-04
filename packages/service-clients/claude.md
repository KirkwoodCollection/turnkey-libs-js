# Service Clients Package

## Purpose
HTTP/gRPC client libraries for inter-service communication in the microservices architecture.

## Client Architecture

### Base Client
- Retry logic with exponential backoff
- Circuit breaker pattern
- Request/response interceptors
- Distributed tracing headers
- Authentication token management

### Service-Specific Clients
Each service client extends BaseClient with:
- Type-safe method signatures
- Request/response models
- Service discovery integration
- Health check methods

## Implementation Requirements
1. **Resilience Patterns**:
   - Timeouts (configurable per operation)
   - Retries for idempotent operations
   - Circuit breaker for fault tolerance
   - Bulkhead isolation for resource management

2. **Observability**:
   - OpenTelemetry tracing
   - Metrics collection (latency, errors)
   - Correlation ID propagation

3. **Configuration**:
   - Service URLs from environment/config service
   - Configurable timeouts and retry policies
   - Feature flags for gradual rollout

## Usage Pattern
```typescript
import { BookingServiceClient } from '@turnkey/service-clients';

const client = new BookingServiceClient({
  baseURL: process.env.BOOKING_SERVICE_URL,
  timeout: 5000,
  retries: 3
});

const booking = await client.createBooking(bookingRequest);
```

## Service Discovery
Support multiple discovery mechanisms:
- Environment variables (development)
- Kubernetes DNS (production)
- Service mesh integration (Istio/Linkerd)
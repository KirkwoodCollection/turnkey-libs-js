# Logging Package

## Purpose
Structured logging with correlation tracking for distributed system observability.

## Core Features

### Log Levels
- ERROR: System errors requiring immediate attention
- WARN: Potential issues or degraded performance
- INFO: Business events and state transitions
- DEBUG: Detailed diagnostic information
- TRACE: Fine-grained debugging

### Structured Format
```typescript
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  correlationId: string;
  sessionId?: string;
  userId?: string;
  message: string;
  context: Record<string, unknown>;
  error?: Error;
}
```

### Context Propagation
- Correlation ID for request tracing
- Session ID for user journey tracking
- Service metadata (version, instance)
- Environment context (region, deployment)

## Transports
- **Console**: Development with pretty printing
- **Cloud Logging**: GCP/AWS/Azure integration
- **File**: Rotating file logs for audit
- **Syslog**: Enterprise logging systems

## Performance Considerations
- Async logging to prevent blocking
- Sampling for high-volume DEBUG/TRACE
- Buffer management for batch sending
- PII masking for compliance

## Usage Pattern
```typescript
import { createLogger } from '@turnkey/logging';

const logger = createLogger({
  service: 'booking-service',
  level: 'info'
});

logger.info('Booking created', {
  bookingId: '123',
  propertyId: '456',
  amount: 299.99
});
```
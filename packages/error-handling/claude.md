# Error Handling Package

## Purpose
Standardized error types, handlers, and middleware for consistent error management across services.

## Error Hierarchy

### Base Error Classes
```typescript
class TurnkeyError extends Error {
  code: string;
  statusCode: number;
  context?: Record<string, unknown>;
}
```

### Domain-Specific Errors
- BookingError (inventory, pricing, validation)
- SessionError (timeout, invalid state)
- AuthenticationError (token expired, invalid credentials)
- IntegrationError (Skipper, payment gateway)

## Error Codes
Standardized error codes following pattern: `{DOMAIN}_{ERROR_TYPE}_{DETAIL}`
- `BOOKING_VALIDATION_INVALID_DATES`
- `SESSION_STATE_INVALID_TRANSITION`
- `AUTH_TOKEN_EXPIRED`

## Error Handling Patterns

### Circuit Breaker Integration
```typescript
class ServiceUnavailableError extends TurnkeyError {
  retryAfter?: number;
  fallbackAction?: () => Promise<any>;
}
```

### Error Recovery
- Automatic retry for transient errors
- Fallback strategies for service failures
- Compensation transactions for distributed operations

## Middleware
Express/Fastify error handling middleware:
- Error logging with context
- Response formatting
- Correlation ID tracking
- PII sanitization

## Usage
```typescript
throw new BookingValidationError('Invalid date range', {
  checkIn: '2024-03-15',
  checkOut: '2024-03-14'
});
```
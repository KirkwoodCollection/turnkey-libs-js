# Constants Package

## Purpose
Shared constants, HTTP status codes, error codes, metrics definitions, and business calculations used across all TurnkeyHMS applications and microservices.

## Constant Categories

### HTTP Status Codes
Standardized HTTP status code constants for consistent API responses:
```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;
```

### Error Codes
Domain-specific error codes following the pattern `{DOMAIN}_{ERROR_TYPE}_{DETAIL}`:
```typescript
export const ERROR_CODES = {
  // Booking errors
  BOOKING_VALIDATION_INVALID_DATES: 'BOOKING_VALIDATION_INVALID_DATES',
  BOOKING_INVENTORY_UNAVAILABLE: 'BOOKING_INVENTORY_UNAVAILABLE',
  BOOKING_PAYMENT_FAILED: 'BOOKING_PAYMENT_FAILED',

  // Session errors
  SESSION_STATE_INVALID_TRANSITION: 'SESSION_STATE_INVALID_TRANSITION',
  SESSION_TIMEOUT_EXPIRED: 'SESSION_TIMEOUT_EXPIRED',

  // Authentication errors
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS'
} as const;
```

### Metrics and Measurements
Business and technical metrics constants:
```typescript
export const METRICS = {
  // Conversion funnel stages
  FUNNEL_STAGES: 17,

  // Performance thresholds
  MAX_API_RESPONSE_TIME_MS: 2000,
  MAX_DATABASE_QUERY_TIME_MS: 500,

  // Business limits
  MAX_GUESTS_PER_BOOKING: 10,
  MAX_ROOMS_PER_BOOKING: 5,
  MIN_ADVANCE_BOOKING_DAYS: 0,
  MAX_ADVANCE_BOOKING_DAYS: 365
} as const;
```

### Business Calculations
Reusable calculation functions for pricing, dates, and business logic:
```typescript
export const CALCULATIONS = {
  // Room pricing calculations
  calculateTotalNights: (checkIn: Date, checkOut: Date) => number,
  calculateBasePrice: (rate: number, nights: number) => number,
  calculateTaxes: (basePrice: number, taxRate: number) => number,
  calculateTotalPrice: (basePrice: number, taxes: number, fees: number) => number,

  // Date calculations
  isValidDateRange: (checkIn: Date, checkOut: Date) => boolean,
  getAdvanceBookingDays: (checkIn: Date) => number,

  // Guest calculations
  isValidGuestCount: (adults: number, children: number) => boolean,
  calculateOccupancy: (guests: number, roomCapacity: number) => number
};
```

## Design Principles

### Type Safety
All constants are defined with `as const` assertions for literal type inference:
```typescript
const status = HTTP_STATUS.OK; // Type: 200, not number
```

### Immutability
Constants are exported as readonly to prevent modification:
```typescript
export const READONLY_CONFIG = Object.freeze({
  MAX_RETRIES: 3,
  TIMEOUT_MS: 5000
});
```

### Tree Shaking Support
Modular exports allow importing only needed constants:
```typescript
// Import only HTTP status codes
import { HTTP_STATUS } from '@turnkey/constants/http-status';

// Import only error codes
import { ERROR_CODES } from '@turnkey/constants/error-codes';
```

## Usage Patterns

### Error Handling
```typescript
import { HTTP_STATUS, ERROR_CODES } from '@turnkey/constants';

throw new BookingError(ERROR_CODES.BOOKING_VALIDATION_INVALID_DATES, {
  statusCode: HTTP_STATUS.BAD_REQUEST,
  checkIn: '2024-03-15',
  checkOut: '2024-03-14'
});
```

### Business Validation
```typescript
import { METRICS, CALCULATIONS } from '@turnkey/constants';

if (!CALCULATIONS.isValidGuestCount(adults, children)) {
  throw new ValidationError(ERROR_CODES.BOOKING_VALIDATION_INVALID_GUESTS);
}

if (totalGuests > METRICS.MAX_GUESTS_PER_BOOKING) {
  throw new ValidationError(ERROR_CODES.BOOKING_VALIDATION_EXCEEDS_LIMIT);
}
```

### API Response Status
```typescript
import { HTTP_STATUS } from '@turnkey/constants/http-status';

app.post('/api/bookings', (req, res) => {
  // ... booking logic
  res.status(HTTP_STATUS.CREATED).json(booking);
});
```

## Integration with Other Packages
- **error-handling**: Provides standardized error codes for error classes
- **validation**: Supplies validation constants and calculation functions
- **health-monitoring**: Uses HTTP status codes and metrics thresholds
- **service-config**: References business limits and operational parameters

## Maintenance Guidelines
1. **Backwards Compatibility**: Never remove or rename existing constants
2. **Semantic Grouping**: Group related constants together
3. **Clear Naming**: Use descriptive, unambiguous constant names
4. **Documentation**: Document business rules and calculation logic
5. **Validation**: Include runtime validation for critical business calculations
# Data Models Package

## Purpose
Shared TypeScript interfaces and classes representing core business entities used across all services.

## Model Categories

### Booking Models
- Reservation
- BookingRequest
- BookingConfirmation
- RoomInventory
- PricingQuote

### Session Models
- UserSession
- SessionState (LIVE, DORMANT, ABANDONED, CONFIRMED_BOOKING)
- SessionTransition
- JourneyStep

### Hotel Models
- Property
- Room
- RateCode
- Availability

### Analytics Models
- FunnelMetrics
- ConversionRate
- UserActivity
- SearchCriteria

## Design Principles
1. **Immutability**: Use readonly properties where applicable
2. **Validation**: Include validation methods on models
3. **Serialization**: Support JSON serialization/deserialization
4. **Type Guards**: Provide type guard functions for runtime checking

## Cross-Service Compatibility
- Models should be service-agnostic
- Avoid service-specific business logic
- Use composition over inheritance
- Support partial types for API responses

## Example Implementation
```typescript
export interface Booking {
  readonly id: string;
  readonly sessionId: string;
  readonly propertyId: string;
  readonly checkIn: Date;
  readonly checkOut: Date;
  readonly status: BookingStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const isBooking = (obj: unknown): obj is Booking => {
  // Type guard implementation
};
```
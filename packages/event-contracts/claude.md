# Event Contracts Package

## Purpose
Define and validate all event schemas used in the TurnkeyHMS event-driven architecture. This package serves as the contract between producers and consumers of events.

## Structure
- **booking-events/**: Booking lifecycle events (search, selection, confirmation)
- **analytics-events/**: User behavior and funnel tracking events
- **session-events/**: Session state transition events
- **schemas/**: JSON Schema or Zod schemas for validation

## Event Naming Convention
- Use snake_case for event types: `booking_confirmed`, `session_abandoned`
- Include version in event metadata: `{ version: "1.0", type: "booking_confirmed" }`
- Prefix with domain: `booking.confirmed`, `analytics.page_view`

## Implementation Guidelines
1. Each event must have:
   - TypeScript interface
   - JSON Schema for runtime validation
   - Example payload
   - Documentation of required/optional fields

2. Event Evolution:
   - Never remove required fields (breaking change)
   - New fields should be optional initially
   - Use versioning for incompatible changes

## Critical Events (17-stage funnel)
Define the complete 17-event Skipper-compatible journey:
1. ibe_launched
2. destination_searched
3. hotel_selected
4. dates_selected
5. room_rate_selected
6. booking_attempted
7. booking_confirmed
(... complete list based on business requirements)

## Usage Example
```typescript
import { BookingConfirmedEvent, validateEvent } from '@turnkey/event-contracts';

const event: BookingConfirmedEvent = {
  type: 'booking.confirmed',
  version: '1.0',
  timestamp: new Date().toISOString(),
  payload: { /* ... */ }
};

validateEvent(event); // Throws if invalid
```
# Event Normalizer Package

## Purpose
Transform and normalize events from various sources (Skipper, internal, GTM) into canonical TurnkeyHMS event format.

## Normalization Pipeline

### Input Sources
1. **Skipper Events**: Third-party booking engine events
2. **Internal Events**: Native booking widget events
3. **GTM/Analytics**: Google Tag Manager dataLayer events
4. **Legacy Events**: Backward compatibility transformations

### Normalization Steps
1. Field mapping (source → canonical)
2. Data type conversion
3. Timestamp standardization (ISO 8601)
4. Missing field enrichment
5. Validation against event contracts

## Mapping Rules

### Skipper → Canonical
```typescript
{
  'Submit Search Form' → 'search_submitted',
  'Select Room' → 'room_selected',
  'Reservation Completed' → 'booking_confirmed'
}
```

### Field Transformations
- `date_in/date_out` → `checkIn/checkOut`
- `guest_count` → `guests`
- `room_type_code` → `roomTypeId`

## Implementation Guidelines
- Pure functions for transformations
- Comprehensive error handling
- Preserve original event in metadata
- Support batch processing
- Configurable mapping rules

## Usage Example
```typescript
import { normalizeSkipperEvent } from '@turnkey/event-normalizer';

const skipperEvent = {
  event: 'Submit Search Form',
  date_in: '2024-03-15',
  // ...
};

const canonicalEvent = normalizeSkipperEvent(skipperEvent);
// Returns normalized event matching our contracts
```
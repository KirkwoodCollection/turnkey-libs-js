# Validation Package

## Purpose
Centralized validation logic for data integrity across all services.

## Validation Categories

### Booking Validation
- Date range validation (checkIn < checkOut)
- Guest count limits
- Room availability checks
- Rate code validity
- Payment information

### Session Validation
- Session state transitions
- Timeout rules
- User activity patterns
- Journey step sequence

### Common Validations
- Email format
- Phone number format
- Credit card validation (Luhn algorithm)
- Date/time formats
- Currency amounts

## Implementation Approach
1. **Schema-based**: Use Zod or Joi for declarative validation
2. **Composable**: Build complex validators from simple ones
3. **Type-safe**: TypeScript integration for compile-time safety
4. **i18n Support**: Localized error messages

## Validation Rules Engine
```typescript
export const bookingValidationRules = {
  checkIn: z.date().min(new Date()),
  checkOut: z.date(),
  guests: z.number().min(1).max(10),
  propertyId: z.string().uuid()
}.refine(data => data.checkOut > data.checkIn, {
  message: "Check-out must be after check-in"
});
```

## Error Reporting
Standardized validation error format:
```typescript
interface ValidationError {
  field: string;
  code: string;
  message: string;
  context?: Record<string, unknown>;
}
```
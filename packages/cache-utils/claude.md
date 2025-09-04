# Cache Utilities Package

## Purpose
Caching strategies and utilities for performance optimization across services.

## Caching Strategies

### Cache-First
Read from cache, fallback to source on miss:
```typescript
const cacheFirst = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T>
```

### Write-Through
Update cache and source simultaneously:
```typescript
const writeThrough = async <T>(
  key: string,
  value: T,
  persist: (value: T) => Promise<void>
): Promise<void>
```

### Cache-Aside
Application manages cache explicitly

## Cache Implementations

### Redis Adapter
- Connection pooling
- Cluster support
- Pub/sub for invalidation
- Lua scripts for atomic operations

### Memory Cache
- LRU eviction
- TTL support
- Size limits
- WeakMap for object caching

## Cache Key Patterns
```typescript
const keyPatterns = {
  session: (sessionId: string) => `session:${sessionId}`,
  booking: (bookingId: string) => `booking:${bookingId}`,
  availability: (propertyId: string, date: string) => `avail:${propertyId}:${date}`
};
```

## Invalidation Strategies
- **TTL-based**: Automatic expiration
- **Event-driven**: Invalidate on state changes
- **Manual**: Explicit cache clearing
- **Tag-based**: Invalidate groups of related entries

## Performance Monitoring
- Cache hit/miss ratios
- Latency metrics
- Memory usage tracking
- Eviction statistics
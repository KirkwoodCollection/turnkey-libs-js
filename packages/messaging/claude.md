# Messaging Package

## Purpose
Event-driven messaging patterns for asynchronous communication between services.

## Pub/Sub Implementation

### Google Cloud Pub/Sub
```typescript
class PubSubClient {
  async publish(topic: string, message: Message): Promise<string>
  async subscribe(subscription: string, handler: MessageHandler): Promise<void>
  async createTopic(name: string): Promise<void>
  async createSubscription(topic: string, subscription: string): Promise<void>
}
```

### Message Format
```typescript
interface Message {
  id: string;
  type: string;
  correlationId: string;
  timestamp: string;
  source: string;
  payload: unknown;
  metadata: Record<string, string>;
}
```

## WebSocket Utilities

### Connection Management
- Auto-reconnection with backoff
- Heartbeat/ping-pong
- Connection pooling
- Room/channel support

### Message Patterns
- Request-response with correlation
- Broadcast to subscribers
- Direct messaging
- Event streaming

## Message Processing Patterns

### Guaranteed Delivery
- At-least-once delivery
- Idempotency keys
- Deduplication
- Dead letter queues

### Batch Processing
```typescript
class BatchProcessor<T> {
  constructor(
    processor: (items: T[]) => Promise<void>,
    options: { batchSize: number; flushInterval: number }
  )
}
```

## Error Handling
- Retry with exponential backoff
- Circuit breaker for downstream services
- Poison message handling
- Alerting on processing failures

## Observability
- Message tracing
- Processing latency metrics
- Queue depth monitoring
- Consumer lag tracking
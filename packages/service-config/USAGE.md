# Service Configuration Usage Examples

## Quick Start

### Environment Configuration
```typescript
import { getEnvironment, getEnvironmentSuffix } from '@turnkey/service-config';

// Get current environment
const env = getEnvironment(); // 'development' | 'staging' | 'production'

// Get environment suffix for resource naming
const suffix = getEnvironmentSuffix(env); // '' | 'staging' | 'production'
```

### Service Names
```typescript
import { SERVICE_NAMES, buildServiceUrl } from '@turnkey/service-config';

// Before: Hardcoded service names
const eventsService = 'turnkey-events';

// After: Centralized service names
const eventsService = SERVICE_NAMES.EVENTS;

// Build environment-specific URLs
const url = buildServiceUrl(SERVICE_NAMES.BOOKING_API, 'production');
// Returns: 'https://turnkey-booking-api.turnkeyhms.com'
```

### Pub/Sub Topics
```typescript
import { PUBSUB_TOPICS, getTopicName } from '@turnkey/service-config';

// Before: Hardcoded topic names
const topic = 'booking-events-production';

// After: Environment-aware topic names
const topic = getTopicName(PUBSUB_TOPICS.BOOKING_EVENTS, 'production');
// Returns: 'booking-events-production'
```

### Firestore Collections
```typescript
import { FIRESTORE_COLLECTIONS, getCollectionPath } from '@turnkey/service-config';

// Before: Hardcoded collection names
const collection = 'sessions';

// After: Centralized collection names
const collection = FIRESTORE_COLLECTIONS.SESSIONS;

// Build document paths
const docPath = getCollectionPath(FIRESTORE_COLLECTIONS.BOOKINGS, 'booking123');
// Returns: 'bookings/booking123'
```

### Redis Keys
```typescript
import { REDIS_KEYS, buildRedisKey, buildWebSocketChannel } from '@turnkey/service-config';

// Before: Hardcoded key patterns
const sessionKey = `session:${userId}`;

// After: Consistent key building
const sessionKey = buildRedisKey(REDIS_KEYS.SESSION_PREFIX, userId);
// Returns: 'session:user123'

// WebSocket channels
const channel = buildWebSocketChannel('room123', 'messages');
// Returns: 'turnkey:ws:room:room123:messages'
```

### BigQuery Datasets
```typescript
import { getBigQueryDataset, buildTableReference } from '@turnkey/service-config';

// Environment-specific dataset names
const dataset = getBigQueryDataset('ANALYTICS', 'production');
// Returns: 'turnkey_analytics'

// Full table references
const tableRef = buildTableReference('ANALYTICS', 'events', undefined, 'production');
// Returns: 'turnkey-hms-prod.turnkey_analytics.events'
```

## Migration Guide

### Step 1: Install Package
```bash
npm install @turnkey/service-config
```

### Step 2: Replace Hardcoded Values
Find hardcoded constants in your service and replace with centralized imports:

```typescript
// Before
const BOOKING_TOPIC = 'booking-events-prod';
const SESSION_COLLECTION = 'sessions';
const CACHE_KEY = `cache:user:${userId}`;

// After
import {
  PUBSUB_TOPICS,
  FIRESTORE_COLLECTIONS,
  REDIS_KEYS,
  getTopicName,
  buildRedisKey
} from '@turnkey/service-config';

const BOOKING_TOPIC = getTopicName(PUBSUB_TOPICS.BOOKING_EVENTS, 'production');
const SESSION_COLLECTION = FIRESTORE_COLLECTIONS.SESSIONS;
const CACHE_KEY = buildRedisKey(REDIS_KEYS.CACHE_PREFIX, `user:${userId}`);
```

### Step 3: Update Environment-Specific Code
```typescript
// Before: Manual environment handling
const suffix = process.env.NODE_ENV === 'production' ? '-prod' : '-staging';

// After: Standardized environment handling
import { getEnvironment, getEnvironmentSuffix } from '@turnkey/service-config';
const suffix = getEnvironmentSuffix(getEnvironment());
```

## Tree-Shaking Support

Import only what you need for optimal bundle sizes:

```typescript
// Import specific modules
import { SERVICE_NAMES } from '@turnkey/service-config/services';
import { REDIS_KEYS } from '@turnkey/service-config/redis';
import { PUBSUB_TOPICS } from '@turnkey/service-config/pubsub';
```
# Migration Guide for TurnkeyHMS Service Teams

## Overview
This guide provides specific instructions for each service team to migrate to the centralized configuration library based on GPT-5 Deep Research findings.

## Updated Port Assignments

All port assignments have been updated to match GPT-5 verified values:

- **Events Service**: 8080 (unchanged)
- **Booking API**: 8000 (unchanged)
- **Session Service**: 8003 (changed from 8001)
- **Analytics Service**: 8001 (changed from 8002)
- **WebSocket Service**: 8002 (changed from 8004)
- **Gateway Service**: 8005 (changed from 8080)
- **Admin Dashboard**: 3001 (changed from 3000)
- **Booking Widget**: 3002 (changed from 3001)
- **Admin API**: 8006 (new service)

## Events Service Team

### Immediate Actions Required:
1. **Confirm WebSocket Path**: Ensure `/ws` path is used (not `/websocket/ws`)
2. **Auth Header Migration**: Accept both `X-API-Key` and `X-Internal-API-Key` during transition
3. **CORS Security**: Remove wildcard (*) origins, use centralized lists

### Code Changes:
```typescript
// Before: Hardcoded values
const BOOKING_TOPIC = 'booking-events-prod';
const WS_PATH = '/websocket/ws';
const CORS_ORIGINS = ['*'];

// After: Using centralized config
import {
  PUBSUB_TOPICS,
  getTopicName,
  WEBSOCKET_ROUTES,
  CORS_ORIGINS
} from '@turnkey/service-config';

const BOOKING_TOPIC = getTopicName(PUBSUB_TOPICS.BOOKING_EVENTS, environment);
const WS_PATH = WEBSOCKET_ROUTES.PRIMARY; // '/ws'
const corsOrigins = CORS_ORIGINS[environment];
```

### Migration Helper Functions:
```typescript
// For dual-topic support during migration
import { getMigrationTopicNames } from '@turnkey/service-config';

const topics = getMigrationTopicNames(PUBSUB_TOPICS.BOOKING_EVENTS, 'production');
// Returns: ['booking-events-prod', 'booking-events-production']
```

### Testing Checklist:
- [ ] WebSocket connects on `/ws` path
- [ ] Admin Dashboard can connect to Events service
- [ ] CORS allows only specified domains
- [ ] Both auth headers accepted during transition

---

## Analytics Service Team

### Critical Port Change:
**Development port changes from 8082 to 8001**

### Immediate Actions Required:
1. **Update Development Port**: Change local configuration to port 8001
2. **Remove Hardcoded Project ID**: Use `GCP_PROJECT_ID` environment variable
3. **Implement Feature Flag**: Add `USE_CENTRALIZED_CONFIG` toggle

### Code Changes:
```typescript
// Before: Hardcoded values
const DEV_PORT = 8082;
const PROJECT_ID = 'kirkwood-ibe';
const DATASET = 'turnkey_analytics';

// After: Using centralized config
import { SERVICE_CONFIGS, SERVICE_NAMES } from '@turnkey/service-config';

const DEV_PORT = SERVICE_CONFIGS[SERVICE_NAMES.ANALYTICS].defaultPort; // 8001
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = getBigQueryDataset('ANALYTICS', environment);
```

### Feature Flag Implementation:
```typescript
const USE_CENTRALIZED_CONFIG = process.env.USE_CENTRALIZED_CONFIG === 'true';

if (USE_CENTRALIZED_CONFIG) {
  // Use new config
  const topicName = getTopicName(PUBSUB_TOPICS.ANALYTICS_EVENTS, environment);
} else {
  // Use legacy config
  const topicName = 'analytics-events-prod';
}
```

### BigQuery Dataset Decision:
**No dataset rename required** - Keep existing `turnkey_analytics` to avoid breaking queries and dashboards.

### Testing Checklist:
- [ ] Service runs on port 8001 in development
- [ ] Admin Dashboard can connect to Analytics
- [ ] BigQuery queries work with env-based project ID
- [ ] Feature flag allows rollback

---

## Admin Dashboard Team

### Critical Configuration Updates:

```javascript
// Before: Incorrect endpoints
const EVENTS_API_URL = 'http://localhost:8003';
const WS_URL = 'ws://localhost:8002/websocket/ws';
const ANALYTICS_URL = 'http://localhost:8082';

// After: Correct endpoints
const EVENTS_API_URL = 'http://localhost:8080';
const WS_URL = 'ws://localhost:8080/ws';
const ANALYTICS_URL = 'http://localhost:8001';
```

### Fallback Configuration:
```javascript
const config = {
  // Primary endpoints (use new services when available)
  ADMIN_API_URL: process.env.ADMIN_API_URL || 'http://localhost:8080',
  WEBSOCKET_URL: process.env.WEBSOCKET_URL || 'ws://localhost:8080/ws',

  // Service-specific endpoints
  EVENTS_URL: 'http://localhost:8080',
  ANALYTICS_URL: 'http://localhost:8001',

  // Production endpoints
  PROD_API_URL: 'https://api.turnkeyhms.com',
  PROD_WS_URL: 'wss://api.turnkeyhms.com/ws'
};
```

### Auth Header Updates:
```javascript
// Use X-API-Key for all internal requests
const headers = {
  'X-API-Key': process.env.ANALYTICS_API_KEY,
  'Content-Type': 'application/json'
};
```

### Testing Checklist:
- [ ] Admin Dashboard loads without connection errors
- [ ] Analytics data displays correctly
- [ ] WebSocket connection successful
- [ ] Real-time updates work

---

## Gateway Service Team

### Port Configuration:
**Gateway development port changes to 8005** (if running locally)

### Service URL Mapping:
```typescript
// Before: Hardcoded URLs
const SERVICE_URLS = {
  events: 'http://localhost:8080',
  analytics: 'http://localhost:8082',
  session: 'http://localhost:8081'
};

// After: Using centralized config
import { buildServiceUrl, SERVICE_NAMES } from '@turnkey/service-config';

const SERVICE_URLS = {
  events: buildServiceUrl(SERVICE_NAMES.EVENTS, environment, true),
  analytics: buildServiceUrl(SERVICE_NAMES.ANALYTICS, environment, true),
  session: buildServiceUrl(SERVICE_NAMES.SESSION, environment, true)
};
```

### Header Forwarding:
```typescript
// Unified header forwarding
const internalHeaders = {
  'X-API-Key': getInternalApiKey(targetService),
  'X-Correlation-ID': req.headers['x-correlation-id'],
  'X-Request-ID': generateRequestId()
};
```

### WebSocket Routing:
- **Development**: Direct connection to services
- **Production**: Route through API Gateway or separate load balancer

### Testing Checklist:
- [ ] All service routes resolve correctly
- [ ] WebSocket routing configured
- [ ] Internal auth headers forwarded
- [ ] CORS properly configured

---

## WebSocket Service Team

### Security Fixes Required:
1. **Remove CORS Wildcard**: Replace `allow_origins=["*"]` with specific domains
2. **Switch Redis DB**: Move from DB 1 to DB 0
3. **Environment Suffix**: Use `-prod` suffix for production topics

### Code Changes:
```python
# Before: Security vulnerabilities
allow_origins=["*"]
redis_db = 1
topic_name = "booking-events"  # No suffix

# After: Secure configuration
from turnkey_libs.config import security_config, redis_config, events_config

origins = security_config.get_cors_origins(environment)
redis_db = 0  # Use DB 0 for consistency
topic_name = events_config.get_topic_name('booking-events', environment)
```

### JWT Synchronization:
```python
# Ensure same JWT config as Session service
from turnkey_libs.config import security_config

JWT_ALGORITHM = security_config.JWT_ALGORITHM
JWT_AUDIENCE = security_config.JWT_AUDIENCE
JWT_SECRET = os.getenv('JWT_SECRET_KEY')  # Must match Session service
```

### Testing Checklist:
- [ ] CORS restricted to allowed domains
- [ ] JWT tokens from Session service validate correctly
- [ ] Redis keys don't conflict (using DB 0)
- [ ] Topics use correct environment suffix

---

## Session Service Team

### Port Assignment:
**Development port is 8003** (verify in your configuration)

### JWT Configuration:
```python
# Ensure JWT settings are centralized
from turnkey_libs.config import security_config

JWT_ALGORITHM = security_config.JWT_ALGORITHM
JWT_AUDIENCE = security_config.JWT_AUDIENCE
JWT_SECRET = os.getenv('JWT_SECRET_KEY')  # Same secret for WebSocket validation
```

### Session Timeout:
```python
# Use centralized timeout values
from turnkey_libs.config import defaults

SESSION_TIMEOUT = defaults.SESSION_TIMEOUT_HOURS * 3600  # Convert to seconds
```

### Testing Checklist:
- [ ] Session service accessible on port 8003
- [ ] JWT tokens validate in WebSocket service
- [ ] Session timeouts consistent across services

---

## Infrastructure Team

### Pub/Sub Migration Strategy:
1. **Create -prod topics** alongside existing -production topics
2. **Set up dual subscriptions** during migration
3. **Bridge messages** from old to new topics
4. **Monitor message flow** during transition
5. **Remove old topics** after verification

### Environment Variables:
Ensure all services have consistent environment variables:
```bash
# Required for all services
GCP_PROJECT_ID=kirkwood-ibe
ENVIRONMENT=production
JWT_SECRET_KEY=[shared-secret]

# Service-specific API keys
ANALYTICS_API_KEY=[analytics-key]
EVENTS_INTERNAL_KEY=[events-key]
```

### WebSocket Routing:
Configure load balancer or API Gateway to route:
- `/ws` → WebSocket service
- `/api/v1/*` → Appropriate backend services

### Testing Checklist:
- [ ] All -prod topics created
- [ ] Dual subscriptions working
- [ ] Environment variables set
- [ ] Load balancer routing configured

---

## Rollback Plan

### Feature Flags:
Each service should implement feature flags:
```javascript
const USE_CENTRALIZED_CONFIG = process.env.USE_CENTRALIZED_CONFIG === 'true';
```

### Dual Configuration:
Maintain both old and new configurations during transition:
```typescript
const config = USE_CENTRALIZED_CONFIG ? newConfig : legacyConfig;
```

### Emergency Rollback:
1. Set `USE_CENTRALIZED_CONFIG=false`
2. Restart affected services
3. Revert to previous image versions if needed
4. Restore old Pub/Sub subscriptions

---

## Deployment Sequence

### Phase 1: Backend Services
1. Events Service
2. Analytics Service
3. Session Service
4. WebSocket Service

### Phase 2: Gateway & Infrastructure
1. Gateway Service
2. Infrastructure updates (topics, routing)

### Phase 3: Frontend
1. Admin Dashboard
2. Booking Widget

### Phase 4: Cleanup
1. Remove feature flags
2. Delete old topics
3. Remove deprecated code

---

## Support & Coordination

### Team Contacts:
- **Events Team**: [Contact info]
- **Analytics Team**: [Contact info]
- **Admin Dashboard Team**: [Contact info]
- **Infrastructure Team**: [Contact info]

### Communication Channels:
- **Migration Channel**: #turnkey-config-migration
- **Emergency Channel**: #turnkey-alerts

### Documentation:
- **Configuration Reference**: [Link to central docs]
- **API Documentation**: [Link to API docs]
- **Troubleshooting Guide**: [Link to troubleshooting]
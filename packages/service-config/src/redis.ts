import { EnvironmentConfig } from './environment';

/**
 * Redis key prefixes and patterns for consistent namespace organization
 * All Redis keys should use these prefixes to avoid collisions and enable easy debugging
 *
 * Naming convention: Use colons (:) as namespace separators, lowercase with hyphens
 */
export const REDIS_KEYS = {
  // WebSocket and real-time communication
  WS_CHANNEL_PREFIX: 'turnkey:ws:',
  WS_ROOM_PREFIX: 'turnkey:ws:room:',
  WS_USER_PREFIX: 'turnkey:ws:user:',

  // Event processing and streams
  EVENTS_STREAM: 'events:stream',
  EVENT_DEDUP_PREFIX: 'event-dedup:',
  EVENT_PROCESSING_PREFIX: 'event-proc:',

  // Session management
  SESSION_PREFIX: 'session:',
  SESSION_DATA_PREFIX: 'session:data:',
  SESSION_CACHE_PREFIX: 'session:cache:',
  USER_SESSION_PREFIX: 'user:sessions:',

  // Caching layers
  CACHE_PREFIX: 'cache:',
  API_CACHE_PREFIX: 'cache:api:',
  QUERY_CACHE_PREFIX: 'cache:query:',
  METRICS_CACHE_PREFIX: 'cache:metrics:',

  // Rate limiting
  RATE_LIMIT_PREFIX: 'rate-limit:',
  THROTTLE_PREFIX: 'throttle:',

  // Distributed locks
  LOCK_PREFIX: 'lock:',
  MUTEX_PREFIX: 'mutex:',

  // Background job processing
  JOB_QUEUE_PREFIX: 'jobs:',
  TASK_PREFIX: 'task:',

  // Analytics and tracking
  ANALYTICS_PREFIX: 'analytics:',
  TRACKING_PREFIX: 'tracking:',
  FUNNEL_PREFIX: 'funnel:',

  // Health monitoring
  HEALTH_PREFIX: 'health:',
  METRICS_PREFIX: 'metrics:',
  STATUS_PREFIX: 'status:',

  // Feature flags
  FEATURE_FLAGS_PREFIX: 'flags:',
  CONFIG_PREFIX: 'config:',

  // Notifications
  NOTIFICATION_PREFIX: 'notify:',
  EMAIL_QUEUE_PREFIX: 'email:queue:',

  // Booking-specific caching
  BOOKING_CACHE_PREFIX: 'booking:cache:',
  AVAILABILITY_CACHE_PREFIX: 'availability:',
  RATES_CACHE_PREFIX: 'rates:'
} as const;

/**
 * Redis consumer groups for stream processing
 * These groups consume from Redis streams for distributed processing
 */
export const REDIS_CONSUMER_GROUPS = {
  // Event processing groups
  ANALYTICS: 'analytics-group',
  SESSION: 'session-group',
  BOOKING: 'booking-group',
  AI_INSIGHTS: 'ai-insights-group',

  // Notification groups
  EMAIL: 'email-group',
  PUSH: 'push-group',
  SMS: 'sms-group',

  // Background processing
  CLEANUP: 'cleanup-group',
  MAINTENANCE: 'maintenance-group'
} as const;

/**
 * Redis database assignments for different types of data
 * Separates concerns and allows for different retention/backup policies
 */
export const REDIS_DATABASES = {
  DEFAULT: 0,          // General purpose cache and sessions
  RATE_LIMITING: 1,    // Rate limiting counters
  WEBSOCKETS: 2,       // WebSocket connection data
  JOBS: 3,             // Background job queues
  ANALYTICS: 4,        // Analytics data and metrics
  FEATURE_FLAGS: 5,    // Feature flags and configuration
  HEALTH: 6,           // Health monitoring data
  LOCKS: 7             // Distributed locks and coordination
} as const;

/**
 * Environment-specific Redis configuration
 */
export const REDIS_CONFIG: EnvironmentConfig<{
  host: string;
  port: number;
  password?: string;
  tls?: boolean;
  maxRetries: number;
  retryDelayOnFailover: number;
  connectTimeout: number;
  lazyConnect: boolean;
}> = {
  development: {
    host: 'localhost',
    port: 6379,
    maxRetries: 3,
    retryDelayOnFailover: 100,
    connectTimeout: 10000,
    lazyConnect: true
  },
  staging: {
    host: 'redis-staging.turnkeyhms.com',
    port: 6379,
    tls: true,
    maxRetries: 5,
    retryDelayOnFailover: 200,
    connectTimeout: 10000,
    lazyConnect: true
  },
  production: {
    host: 'redis-prod.turnkeyhms.com',
    port: 6379,
    tls: true,
    maxRetries: 5,
    retryDelayOnFailover: 200,
    connectTimeout: 10000,
    lazyConnect: true
  }
};

/**
 * Common Redis TTL (Time To Live) values in seconds
 */
export const REDIS_TTL = {
  // Short-term cache
  SHORT: 300,          // 5 minutes
  MEDIUM: 1800,        // 30 minutes
  LONG: 3600,          // 1 hour

  // Session-related TTLs
  SESSION: 86400,      // 24 hours
  REMEMBER_ME: 2592000, // 30 days

  // API cache TTLs
  API_RESPONSE: 900,   // 15 minutes
  QUERY_CACHE: 600,    // 10 minutes

  // Rate limiting windows
  RATE_LIMIT_WINDOW: 60, // 1 minute

  // Feature flags
  FEATURE_FLAG: 300,   // 5 minutes

  // Health checks
  HEALTH_STATUS: 30,   // 30 seconds

  // Analytics data
  ANALYTICS_BUFFER: 3600, // 1 hour

  // Lock timeouts
  LOCK_TIMEOUT: 30     // 30 seconds
} as const;

/**
 * Redis connection pool settings
 */
export const REDIS_POOL_CONFIG = {
  // Connection pool sizes
  MIN_CONNECTIONS: 5,
  MAX_CONNECTIONS: 50,
  IDLE_TIMEOUT: 60000,     // 1 minute
  ACQUIRE_TIMEOUT: 10000,  // 10 seconds

  // Health check settings
  TEST_ON_BORROW: true,
  TEST_ON_RETURN: false,
  TEST_WHILE_IDLE: true,
  TEST_INTERVAL: 30000     // 30 seconds
} as const;

/**
 * Build a Redis key with proper namespacing
 * @param prefix - Key prefix from REDIS_KEYS
 * @param identifier - Unique identifier for the key
 * @param subKey - Optional sub-key for hierarchical organization
 * @returns Formatted Redis key
 *
 * @example
 * buildRedisKey(REDIS_KEYS.SESSION_PREFIX, 'user123') // 'session:user123'
 * buildRedisKey(REDIS_KEYS.CACHE_PREFIX, 'api', 'user/profile') // 'cache:api:user/profile'
 */
export function buildRedisKey(prefix: string, identifier: string, subKey?: string): string {
  const baseKey = `${prefix}${identifier}`;
  return subKey ? `${baseKey}:${subKey}` : baseKey;
}

/**
 * Build a WebSocket channel name
 * @param roomId - Room identifier
 * @param subChannel - Optional sub-channel name
 * @returns Formatted WebSocket channel name
 *
 * @example
 * buildWebSocketChannel('room123') // 'turnkey:ws:room:room123'
 * buildWebSocketChannel('room123', 'messages') // 'turnkey:ws:room:room123:messages'
 */
export function buildWebSocketChannel(roomId: string, subChannel?: string): string {
  const baseChannel = `${REDIS_KEYS.WS_ROOM_PREFIX}${roomId}`;
  return subChannel ? `${baseChannel}:${subChannel}` : baseChannel;
}

/**
 * Build a cache key with TTL information
 * @param prefix - Cache prefix
 * @param identifier - Cache identifier
 * @param version - Optional version for cache invalidation
 * @returns Formatted cache key
 *
 * @example
 * buildCacheKey(REDIS_KEYS.API_CACHE_PREFIX, 'user/123') // 'cache:api:user/123'
 * buildCacheKey(REDIS_KEYS.QUERY_CACHE_PREFIX, 'bookings', 'v2') // 'cache:query:bookings:v2'
 */
export function buildCacheKey(prefix: string, identifier: string, version?: string): string {
  const baseKey = `${prefix}${identifier}`;
  return version ? `${baseKey}:${version}` : baseKey;
}

/**
 * Parse a Redis key to extract its components
 * @param key - Redis key to parse
 * @returns Object with prefix, identifier, and optional subKey
 *
 * @example
 * parseRedisKey('session:user123:data') // { prefix: 'session:', identifier: 'user123', subKey: 'data' }
 */
export function parseRedisKey(key: string): { prefix: string; identifier: string; subKey?: string } {
  const parts = key.split(':');
  if (parts.length < 2) {
    throw new Error(`Invalid Redis key format: ${key}`);
  }

  const prefix = `${parts[0]}:`;
  const identifier = parts[1];
  const subKey = parts.length > 2 ? parts.slice(2).join(':') : undefined;

  return { prefix, identifier, subKey };
}

/**
 * Validate Redis key format
 * @param key - Redis key to validate
 * @returns True if key follows naming conventions
 */
export function isValidRedisKey(key: string): boolean {
  // Redis keys should use colons as separators, no spaces or special chars
  const pattern = /^[a-z0-9\-]+:[a-z0-9\-:\/]+$/;
  return pattern.test(key);
}

/**
 * Get Redis configuration for current environment
 * @param environment - Environment to get config for
 * @returns Redis connection configuration
 */
export function getRedisConfig(environment: keyof typeof REDIS_CONFIG) {
  return REDIS_CONFIG[environment];
}
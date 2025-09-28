export const TIMEOUTS = {
  // Request timeouts (milliseconds)
  DEFAULT_REQUEST: 5000,
  LONG_REQUEST: 30000,
  SHORT_REQUEST: 1000,
  EXTENDED_REQUEST: 60000,

  // Health check timeouts
  DEPENDENCY_CHECK: 5000,
  HEALTH_CHECK: 3000,
  BASIC_HEALTH_CHECK: 1000,

  // Performance thresholds
  BUNDLE_LOAD: 3000,
  PERFORMANCE_SCORE: 1000,
  PAGE_LOAD: 5000,

  // Update intervals
  METRICS_UPDATE: 60000,          // 1 minute
  HEALTH_UPDATE: 30000,           // 30 seconds
  FAST_UPDATE: 5000,              // 5 seconds
  SLOW_UPDATE: 300000,            // 5 minutes

  // Short operations
  SHORT_OPERATION: 100,
  QUICK_OPERATION: 50,
  IMMEDIATE_OPERATION: 10,

  // Database timeouts
  DB_QUERY: 5000,
  DB_CONNECTION: 10000,
  DB_TRANSACTION: 30000,

  // Cache timeouts
  CACHE_GET: 1000,
  CACHE_SET: 2000,
  CACHE_DELETE: 1000,

  // External service timeouts
  THIRD_PARTY_API: 10000,
  PAYMENT_PROCESSING: 30000,
  EMAIL_SEND: 15000,

  // WebSocket timeouts
  WS_CONNECT: 5000,
  WS_HEARTBEAT: 30000,
  WS_RECONNECT: 1000,

  // File operations
  FILE_READ: 5000,
  FILE_WRITE: 10000,
  FILE_UPLOAD: 60000,

  // Retry intervals
  RETRY_IMMEDIATE: 100,
  RETRY_SHORT: 1000,
  RETRY_MEDIUM: 5000,
  RETRY_LONG: 30000,

  // Circuit breaker timeouts
  CIRCUIT_BREAKER_TIMEOUT: 60000,
  CIRCUIT_BREAKER_RESET: 30000
} as const;

export const RETRY_CONFIG = {
  DEFAULT_MAX_RETRIES: 3,
  CRITICAL_MAX_RETRIES: 5,
  QUICK_MAX_RETRIES: 1,

  // Exponential backoff multipliers
  BACKOFF_MULTIPLIER: 1.5,
  MAX_BACKOFF: 30000,

  // Jitter for distributed systems
  JITTER_FACTOR: 0.1
} as const;
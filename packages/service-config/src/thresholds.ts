export const PERFORMANCE_THRESHOLDS = {
  // Bundle and load time thresholds
  BUNDLE_SIZE_KB: 5000,          // 5MB max bundle size
  BUNDLE_SIZE_WARNING_KB: 3000,   // 3MB warning threshold
  LOAD_TIME_MS: 3000,            // 3 second max load time
  LOAD_TIME_WARNING_MS: 2000,     // 2 second warning threshold

  // Response time thresholds
  RESPONSE_TIME_MS: 1000,         // 1 second max response time
  RESPONSE_TIME_WARNING_MS: 500,  // 500ms warning threshold
  SLOW_REQUEST_MS: 2000,          // 2 second slow request threshold

  // Performance score thresholds
  PERFORMANCE_SCORE_MIN: 1000,    // Minimum acceptable performance score
  PERFORMANCE_SCORE_GOOD: 1500,   // Good performance score
  PERFORMANCE_SCORE_EXCELLENT: 2000, // Excellent performance score

  // Error rate thresholds (percentages)
  ERROR_RATE_MAX: 5,              // 5% max error rate
  ERROR_RATE_WARNING: 2,          // 2% warning threshold
  ERROR_RATE_CRITICAL: 10,        // 10% critical threshold

  // Memory usage thresholds (bytes)
  MEMORY_USAGE_WARNING: 1024 * 1024 * 512,   // 512MB warning
  MEMORY_USAGE_CRITICAL: 1024 * 1024 * 1024, // 1GB critical
  MEMORY_LEAK_THRESHOLD: 1024 * 1024 * 100,  // 100MB potential leak

  // CPU usage thresholds (percentages)
  CPU_USAGE_WARNING: 70,          // 70% CPU warning
  CPU_USAGE_CRITICAL: 90,         // 90% CPU critical
  CPU_SUSTAINED_THRESHOLD: 60,    // 60% sustained usage threshold

  // Disk space thresholds (bytes)
  DISK_SPACE_WARNING: 1024 * 1024 * 1024 * 5,  // 5GB warning
  DISK_SPACE_CRITICAL: 1024 * 1024 * 1024 * 1, // 1GB critical

  // Concurrent users/connections
  CONCURRENT_USERS_WARNING: 1000,   // 1k users warning
  CONCURRENT_USERS_MAX: 5000,       // 5k users maximum
  CONNECTION_POOL_WARNING: 80,      // 80% pool utilization warning
  CONNECTION_POOL_CRITICAL: 95      // 95% pool utilization critical
} as const;

export const QUEUE_THRESHOLDS = {
  // Message queue depth thresholds
  QUEUE_DEPTH_NORMAL: 100,        // Normal queue depth
  QUEUE_DEPTH_WARNING: 1000,      // Warning threshold
  QUEUE_DEPTH_DEGRADED: 10000,    // Degraded service threshold
  QUEUE_DEPTH_CRITICAL: 50000,    // Critical threshold

  // Queue processing thresholds
  PROCESSING_RATE_MIN: 10,        // Minimum messages per second
  PROCESSING_RATE_WARNING: 5,     // Warning: below 5 msg/sec
  PROCESSING_RATE_CRITICAL: 1,    // Critical: below 1 msg/sec

  // Dead letter queue thresholds
  DLQ_WARNING: 10,                // 10 messages in DLQ
  DLQ_CRITICAL: 50,               // 50 messages in DLQ

  // Queue age thresholds (milliseconds)
  MESSAGE_AGE_WARNING: 300000,    // 5 minutes old
  MESSAGE_AGE_CRITICAL: 1800000   // 30 minutes old
} as const;

export const DATABASE_THRESHOLDS = {
  // Connection thresholds
  DB_CONNECTIONS_WARNING: 80,     // 80% of max connections
  DB_CONNECTIONS_CRITICAL: 95,    // 95% of max connections

  // Query performance thresholds
  SLOW_QUERY_MS: 1000,           // Queries slower than 1s
  VERY_SLOW_QUERY_MS: 5000,      // Queries slower than 5s

  // Lock wait thresholds
  LOCK_WAIT_WARNING_MS: 5000,    // 5 second lock wait
  LOCK_WAIT_CRITICAL_MS: 30000,  // 30 second lock wait

  // Replication lag thresholds
  REPLICATION_LAG_WARNING: 60,    // 60 seconds behind
  REPLICATION_LAG_CRITICAL: 300,  // 5 minutes behind

  // Storage thresholds
  TABLE_SIZE_WARNING_GB: 10,      // 10GB table size warning
  TABLE_SIZE_CRITICAL_GB: 50,     // 50GB table size critical
  INDEX_BLOAT_WARNING: 20,        // 20% index bloat
  INDEX_BLOAT_CRITICAL: 50        // 50% index bloat
} as const;

export const CACHE_THRESHOLDS = {
  // Cache hit ratio thresholds
  HIT_RATIO_WARNING: 80,          // Below 80% hit ratio
  HIT_RATIO_CRITICAL: 60,         // Below 60% hit ratio

  // Cache memory thresholds
  MEMORY_USAGE_WARNING: 80,       // 80% cache memory used
  MEMORY_USAGE_CRITICAL: 95,      // 95% cache memory used

  // Eviction rate thresholds
  EVICTION_RATE_WARNING: 100,     // 100 evictions per minute
  EVICTION_RATE_CRITICAL: 1000,   // 1000 evictions per minute

  // Connection thresholds
  CONNECTION_USAGE_WARNING: 80,   // 80% connections used
  CONNECTION_USAGE_CRITICAL: 95   // 95% connections used
} as const;

export const BUSINESS_THRESHOLDS = {
  // Booking conversion thresholds
  CONVERSION_RATE_WARNING: 2,     // Below 2% conversion
  CONVERSION_RATE_CRITICAL: 1,    // Below 1% conversion

  // Session duration thresholds
  SESSION_DURATION_SHORT: 30000,  // Sessions shorter than 30s
  SESSION_DURATION_LONG: 1800000, // Sessions longer than 30min

  // Booking value thresholds
  BOOKING_VALUE_LOW: 100,         // Bookings below $100
  BOOKING_VALUE_HIGH: 10000,      // Bookings above $10,000

  // User engagement thresholds
  PAGE_VIEWS_LOW: 3,              // Fewer than 3 page views
  PAGE_VIEWS_HIGH: 20,            // More than 20 page views

  // Abandonment thresholds
  CART_ABANDONMENT_WARNING: 70,   // Above 70% abandonment
  CART_ABANDONMENT_CRITICAL: 85,  // Above 85% abandonment

  // Revenue thresholds
  DAILY_REVENUE_WARNING: -10,     // 10% below target
  DAILY_REVENUE_CRITICAL: -25     // 25% below target
} as const;
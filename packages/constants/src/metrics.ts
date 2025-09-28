export const METRIC_TYPES = {
  COUNTER: 'COUNTER',
  GAUGE: 'GAUGE',
  HISTOGRAM: 'HISTOGRAM',
  SUMMARY: 'SUMMARY'
} as const;

export const METRICS_COLLECTION = {
  // Window and sampling configurations
  DEFAULT_WINDOW_SIZE: 300000,        // 5 minutes in milliseconds
  DEFAULT_MAX_SAMPLES: 1000,          // Maximum samples to keep
  HIGH_FREQUENCY_WINDOW: 60000,       // 1 minute for high-frequency metrics
  LOW_FREQUENCY_WINDOW: 600000,       // 10 minutes for low-frequency metrics

  // Update intervals
  REAL_TIME_UPDATE: 1000,             // 1 second
  FAST_UPDATE: 5000,                  // 5 seconds
  NORMAL_UPDATE: 30000,               // 30 seconds
  SLOW_UPDATE: 60000,                 // 1 minute
  PERIODIC_UPDATE: 300000,            // 5 minutes

  // Retention periods
  SHORT_RETENTION: 3600000,           // 1 hour
  MEDIUM_RETENTION: 86400000,         // 24 hours
  LONG_RETENTION: 604800000,          // 7 days
  EXTENDED_RETENTION: 2592000000      // 30 days
} as const;

export const PERFORMANCE_METRICS = {
  // Response time metrics
  RESPONSE_TIME: 'response_time',
  RESPONSE_TIME_P50: 'response_time_p50',
  RESPONSE_TIME_P95: 'response_time_p95',
  RESPONSE_TIME_P99: 'response_time_p99',

  // Throughput metrics
  REQUESTS_PER_SECOND: 'requests_per_second',
  REQUESTS_TOTAL: 'requests_total',
  CONCURRENT_REQUESTS: 'concurrent_requests',

  // Error metrics
  ERROR_RATE: 'error_rate',
  ERROR_COUNT: 'error_count',
  SUCCESS_RATE: 'success_rate',

  // Resource utilization
  CPU_USAGE: 'cpu_usage',
  MEMORY_USAGE: 'memory_usage',
  DISK_USAGE: 'disk_usage',
  NETWORK_IO: 'network_io',

  // Database metrics
  DB_CONNECTION_POOL: 'db_connection_pool',
  DB_QUERY_TIME: 'db_query_time',
  DB_ACTIVE_CONNECTIONS: 'db_active_connections',

  // Cache metrics
  CACHE_HIT_RATE: 'cache_hit_rate',
  CACHE_MISS_RATE: 'cache_miss_rate',
  CACHE_EVICTION_RATE: 'cache_eviction_rate',

  // Queue metrics
  QUEUE_DEPTH: 'queue_depth',
  QUEUE_PROCESSING_TIME: 'queue_processing_time',
  QUEUE_THROUGHPUT: 'queue_throughput'
} as const;

export const BUSINESS_METRICS = {
  // Conversion metrics
  CONVERSION_RATE: 'conversion_rate',
  BOOKING_CONVERSION: 'booking_conversion',
  FUNNEL_CONVERSION: 'funnel_conversion',

  // User engagement
  SESSION_DURATION: 'session_duration',
  PAGE_VIEWS: 'page_views',
  BOUNCE_RATE: 'bounce_rate',
  USER_RETENTION: 'user_retention',

  // Booking metrics
  BOOKING_VALUE: 'booking_value',
  AVERAGE_BOOKING_VALUE: 'average_booking_value',
  BOOKING_FREQUENCY: 'booking_frequency',
  CANCELLATION_RATE: 'cancellation_rate',

  // Revenue metrics
  REVENUE_PER_USER: 'revenue_per_user',
  TOTAL_REVENUE: 'total_revenue',
  REVENUE_GROWTH: 'revenue_growth',

  // Search metrics
  SEARCH_CONVERSION: 'search_conversion',
  SEARCH_REFINEMENT: 'search_refinement',
  ZERO_RESULTS: 'zero_results',

  // Cart metrics
  CART_ABANDONMENT: 'cart_abandonment',
  CART_VALUE: 'cart_value',
  ITEMS_PER_CART: 'items_per_cart'
} as const;

export const HEALTH_METRICS = {
  // Service health
  SERVICE_HEALTH: 'service_health',
  DEPENDENCY_HEALTH: 'dependency_health',
  ENDPOINT_HEALTH: 'endpoint_health',

  // Uptime metrics
  UPTIME: 'uptime',
  DOWNTIME: 'downtime',
  AVAILABILITY: 'availability',

  // Alert metrics
  ALERT_COUNT: 'alert_count',
  ALERT_RESOLUTION_TIME: 'alert_resolution_time',
  MEAN_TIME_TO_RECOVERY: 'mean_time_to_recovery'
} as const;

export const METRIC_LABELS = {
  // Service labels
  SERVICE_NAME: 'service_name',
  SERVICE_VERSION: 'service_version',
  ENVIRONMENT: 'environment',
  REGION: 'region',
  INSTANCE_ID: 'instance_id',

  // Request labels
  METHOD: 'method',
  ENDPOINT: 'endpoint',
  STATUS_CODE: 'status_code',
  USER_AGENT: 'user_agent',

  // Business labels
  BOOKING_TYPE: 'booking_type',
  PROPERTY_TYPE: 'property_type',
  USER_SEGMENT: 'user_segment',
  CHANNEL: 'channel',

  // Error labels
  ERROR_TYPE: 'error_type',
  ERROR_CODE: 'error_code',
  ERROR_CATEGORY: 'error_category'
} as const;

export const METRIC_AGGREGATIONS = {
  SUM: 'SUM',
  COUNT: 'COUNT',
  AVERAGE: 'AVERAGE',
  MIN: 'MIN',
  MAX: 'MAX',
  MEDIAN: 'MEDIAN',
  PERCENTILE_50: 'PERCENTILE_50',
  PERCENTILE_95: 'PERCENTILE_95',
  PERCENTILE_99: 'PERCENTILE_99',
  RATE: 'RATE',
  INCREASE: 'INCREASE'
} as const;

export interface MetricDefinition {
  name: string;
  type: keyof typeof METRIC_TYPES;
  description: string;
  unit?: string;
  labels?: string[];
  aggregations?: (keyof typeof METRIC_AGGREGATIONS)[];
}

export const COMMON_METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  [PERFORMANCE_METRICS.RESPONSE_TIME]: {
    name: PERFORMANCE_METRICS.RESPONSE_TIME,
    type: METRIC_TYPES.HISTOGRAM,
    description: 'HTTP request response time',
    unit: 'milliseconds',
    labels: [METRIC_LABELS.METHOD, METRIC_LABELS.ENDPOINT, METRIC_LABELS.STATUS_CODE],
    aggregations: [METRIC_AGGREGATIONS.AVERAGE, METRIC_AGGREGATIONS.PERCENTILE_95, METRIC_AGGREGATIONS.PERCENTILE_99]
  },

  [PERFORMANCE_METRICS.REQUESTS_TOTAL]: {
    name: PERFORMANCE_METRICS.REQUESTS_TOTAL,
    type: METRIC_TYPES.COUNTER,
    description: 'Total number of HTTP requests',
    labels: [METRIC_LABELS.METHOD, METRIC_LABELS.ENDPOINT, METRIC_LABELS.STATUS_CODE],
    aggregations: [METRIC_AGGREGATIONS.RATE, METRIC_AGGREGATIONS.INCREASE]
  },

  [PERFORMANCE_METRICS.ERROR_RATE]: {
    name: PERFORMANCE_METRICS.ERROR_RATE,
    type: METRIC_TYPES.GAUGE,
    description: 'HTTP request error rate',
    unit: 'percentage',
    labels: [METRIC_LABELS.SERVICE_NAME, METRIC_LABELS.ENDPOINT],
    aggregations: [METRIC_AGGREGATIONS.AVERAGE]
  },

  [BUSINESS_METRICS.CONVERSION_RATE]: {
    name: BUSINESS_METRICS.CONVERSION_RATE,
    type: METRIC_TYPES.GAUGE,
    description: 'Booking conversion rate',
    unit: 'percentage',
    labels: [METRIC_LABELS.CHANNEL, METRIC_LABELS.USER_SEGMENT],
    aggregations: [METRIC_AGGREGATIONS.AVERAGE, METRIC_AGGREGATIONS.MIN, METRIC_AGGREGATIONS.MAX]
  },

  [HEALTH_METRICS.SERVICE_HEALTH]: {
    name: HEALTH_METRICS.SERVICE_HEALTH,
    type: METRIC_TYPES.GAUGE,
    description: 'Service health status',
    labels: [METRIC_LABELS.SERVICE_NAME, METRIC_LABELS.INSTANCE_ID],
    aggregations: [METRIC_AGGREGATIONS.MIN]
  }
};
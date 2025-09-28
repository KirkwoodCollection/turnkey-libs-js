import { EnvironmentConfig } from './environment';

/**
 * Canonical service identifiers for all TurnkeyHMS microservices
 * These names should be used consistently across logging, tracing, service discovery, and configuration
 *
 * Naming convention: 'turnkey-' prefix with lowercase and hyphens
 */
export const SERVICE_NAMES = {
  // Core backend services
  EVENTS: 'turnkey-events',
  BOOKING_API: 'turnkey-booking-api',
  SESSION: 'turnkey-session',
  ANALYTICS: 'turnkey-analytics',
  AI_INSIGHTS: 'turnkey-ai-insights',
  GATEWAY: 'turnkey-gateway',
  WEBSOCKET: 'turnkey-websocket',

  // Frontend applications
  ADMIN_DASHBOARD: 'turnkey-admin-dashboard',
  BOOKING_WIDGET: 'turnkey-booking-widget',

  // Supporting services
  AUTH_SERVICE: 'turnkey-auth',
  NOTIFICATION_SERVICE: 'turnkey-notifications',
  PROPERTY_SERVICE: 'turnkey-property',
  PAYMENT_SERVICE: 'turnkey-payment',
  EMAIL_SERVICE: 'turnkey-email',
  ADMIN_API: 'turnkey-admin-api',

  // Infrastructure services
  CONFIG_SERVICE: 'turnkey-config',
  HEALTH_MONITOR: 'turnkey-health',
  LOG_AGGREGATOR: 'turnkey-logs'
} as const;

/**
 * Service configuration including default ports, rate limits, and timeouts
 * These provide sensible defaults while allowing environment-specific overrides
 */
export const SERVICE_CONFIGS = {
  [SERVICE_NAMES.EVENTS]: {
    defaultPort: 8080,
    rateLimit: 10000,        // 10k req/min (high volume)
    timeout: 30,
    maxConnections: 1000,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  },
  [SERVICE_NAMES.BOOKING_API]: {
    defaultPort: 8000,
    rateLimit: 100,          // 100 req/min
    timeout: 30,
    maxConnections: 500,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  },
  [SERVICE_NAMES.SESSION]: {
    defaultPort: 8003,        // Updated to match GPT-5 verified value
    rateLimit: 500,          // 500 req/min
    timeout: 15,
    maxConnections: 2000,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  },
  [SERVICE_NAMES.ANALYTICS]: {
    defaultPort: 8001,        // Updated to match GPT-5 verified value
    rateLimit: 200,          // 200 req/min
    timeout: 30,
    maxConnections: 300,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  },
  [SERVICE_NAMES.AI_INSIGHTS]: {
    defaultPort: 8004,        // Updated to avoid conflict with Session (8003)
    rateLimit: 50,           // 50 req/min (AI processing)
    timeout: 60,             // Longer timeout for AI processing
    maxConnections: 100,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  },
  [SERVICE_NAMES.GATEWAY]: {
    defaultPort: 8005,       // Updated to match GPT-5 verified value
    rateLimit: 1000,         // 1k req/min (gateway aggregation)
    timeout: 30,
    maxConnections: 2000,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  },
  [SERVICE_NAMES.WEBSOCKET]: {
    defaultPort: 8002,        // Updated to match GPT-5 verified value
    rateLimit: 2000,         // 2k req/min (websocket connections)
    timeout: 60,             // Longer timeout for persistent connections
    maxConnections: 5000,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  },
  [SERVICE_NAMES.ADMIN_DASHBOARD]: {
    defaultPort: 3001,        // Updated to match GPT-5 verified value
    rateLimit: 100,          // 100 req/min
    timeout: 15,
    maxConnections: 200,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  },
  [SERVICE_NAMES.BOOKING_WIDGET]: {
    defaultPort: 3002,        // Updated to avoid conflict with Admin Dashboard (3001)
    rateLimit: 200,          // 200 req/min (widget usage)
    timeout: 15,
    maxConnections: 1000,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  },
  [SERVICE_NAMES.ADMIN_API]: {
    defaultPort: 8006,        // New Admin-API service configuration
    rateLimit: 100,          // 100 req/min
    timeout: 30,
    maxConnections: 500,
    healthCheckPath: '/health',
    metricsPath: '/metrics'
  }
} as const;

/**
 * Service categorization for monitoring and management
 */
export const SERVICE_CATEGORIES = {
  BACKEND: [
    SERVICE_NAMES.EVENTS,
    SERVICE_NAMES.BOOKING_API,
    SERVICE_NAMES.SESSION,
    SERVICE_NAMES.ANALYTICS,
    SERVICE_NAMES.AI_INSIGHTS,
    SERVICE_NAMES.GATEWAY,
    SERVICE_NAMES.WEBSOCKET
  ],
  FRONTEND: [
    SERVICE_NAMES.ADMIN_DASHBOARD,
    SERVICE_NAMES.BOOKING_WIDGET
  ],
  INFRASTRUCTURE: [
    SERVICE_NAMES.AUTH_SERVICE,
    SERVICE_NAMES.NOTIFICATION_SERVICE,
    SERVICE_NAMES.CONFIG_SERVICE,
    SERVICE_NAMES.HEALTH_MONITOR,
    SERVICE_NAMES.ADMIN_API
  ]
} as const;

/**
 * Service dependencies - which services depend on which other services
 * This helps with deployment ordering and health check cascading
 */
export const SERVICE_DEPENDENCIES = {
  [SERVICE_NAMES.GATEWAY]: [
    SERVICE_NAMES.BOOKING_API,
    SERVICE_NAMES.SESSION,
    SERVICE_NAMES.ANALYTICS,
    SERVICE_NAMES.EVENTS
  ],
  [SERVICE_NAMES.ANALYTICS]: [
    SERVICE_NAMES.EVENTS,
    SERVICE_NAMES.SESSION
  ],
  [SERVICE_NAMES.AI_INSIGHTS]: [
    SERVICE_NAMES.EVENTS,
    SERVICE_NAMES.ANALYTICS
  ],
  [SERVICE_NAMES.ADMIN_DASHBOARD]: [
    SERVICE_NAMES.GATEWAY,
    SERVICE_NAMES.AUTH_SERVICE,
    SERVICE_NAMES.ADMIN_API
  ],
  [SERVICE_NAMES.ADMIN_API]: [
    SERVICE_NAMES.AUTH_SERVICE,
    SERVICE_NAMES.SESSION
  ],
  [SERVICE_NAMES.BOOKING_WIDGET]: [
    SERVICE_NAMES.BOOKING_API,
    SERVICE_NAMES.SESSION,
    SERVICE_NAMES.GATEWAY
  ]
} as const;

/**
 * Environment-specific service URL patterns
 * These define how to construct URLs for each service in different environments
 */
export const SERVICE_URL_PATTERNS: EnvironmentConfig<{
  internal: string;
  external: string;
}> = {
  development: {
    internal: 'http://localhost:{port}',
    external: 'http://localhost:{port}'
  },
  staging: {
    internal: 'http://{service}:8080',
    external: 'https://{service}-staging.turnkeyhms.com'
  },
  production: {
    internal: 'http://{service}:8080',
    external: 'https://{service}.turnkeyhms.com'
  }
};

/**
 * Service roles for access control and monitoring
 */
export const SERVICE_ROLES = {
  CRITICAL: [           // Services that are essential for core functionality
    SERVICE_NAMES.GATEWAY,
    SERVICE_NAMES.BOOKING_API,
    SERVICE_NAMES.SESSION
  ],
  IMPORTANT: [          // Services that enhance functionality
    SERVICE_NAMES.EVENTS,
    SERVICE_NAMES.ANALYTICS,
    SERVICE_NAMES.AUTH_SERVICE
  ],
  OPTIONAL: [           // Services that provide additional features
    SERVICE_NAMES.AI_INSIGHTS,
    SERVICE_NAMES.NOTIFICATION_SERVICE,
    SERVICE_NAMES.EMAIL_SERVICE
  ]
} as const;

/**
 * Get service configuration for a specific service
 * @param serviceName - Name of the service
 * @returns Service configuration object
 */
export function getServiceConfig(serviceName: keyof typeof SERVICE_CONFIGS) {
  return SERVICE_CONFIGS[serviceName];
}

/**
 * Get default port for a service
 * @param serviceName - Name of the service
 * @returns Default port number
 */
export function getServicePort(serviceName: keyof typeof SERVICE_CONFIGS): number {
  return SERVICE_CONFIGS[serviceName].defaultPort;
}

/**
 * Build service URL for a given environment
 * @param serviceName - Service name
 * @param environment - Target environment
 * @param internal - Whether to use internal URL pattern (default: false)
 * @returns Formatted service URL
 *
 * @example
 * buildServiceUrl(SERVICE_NAMES.BOOKING_API, 'production') // 'https://turnkey-booking-api.turnkeyhms.com'
 * buildServiceUrl(SERVICE_NAMES.BOOKING_API, 'development', true) // 'http://localhost:8000'
 */
export function buildServiceUrl(
  serviceName: string,
  environment: keyof typeof SERVICE_URL_PATTERNS,
  internal: boolean = false
): string {
  const patterns = SERVICE_URL_PATTERNS[environment];
  const pattern = internal ? patterns.internal : patterns.external;

  if (environment === 'development') {
    const config = SERVICE_CONFIGS[serviceName as keyof typeof SERVICE_CONFIGS];
    const port = config?.defaultPort || 8080;
    return pattern.replace('{port}', port.toString());
  }

  return pattern.replace('{service}', serviceName);
}

/**
 * Get all services in a specific category
 * @param category - Service category
 * @returns Array of service names in the category
 */
export function getServicesByCategory(category: keyof typeof SERVICE_CATEGORIES): readonly string[] {
  return SERVICE_CATEGORIES[category];
}

/**
 * Get services that depend on a specific service
 * @param serviceName - Service to check dependencies for
 * @returns Array of service names that depend on the given service
 */
export function getServiceDependents(serviceName: string): string[] {
  return Object.entries(SERVICE_DEPENDENCIES)
    .filter(([, deps]) => (deps as readonly string[]).includes(serviceName))
    .map(([service]) => service);
}

/**
 * Get services that a specific service depends on
 * @param serviceName - Service to get dependencies for
 * @returns Array of service names that the given service depends on
 */
export function getServiceDependencies(serviceName: keyof typeof SERVICE_DEPENDENCIES): readonly string[] {
  return SERVICE_DEPENDENCIES[serviceName] || [];
}

/**
 * Check if a service name follows naming conventions
 * @param serviceName - Service name to validate
 * @returns True if service name follows conventions
 */
export function isValidServiceName(serviceName: string): boolean {
  // Service names should start with 'turnkey-' and use lowercase with hyphens
  const pattern = /^turnkey-[a-z]+(-[a-z]+)*$/;
  return pattern.test(serviceName);
}

/**
 * Get service priority for health checking and deployment ordering
 * @param serviceName - Service name
 * @returns Priority level (1 = highest, 3 = lowest)
 */
export function getServicePriority(serviceName: string): number {
  if ((SERVICE_ROLES.CRITICAL as readonly string[]).includes(serviceName)) return 1;
  if ((SERVICE_ROLES.IMPORTANT as readonly string[]).includes(serviceName)) return 2;
  return 3;
}

/**
 * Service health check configuration
 */
export const SERVICE_HEALTH_CONFIG = {
  CHECK_INTERVAL: 30000,      // 30 seconds
  TIMEOUT: 5000,              // 5 seconds
  RETRIES: 3,
  FAILURE_THRESHOLD: 3,       // Mark unhealthy after 3 failures
  SUCCESS_THRESHOLD: 2        // Mark healthy after 2 successes
} as const;

/**
 * Service discovery configuration
 */
export const SERVICE_DISCOVERY = {
  REGISTRATION_TTL: 30,       // 30 seconds
  REFRESH_INTERVAL: 10,       // 10 seconds
  DEREGISTRATION_TIMEOUT: 60  // 1 minute
} as const;
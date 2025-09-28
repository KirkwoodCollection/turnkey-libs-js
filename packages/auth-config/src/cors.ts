export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig<T> {
  development: T;
  staging: T;
  production: T;
}

export const CORS_ORIGINS: EnvironmentConfig<string[]> = {
  development: [
    'http://localhost:3000',
    'http://localhost:3001',    // Admin Dashboard
    'http://localhost:3002',    // Booking Widget
    'http://localhost:3003',
    'http://localhost:4000',
    'http://localhost:6006',    // Storybook
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://0.0.0.0:3000',
    'http://0.0.0.0:3001',
    'http://0.0.0.0:3002'
  ],
  staging: [
    'https://staging.turnkeyhms.com',
    'https://admin-staging.turnkeyhms.com',    // Admin Dashboard
    'https://widget-staging.turnkeyhms.com',   // Booking Widget
    'https://booking-staging.turnkeyhms.com',  // Booking Application
    'https://api-staging.turnkeyhms.com'       // API Gateway
    // Removed wildcard patterns for security
  ],
  production: [
    'https://admin.turnkeyhms.com',      // Primary admin domain (verified by GPT-5)
    'https://widget.turnkeyhms.com',     // Booking Widget
    'https://booking.turnkeyhms.com',    // Booking Application
    'https://api.turnkeyhms.com',        // API Gateway
    'wss://api.turnkeyhms.com'           // WebSocket support
    // Removed wildcard patterns for security
  ]
};

export const INTERNAL_CORS_ORIGINS: EnvironmentConfig<string[]> = {
  development: [
    'http://localhost:8080',   // Events service
    'http://localhost:8000',   // Booking API
    'http://localhost:8003',   // Session service
    'http://localhost:8001',   // Analytics service
    'http://localhost:8002',   // WebSocket service
    'http://localhost:8004',   // AI Insights service
    'http://localhost:8005',   // Gateway service
    'http://localhost:8006'    // Admin API service
  ],
  staging: [
    'https://events-staging.turnkeyhms.com',
    'https://booking-staging.turnkeyhms.com',
    'https://session-staging.turnkeyhms.com',
    'https://analytics-staging.turnkeyhms.com',
    'https://websocket-staging.turnkeyhms.com',
    'https://admin-api-staging.turnkeyhms.com'
  ],
  production: [
    'https://events.turnkeyhms.com',
    'https://booking.turnkeyhms.com',
    'https://session.turnkeyhms.com',
    'https://analytics.turnkeyhms.com',
    'https://websocket.turnkeyhms.com',
    'https://admin-api.turnkeyhms.com'
  ]
};

export const CORS_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD'
] as const;

export const CORS_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-API-Key',
  'X-Internal-API-Key',
  'X-Service-API-Key',
  'X-Widget-API-Key',
  'X-Correlation-ID',
  'X-Request-ID',
  'X-Trace-ID',
  'X-Span-ID',
  'X-User-ID',
  'X-Session-ID',
  'X-Tenant-ID',
  'X-Organization-ID',
  'X-CSRF-Token',
  'X-XSRF-TOKEN',
  'X-Service-Name',
  'X-Service-Version',
  'X-Service-Instance'
] as const;

export const EXPOSED_HEADERS = [
  'X-RateLimit-Limit',
  'X-RateLimit-Remaining',
  'X-RateLimit-Reset',
  'X-Request-ID',
  'X-Correlation-ID',
  'X-Response-Time'
] as const;

export const CORS_CONFIG = {
  // Maximum age for preflight cache (24 hours)
  MAX_AGE: 86400,

  // Whether to include credentials in CORS requests
  CREDENTIALS: true,

  // Whether to expose headers to the browser
  EXPOSE_HEADERS: true,

  // Preflight success status
  OPTIONS_SUCCESS_STATUS: 204
} as const;

export interface CorsOptions {
  origin?: string[] | string | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  optionsSuccessStatus?: number;
}

export function getCorsOptions(environment: keyof typeof CORS_ORIGINS, includeInternal = false): CorsOptions {
  const origins = [...CORS_ORIGINS[environment]];

  if (includeInternal) {
    origins.push(...INTERNAL_CORS_ORIGINS[environment]);
  }

  return {
    origin: origins,
    methods: [...CORS_METHODS],
    allowedHeaders: [...CORS_HEADERS],
    exposedHeaders: [...EXPOSED_HEADERS],
    credentials: CORS_CONFIG.CREDENTIALS,
    maxAge: CORS_CONFIG.MAX_AGE,
    optionsSuccessStatus: CORS_CONFIG.OPTIONS_SUCCESS_STATUS
  };
}

export function isOriginAllowed(origin: string, environment: keyof typeof CORS_ORIGINS, includeInternal = false): boolean {
  const allowedOrigins = [...CORS_ORIGINS[environment]];

  if (includeInternal) {
    allowedOrigins.push(...INTERNAL_CORS_ORIGINS[environment]);
  }

  // Check exact match first
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check wildcard patterns
  return allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    }
    return false;
  });
}
export const API_ROUTES = {
  // Health check endpoints
  HEALTH: '/health',
  HEALTH_DETAILED: '/health/detailed',
  HEALTH_DEPENDENCIES: '/health/dependencies',
  HEALTH_INTEGRATION_TEST: '/health/integration-test',

  // API versioning
  API_V1: '/api/v1',
  API_V2: '/api/v2',
  API_LATEST: '/api/latest',

  // Authentication routes
  AUTH: '/auth',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_VALIDATE: '/auth/validate',

  // Booking routes
  BOOKING: '/api/v1/booking',
  BOOKINGS: '/api/v1/bookings',
  BOOKING_SEARCH: '/api/v1/booking/search',
  BOOKING_AVAILABILITY: '/api/v1/booking/availability',
  BOOKING_QUOTE: '/api/v1/booking/quote',

  // Session routes
  SESSION: '/api/v1/session',
  SESSIONS: '/api/v1/sessions',
  SESSION_STATE: '/api/v1/session/state',
  SESSION_EVENTS: '/api/v1/session/events',

  // Analytics routes
  ANALYTICS: '/api/v1/analytics',
  ANALYTICS_EVENTS: '/api/v1/analytics/events',
  ANALYTICS_FUNNEL: '/api/v1/analytics/funnel',
  ANALYTICS_METRICS: '/api/v1/analytics/metrics',

  // Event routes
  EVENTS: '/api/v1/events',
  EVENTS_PUBLISH: '/api/v1/events/publish',
  EVENTS_SUBSCRIBE: '/api/v1/events/subscribe',

  // Payment routes
  PAYMENT: '/api/v1/payment',
  PAYMENTS: '/api/v1/payments',
  PAYMENT_PROCESS: '/api/v1/payment/process',
  PAYMENT_REFUND: '/api/v1/payment/refund',

  // AI service routes
  AI: '/api/v1/ai',
  AI_RECOMMEND: '/api/v1/ai/recommend',
  AI_PREDICT: '/api/v1/ai/predict',
  AI_ANALYZE: '/api/v1/ai/analyze'
} as const;

export const WIDGET_ROUTES = {
  // Widget specific endpoints
  WIDGET: '/widget',
  WIDGET_HEALTH: '/widget/health',
  WIDGET_HEALTH_SUMMARY: '/widget/health-summary',
  WIDGET_CONFIG: '/widget/config',
  WIDGET_EMBED: '/widget/embed',

  // Widget API endpoints
  WIDGET_API: '/widget/api',
  WIDGET_SEARCH: '/widget/api/search',
  WIDGET_BOOKING: '/widget/api/booking',
  WIDGET_AVAILABILITY: '/widget/api/availability'
} as const;

export const ADMIN_ROUTES = {
  // Admin panel routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_PROPERTIES: '/admin/properties',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',

  // Admin API routes
  ADMIN_API: '/admin/api',
  ADMIN_API_USERS: '/admin/api/users',
  ADMIN_API_REPORTS: '/admin/api/reports'
} as const;

export const WEBSOCKET_ROUTES = {
  // WebSocket endpoints (standardized per GPT-5 guidance)
  PRIMARY: '/ws',                    // Standard WebSocket path
  LEGACY: '/websocket/ws',           // Legacy path for backward compatibility

  // WebSocket sub-paths
  WS_SESSION: '/ws/session',
  WS_BOOKING: '/ws/booking',
  WS_ANALYTICS: '/ws/analytics',
  WS_EVENTS: '/ws/events',
  WS_HEALTH: '/ws/health'
} as const;

export const STATIC_ROUTES = {
  // Static content routes
  STATIC: '/static',
  ASSETS: '/assets',
  IMAGES: '/images',
  STYLES: '/styles',
  SCRIPTS: '/scripts',
  DOCS: '/docs',
  FAVICON: '/favicon.ico',
  ROBOTS: '/robots.txt',
  SITEMAP: '/sitemap.xml'
} as const;

export function buildRoute(...segments: string[]): string {
  return '/' + segments.filter(Boolean).join('/').replace(/\/+/g, '/');
}

export function buildApiRoute(version: string, ...segments: string[]): string {
  return buildRoute('api', version, ...segments);
}

/**
 * Get WebSocket URL for a given environment and service
 * @param environment - Target environment
 * @param serviceName - Service name (default: events)
 * @param useLegacyPath - Whether to use legacy path (default: false)
 * @returns Complete WebSocket URL
 *
 * @example
 * getWebSocketUrl('development', 'events') // 'ws://localhost:8080/ws'
 * getWebSocketUrl('production', 'websocket') // 'wss://api.turnkeyhms.com/ws'
 */
export function getWebSocketUrl(
  environment: 'development' | 'staging' | 'production',
  serviceName: string = 'events',
  useLegacyPath: boolean = false
): string {
  const path = useLegacyPath ? WEBSOCKET_ROUTES.LEGACY : WEBSOCKET_ROUTES.PRIMARY;

  switch (environment) {
    case 'development':
      // Use specific service ports in development
      const ports: Record<string, number> = {
        events: 8080,
        websocket: 8002
      };
      const port = ports[serviceName] || 8080;
      return `ws://localhost:${port}${path}`;

    case 'staging':
      return `wss://api-staging.turnkeyhms.com${path}`;

    case 'production':
      return `wss://api.turnkeyhms.com${path}`;

    default:
      throw new Error(`Unsupported environment: ${environment}`);
  }
}
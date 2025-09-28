import { EnvironmentConfig } from './environment';

export const SERVICE_BASE_URLS: EnvironmentConfig<Record<string, string>> = {
  development: {
    API_GATEWAY: 'http://localhost:8080',
    BOOKING_SERVICE: 'http://localhost:8081',
    PAYMENT_SERVICE: 'http://localhost:8082',
    SESSION_SERVICE: 'http://localhost:8083',
    ANALYTICS_SERVICE: 'http://localhost:8084',
    EVENTS_SERVICE: 'http://localhost:8085',
    AI_SERVICE: 'http://localhost:8086',
    CDN_SERVICE: 'http://localhost:8087'
  },
  staging: {
    API_GATEWAY: 'https://api-staging.turnkeyhms.com',
    BOOKING_SERVICE: 'https://booking-staging.turnkeyhms.com',
    PAYMENT_SERVICE: 'https://payments-staging.turnkeyhms.com',
    SESSION_SERVICE: 'https://session-staging.turnkeyhms.com',
    ANALYTICS_SERVICE: 'https://analytics-staging.turnkeyhms.com',
    EVENTS_SERVICE: 'https://events-staging.turnkeyhms.com',
    AI_SERVICE: 'https://ai-staging.turnkeyhms.com',
    CDN_SERVICE: 'https://cdn-staging.turnkeyhms.com'
  },
  production: {
    API_GATEWAY: 'https://api.turnkeyhms.com',
    BOOKING_SERVICE: 'https://booking.turnkeyhms.com',
    PAYMENT_SERVICE: 'https://payments.turnkeyhms.com',
    SESSION_SERVICE: 'https://session.turnkeyhms.com',
    ANALYTICS_SERVICE: 'https://analytics.turnkeyhms.com',
    EVENTS_SERVICE: 'https://events.turnkeyhms.com',
    AI_SERVICE: 'https://ai.turnkeyhms.com',
    CDN_SERVICE: 'https://cdn.turnkeyhms.com'
  }
};

export const INTERNAL_SERVICE_URLS: EnvironmentConfig<Record<string, string>> = {
  development: {
    API_GATEWAY: 'http://api-gateway:8080',
    BOOKING_SERVICE: 'http://booking-service:8081',
    PAYMENT_SERVICE: 'http://payment-service:8082',
    SESSION_SERVICE: 'http://session-service:8083',
    ANALYTICS_SERVICE: 'http://analytics-service:8084',
    EVENTS_SERVICE: 'http://events-service:8085',
    AI_SERVICE: 'http://ai-service:8086'
  },
  staging: {
    API_GATEWAY: 'https://api-internal-staging.turnkeyhms.com',
    BOOKING_SERVICE: 'https://booking-internal-staging.turnkeyhms.com',
    PAYMENT_SERVICE: 'https://payments-internal-staging.turnkeyhms.com',
    SESSION_SERVICE: 'https://session-internal-staging.turnkeyhms.com',
    ANALYTICS_SERVICE: 'https://analytics-internal-staging.turnkeyhms.com',
    EVENTS_SERVICE: 'https://events-internal-staging.turnkeyhms.com',
    AI_SERVICE: 'https://ai-internal-staging.turnkeyhms.com'
  },
  production: {
    API_GATEWAY: 'https://api-internal.turnkeyhms.com',
    BOOKING_SERVICE: 'https://booking-internal.turnkeyhms.com',
    PAYMENT_SERVICE: 'https://payments-internal.turnkeyhms.com',
    SESSION_SERVICE: 'https://session-internal.turnkeyhms.com',
    ANALYTICS_SERVICE: 'https://analytics-internal.turnkeyhms.com',
    EVENTS_SERVICE: 'https://events-internal.turnkeyhms.com',
    AI_SERVICE: 'https://ai-internal.turnkeyhms.com'
  }
};

export const THIRD_PARTY_URLS: EnvironmentConfig<Record<string, string>> = {
  development: {
    SKIPPER_API: 'https://sandbox.skipper.com/api',
    PAYMENT_GATEWAY: 'https://sandbox.payments.com/api',
    ANALYTICS_PROVIDER: 'https://dev.analytics.com/api'
  },
  staging: {
    SKIPPER_API: 'https://staging.skipper.com/api',
    PAYMENT_GATEWAY: 'https://staging.payments.com/api',
    ANALYTICS_PROVIDER: 'https://staging.analytics.com/api'
  },
  production: {
    SKIPPER_API: 'https://api.skipper.com/api',
    PAYMENT_GATEWAY: 'https://api.payments.com/api',
    ANALYTICS_PROVIDER: 'https://api.analytics.com/api'
  }
};
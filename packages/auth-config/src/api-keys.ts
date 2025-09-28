export const API_KEY_TYPES = {
  // Public API keys (client-facing)
  PUBLIC: 'PUBLIC',
  WIDGET: 'WIDGET',
  MOBILE: 'MOBILE',

  // Internal API keys (service-to-service)
  INTERNAL: 'INTERNAL',
  SERVICE: 'SERVICE',
  ADMIN: 'ADMIN',

  // Development API keys
  DEVELOPMENT: 'DEVELOPMENT',
  TESTING: 'TESTING'
} as const;

export const API_KEY_PREFIXES = {
  [API_KEY_TYPES.PUBLIC]: 'pk_',
  [API_KEY_TYPES.WIDGET]: 'wk_',
  [API_KEY_TYPES.MOBILE]: 'mk_',
  [API_KEY_TYPES.INTERNAL]: 'ik_',
  [API_KEY_TYPES.SERVICE]: 'sk_',
  [API_KEY_TYPES.ADMIN]: 'ak_',
  [API_KEY_TYPES.DEVELOPMENT]: 'dk_',
  [API_KEY_TYPES.TESTING]: 'tk_'
} as const;

export const API_KEY_ENVIRONMENTS = {
  DEVELOPMENT: 'dev',
  STAGING: 'stg',
  PRODUCTION: 'prod'
} as const;

export const API_KEY_PATTERNS = {
  // Format: prefix_environment_randomString
  FULL_KEY: /^([a-z]{2}_)([a-z]{3}_)([A-Za-z0-9]{32})$/,
  PREFIX_ONLY: /^[a-z]{2}_$/,
  ENVIRONMENT_SUFFIX: /^[a-z]{3}_$/,
  RANDOM_PART: /^[A-Za-z0-9]{32}$/
} as const;

export const API_KEY_SCOPES = {
  // Read scopes
  READ_BASIC: 'basic:read',
  READ_BOOKINGS: 'bookings:read',
  READ_PROPERTIES: 'properties:read',
  READ_AVAILABILITY: 'availability:read',
  READ_RATES: 'rates:read',
  READ_REVIEWS: 'reviews:read',

  // Write scopes
  WRITE_BOOKINGS: 'bookings:write',
  WRITE_REVIEWS: 'reviews:write',
  WRITE_ANALYTICS: 'analytics:write',

  // Admin scopes
  ADMIN_USERS: 'admin:users',
  ADMIN_PROPERTIES: 'admin:properties',
  ADMIN_BOOKINGS: 'admin:bookings',
  ADMIN_ANALYTICS: 'admin:analytics',
  ADMIN_SETTINGS: 'admin:settings',

  // Service scopes
  SERVICE_HEALTH: 'service:health',
  SERVICE_METRICS: 'service:metrics',
  SERVICE_INTERNAL: 'service:internal',

  // Widget scopes
  WIDGET_SEARCH: 'widget:search',
  WIDGET_BOOKING: 'widget:booking',
  WIDGET_DISPLAY: 'widget:display',

  // Development scopes
  DEV_ALL: 'dev:all',
  TEST_ALL: 'test:all'
} as const;

export const API_KEY_RATE_LIMITS = {
  [API_KEY_TYPES.PUBLIC]: {
    requests_per_minute: 100,
    requests_per_hour: 5000,
    requests_per_day: 100000
  },
  [API_KEY_TYPES.WIDGET]: {
    requests_per_minute: 200,
    requests_per_hour: 10000,
    requests_per_day: 200000
  },
  [API_KEY_TYPES.MOBILE]: {
    requests_per_minute: 150,
    requests_per_hour: 7500,
    requests_per_day: 150000
  },
  [API_KEY_TYPES.INTERNAL]: {
    requests_per_minute: 1000,
    requests_per_hour: 50000,
    requests_per_day: 1000000
  },
  [API_KEY_TYPES.SERVICE]: {
    requests_per_minute: 2000,
    requests_per_hour: 100000,
    requests_per_day: 2000000
  },
  [API_KEY_TYPES.ADMIN]: {
    requests_per_minute: 500,
    requests_per_hour: 25000,
    requests_per_day: 500000
  },
  [API_KEY_TYPES.DEVELOPMENT]: {
    requests_per_minute: 1000,
    requests_per_hour: 25000,
    requests_per_day: 100000
  },
  [API_KEY_TYPES.TESTING]: {
    requests_per_minute: 10000,
    requests_per_hour: 100000,
    requests_per_day: 1000000
  }
} as const;

export interface ApiKeyInfo {
  type: keyof typeof API_KEY_TYPES;
  environment: keyof typeof API_KEY_ENVIRONMENTS;
  randomPart: string;
  scopes?: string[];
  rateLimit?: typeof API_KEY_RATE_LIMITS[keyof typeof API_KEY_RATE_LIMITS];
}

export function parseApiKey(apiKey: string): ApiKeyInfo | null {
  const match = apiKey.match(API_KEY_PATTERNS.FULL_KEY);
  if (!match) return null;

  const [, prefixPart, envPart, randomPart] = match;

  // Find the type by prefix
  const type = Object.entries(API_KEY_PREFIXES).find(([, prefix]) => prefix === prefixPart)?.[0] as keyof typeof API_KEY_TYPES;
  if (!type) return null;

  // Find the environment by suffix
  const environment = Object.entries(API_KEY_ENVIRONMENTS).find(([, env]) => `${env}_` === envPart)?.[0] as keyof typeof API_KEY_ENVIRONMENTS;
  if (!environment) return null;

  return {
    type,
    environment,
    randomPart,
    rateLimit: API_KEY_RATE_LIMITS[type]
  };
}

export function generateApiKey(type: keyof typeof API_KEY_TYPES, environment: keyof typeof API_KEY_ENVIRONMENTS): string {
  const prefix = API_KEY_PREFIXES[type];
  const envSuffix = API_KEY_ENVIRONMENTS[environment];
  const randomPart = generateRandomString(32);

  return `${prefix}${envSuffix}_${randomPart}`;
}

export function validateApiKey(apiKey: string): boolean {
  return API_KEY_PATTERNS.FULL_KEY.test(apiKey);
}

export function maskApiKey(apiKey: string): string {
  if (!validateApiKey(apiKey)) return apiKey;

  const parsed = parseApiKey(apiKey);
  if (!parsed) return apiKey;

  const prefix = API_KEY_PREFIXES[parsed.type];
  const envSuffix = API_KEY_ENVIRONMENTS[parsed.environment];
  const visiblePart = parsed.randomPart.slice(0, 4);
  const maskedPart = '*'.repeat(parsed.randomPart.length - 4);

  return `${prefix}${envSuffix}_${visiblePart}${maskedPart}`;
}

export function getApiKeyScopes(type: keyof typeof API_KEY_TYPES): string[] {
  switch (type) {
    case API_KEY_TYPES.PUBLIC:
      return [
        API_KEY_SCOPES.READ_BASIC,
        API_KEY_SCOPES.READ_PROPERTIES,
        API_KEY_SCOPES.READ_AVAILABILITY,
        API_KEY_SCOPES.READ_RATES,
        API_KEY_SCOPES.READ_REVIEWS
      ];

    case API_KEY_TYPES.WIDGET:
      return [
        API_KEY_SCOPES.READ_BASIC,
        API_KEY_SCOPES.READ_PROPERTIES,
        API_KEY_SCOPES.READ_AVAILABILITY,
        API_KEY_SCOPES.READ_RATES,
        API_KEY_SCOPES.WIDGET_SEARCH,
        API_KEY_SCOPES.WIDGET_BOOKING,
        API_KEY_SCOPES.WIDGET_DISPLAY,
        API_KEY_SCOPES.WRITE_BOOKINGS,
        API_KEY_SCOPES.WRITE_ANALYTICS
      ];

    case API_KEY_TYPES.MOBILE:
      return [
        API_KEY_SCOPES.READ_BASIC,
        API_KEY_SCOPES.READ_BOOKINGS,
        API_KEY_SCOPES.READ_PROPERTIES,
        API_KEY_SCOPES.READ_AVAILABILITY,
        API_KEY_SCOPES.READ_RATES,
        API_KEY_SCOPES.READ_REVIEWS,
        API_KEY_SCOPES.WRITE_BOOKINGS,
        API_KEY_SCOPES.WRITE_REVIEWS
      ];

    case API_KEY_TYPES.INTERNAL:
    case API_KEY_TYPES.SERVICE:
      return [
        API_KEY_SCOPES.SERVICE_HEALTH,
        API_KEY_SCOPES.SERVICE_METRICS,
        API_KEY_SCOPES.SERVICE_INTERNAL
      ];

    case API_KEY_TYPES.ADMIN:
      return [
        API_KEY_SCOPES.ADMIN_USERS,
        API_KEY_SCOPES.ADMIN_PROPERTIES,
        API_KEY_SCOPES.ADMIN_BOOKINGS,
        API_KEY_SCOPES.ADMIN_ANALYTICS,
        API_KEY_SCOPES.ADMIN_SETTINGS
      ];

    case API_KEY_TYPES.DEVELOPMENT:
      return [API_KEY_SCOPES.DEV_ALL];

    case API_KEY_TYPES.TESTING:
      return [API_KEY_SCOPES.TEST_ALL];

    default:
      return [];
  }
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
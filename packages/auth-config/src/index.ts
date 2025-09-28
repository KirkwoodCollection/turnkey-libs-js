// Authentication headers
export {
  AUTH_HEADERS,
  BEARER_TOKEN_PREFIX,
  BASIC_AUTH_PREFIX,
  API_KEY_PREFIX,
  UNIFIED_API_KEY_HEADER,
  TOKEN_PATTERNS,
  extractBearerToken,
  extractBasicAuth,
  extractApiKey,
  formatBearerToken,
  formatBasicAuth,
  formatApiKey
} from './headers';

// CORS configuration
export {
  CORS_ORIGINS,
  INTERNAL_CORS_ORIGINS,
  CORS_METHODS,
  CORS_HEADERS,
  EXPOSED_HEADERS,
  CORS_CONFIG,
  CorsOptions,
  getCorsOptions,
  isOriginAllowed
} from './cors';

// JWT configuration
export {
  JWT_CONFIG,
  JWT_AUDIENCES,
  JWT_ISSUERS,
  JWT_CLAIMS,
  JWT_SCOPES,
  JwtPayload,
  isTokenExpired,
  isTokenValid,
  shouldRefreshToken,
  getTokenTimeToLive
} from './jwt';

// API Key configuration
export {
  API_KEY_TYPES,
  API_KEY_PREFIXES,
  API_KEY_ENVIRONMENTS,
  API_KEY_PATTERNS,
  API_KEY_SCOPES,
  API_KEY_RATE_LIMITS,
  ApiKeyInfo,
  parseApiKey,
  generateApiKey,
  validateApiKey,
  maskApiKey,
  getApiKeyScopes
} from './api-keys';
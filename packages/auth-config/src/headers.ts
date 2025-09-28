export const AUTH_HEADERS = {
  // Standard authentication headers
  AUTHORIZATION: 'Authorization',
  WWW_AUTHENTICATE: 'WWW-Authenticate',
  PROXY_AUTHORIZATION: 'Proxy-Authorization',
  PROXY_AUTHENTICATE: 'Proxy-Authenticate',

  // Custom API key headers (unified to X-API-Key per GPT-5 guidance)
  API_KEY: 'X-API-Key',
  INTERNAL_API_KEY: 'X-API-Key',      // DEPRECATED: Use API_KEY instead
  SERVICE_API_KEY: 'X-API-Key',       // DEPRECATED: Use API_KEY instead
  WIDGET_API_KEY: 'X-API-Key',        // DEPRECATED: Use API_Key instead

  // Request tracking headers
  CORRELATION_ID: 'X-Correlation-ID',
  REQUEST_ID: 'X-Request-ID',
  TRACE_ID: 'X-Trace-ID',
  SPAN_ID: 'X-Span-ID',

  // User context headers
  USER_ID: 'X-User-ID',
  SESSION_ID: 'X-Session-ID',
  TENANT_ID: 'X-Tenant-ID',
  ORGANIZATION_ID: 'X-Organization-ID',

  // Security headers
  CSRF_TOKEN: 'X-CSRF-Token',
  XSRF_TOKEN: 'X-XSRF-TOKEN',
  CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
  X_FRAME_OPTIONS: 'X-Frame-Options',
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',

  // Client information headers
  USER_AGENT: 'User-Agent',
  X_FORWARDED_FOR: 'X-Forwarded-For',
  X_REAL_IP: 'X-Real-IP',
  X_CLIENT_IP: 'X-Client-IP',

  // Service-to-service headers
  SERVICE_NAME: 'X-Service-Name',
  SERVICE_VERSION: 'X-Service-Version',
  SERVICE_INSTANCE: 'X-Service-Instance',

  // Rate limiting headers
  RATE_LIMIT: 'X-RateLimit-Limit',
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',

  // CORS headers
  ACCESS_CONTROL_ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
  ACCESS_CONTROL_ALLOW_METHODS: 'Access-Control-Allow-Methods',
  ACCESS_CONTROL_ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  ACCESS_CONTROL_ALLOW_CREDENTIALS: 'Access-Control-Allow-Credentials',
  ACCESS_CONTROL_EXPOSE_HEADERS: 'Access-Control-Expose-Headers',
  ACCESS_CONTROL_MAX_AGE: 'Access-Control-Max-Age'
} as const;

export const BEARER_TOKEN_PREFIX = 'Bearer' as const;
export const BASIC_AUTH_PREFIX = 'Basic' as const;
export const API_KEY_PREFIX = 'ApiKey' as const;

// Unified API key header (replaces all variants)
export const UNIFIED_API_KEY_HEADER = 'X-API-Key' as const;

export const TOKEN_PATTERNS = {
  BEARER: /^Bearer\s+(.+)$/i,
  BASIC: /^Basic\s+(.+)$/i,
  API_KEY: /^ApiKey\s+(.+)$/i,
  JWT: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
} as const;

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(TOKEN_PATTERNS.BEARER);
  return match ? match[1] : null;
}

export function extractBasicAuth(authHeader?: string): { username: string; password: string } | null {
  if (!authHeader) return null;
  const match = authHeader.match(TOKEN_PATTERNS.BASIC);
  if (!match) return null;

  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    return username && password ? { username, password } : null;
  } catch {
    return null;
  }
}

export function extractApiKey(authHeader?: string): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(TOKEN_PATTERNS.API_KEY);
  return match ? match[1] : null;
}

export function formatBearerToken(token: string): string {
  return `${BEARER_TOKEN_PREFIX} ${token}`;
}

export function formatBasicAuth(username: string, password: string): string {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `${BASIC_AUTH_PREFIX} ${credentials}`;
}

export function formatApiKey(key: string): string {
  return `${API_KEY_PREFIX} ${key}`;
}
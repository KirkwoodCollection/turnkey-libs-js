export const JWT_CONFIG = {
  // JWT algorithms
  ALGORITHMS: {
    HS256: 'HS256',
    HS384: 'HS384',
    HS512: 'HS512',
    RS256: 'RS256',
    RS384: 'RS384',
    RS512: 'RS512',
    ES256: 'ES256',
    ES384: 'ES384',
    ES512: 'ES512'
  } as const,

  // Default algorithm
  DEFAULT_ALGORITHM: 'RS256' as const,

  // Token types
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    ID: 'id',
    RESET: 'reset'
  } as const,

  // Token expiration times (seconds)
  EXPIRATION: {
    ACCESS_TOKEN: 3600,        // 1 hour
    REFRESH_TOKEN: 604800,     // 7 days
    ID_TOKEN: 3600,            // 1 hour
    RESET_TOKEN: 1800,         // 30 minutes
    ADMIN_TOKEN: 7200,         // 2 hours
    SERVICE_TOKEN: 86400,      // 24 hours
    WIDGET_TOKEN: 3600         // 1 hour
  } as const,

  // Token refresh thresholds (seconds before expiry)
  REFRESH_THRESHOLD: {
    ACCESS_TOKEN: 300,         // 5 minutes
    ID_TOKEN: 300,             // 5 minutes
    ADMIN_TOKEN: 600,          // 10 minutes
    SERVICE_TOKEN: 3600        // 1 hour
  } as const
} as const;

export const JWT_AUDIENCES = {
  // Service audiences
  API_GATEWAY: 'api-gateway.turnkeyhms.com',
  BOOKING_SERVICE: 'booking.turnkeyhms.com',
  PAYMENT_SERVICE: 'payment.turnkeyhms.com',
  SESSION_SERVICE: 'session.turnkeyhms.com',
  ANALYTICS_SERVICE: 'analytics.turnkeyhms.com',
  EVENTS_SERVICE: 'events.turnkeyhms.com',
  AI_SERVICE: 'ai.turnkeyhms.com',

  // Client audiences
  WEB_APP: 'web.turnkeyhms.com',
  MOBILE_APP: 'mobile.turnkeyhms.com',
  ADMIN_APP: 'admin.turnkeyhms.com',
  WIDGET_APP: 'widget.turnkeyhms.com',

  // General audience
  TURNKEY_HMS: 'turnkeyhms.com'
} as const;

export const JWT_ISSUERS = {
  // Primary issuer
  TURNKEY_HMS: 'https://auth.turnkeyhms.com',

  // Service issuers
  API_GATEWAY: 'https://api.turnkeyhms.com',
  ADMIN_SERVICE: 'https://admin.turnkeyhms.com',

  // Development issuer
  DEVELOPMENT: 'https://dev.turnkeyhms.com'
} as const;

export const JWT_CLAIMS = {
  // Standard claims
  ISSUER: 'iss',
  SUBJECT: 'sub',
  AUDIENCE: 'aud',
  EXPIRATION: 'exp',
  NOT_BEFORE: 'nbf',
  ISSUED_AT: 'iat',
  JWT_ID: 'jti',

  // Custom claims
  USER_ID: 'user_id',
  SESSION_ID: 'session_id',
  TENANT_ID: 'tenant_id',
  ORGANIZATION_ID: 'org_id',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  SCOPES: 'scopes',
  TOKEN_TYPE: 'token_type',
  CLIENT_ID: 'client_id',
  EMAIL: 'email',
  EMAIL_VERIFIED: 'email_verified',
  NAME: 'name',
  PICTURE: 'picture',

  // Service-specific claims
  SERVICE_NAME: 'service_name',
  SERVICE_VERSION: 'service_version',
  API_VERSION: 'api_version',

  // Security claims
  AUTH_TIME: 'auth_time',
  ACR: 'acr',  // Authentication Context Class Reference
  AMR: 'amr'   // Authentication Methods References
} as const;

export const JWT_SCOPES = {
  // Read scopes
  READ_PROFILE: 'profile:read',
  READ_BOOKINGS: 'bookings:read',
  READ_PAYMENTS: 'payments:read',
  READ_ANALYTICS: 'analytics:read',
  READ_SESSIONS: 'sessions:read',

  // Write scopes
  WRITE_BOOKINGS: 'bookings:write',
  WRITE_PAYMENTS: 'payments:write',
  WRITE_PROFILE: 'profile:write',

  // Admin scopes
  ADMIN_USERS: 'admin:users',
  ADMIN_PROPERTIES: 'admin:properties',
  ADMIN_REPORTS: 'admin:reports',
  ADMIN_SETTINGS: 'admin:settings',

  // Service scopes
  SERVICE_INTERNAL: 'service:internal',
  SERVICE_HEALTH: 'service:health',
  SERVICE_METRICS: 'service:metrics',

  // Special scopes
  OFFLINE_ACCESS: 'offline_access',
  OPENID: 'openid'
} as const;

export interface JwtPayload {
  [JWT_CLAIMS.ISSUER]: string;
  [JWT_CLAIMS.SUBJECT]: string;
  [JWT_CLAIMS.AUDIENCE]: string | string[];
  [JWT_CLAIMS.EXPIRATION]: number;
  [JWT_CLAIMS.NOT_BEFORE]?: number;
  [JWT_CLAIMS.ISSUED_AT]: number;
  [JWT_CLAIMS.JWT_ID]?: string;
  [JWT_CLAIMS.USER_ID]?: string;
  [JWT_CLAIMS.SESSION_ID]?: string;
  [JWT_CLAIMS.TENANT_ID]?: string;
  [JWT_CLAIMS.ORGANIZATION_ID]?: string;
  [JWT_CLAIMS.ROLES]?: string[];
  [JWT_CLAIMS.PERMISSIONS]?: string[];
  [JWT_CLAIMS.SCOPES]?: string[];
  [JWT_CLAIMS.TOKEN_TYPE]?: string;
  [JWT_CLAIMS.CLIENT_ID]?: string;
  [JWT_CLAIMS.EMAIL]?: string;
  [JWT_CLAIMS.EMAIL_VERIFIED]?: boolean;
  [JWT_CLAIMS.NAME]?: string;
  [JWT_CLAIMS.PICTURE]?: string;
  [JWT_CLAIMS.SERVICE_NAME]?: string;
  [JWT_CLAIMS.SERVICE_VERSION]?: string;
  [JWT_CLAIMS.API_VERSION]?: string;
  [JWT_CLAIMS.AUTH_TIME]?: number;
  [JWT_CLAIMS.ACR]?: string;
  [JWT_CLAIMS.AMR]?: string[];
}

export function isTokenExpired(payload: JwtPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export function isTokenValid(payload: JwtPayload): boolean {
  const now = Math.floor(Date.now() / 1000);

  // Check expiration
  if (payload.exp <= now) {
    return false;
  }

  // Check not before (if present)
  if (payload.nbf && payload.nbf > now) {
    return false;
  }

  return true;
}

export function shouldRefreshToken(payload: JwtPayload, tokenType: keyof typeof JWT_CONFIG.REFRESH_THRESHOLD): boolean {
  const threshold = JWT_CONFIG.REFRESH_THRESHOLD[tokenType];
  if (!threshold) return false;

  const now = Math.floor(Date.now() / 1000);
  return (payload.exp - now) <= threshold;
}

export function getTokenTimeToLive(payload: JwtPayload): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}
/**
 * Authentication and JWT configuration constants
 * Based on ADR-001: WebSocket Ownership & Auth
 *
 * These constants ensure consistent JWT contract between Session service (issuer)
 * and WebSocket service (validator) as mandated by GPT-5 ADR-001
 */

/**
 * JWT Algorithm and Claims Configuration
 * ADR-001 specifies HS256 for admin WebSocket auth
 */
export const JWT_CONFIG = {
  // Algorithm (locked by ADR-001)
  ALGORITHM: 'HS256',

  // Standard claims (locked by ADR-001)
  AUDIENCE: 'turnkey-platform',
  ISSUER: 'turnkey-session',

  // Token lifespan (ADR-001 recommendation)
  MAX_EXPIRY_MINUTES: 15,

  // Required admin roles (any of these)
  REQUIRED_ADMIN_ROLES: [
    'admin',
    'administrator'
  ],

  // Required admin permissions (any of these)
  REQUIRED_ADMIN_PERMISSIONS: [
    'admin:*',
    'admin:read',
    'admin:write',
    'system:admin',
    'turnkey:admin'
  ]
} as const;

/**
 * Canonical Environment Variable Names
 * ADR-001 mandates these exact names for JWT secrets
 */
export const JWT_ENV_VARS = {
  // WebSocket service JWT validator
  WEBSOCKET_SECRET: 'WEBSOCKET_JWT_SECRET_KEY',
  WEBSOCKET_AUDIENCE: 'WEBSOCKET_JWT_AUDIENCE',

  // Session service JWT issuer
  SESSION_SECRET: 'SESSION_JWT_SECRET_KEY',
  SESSION_ISSUER: 'SESSION_JWT_ISSUER'
} as const;

/**
 * Authentication Headers
 * Standardized across all services
 */
export const AUTH_HEADERS = {
  // Primary auth header (post ADR-001)
  API_KEY: 'X-API-Key',

  // Legacy header (deprecated, removal pending)
  LEGACY_API_KEY: 'X-Internal-API-Key',

  // Bearer token for user auth
  AUTHORIZATION: 'Authorization'
} as const;

/**
 * WebSocket Authentication Contract
 * ADR-001 specifies query parameter token passing
 */
export const WEBSOCKET_AUTH = {
  // Token parameter name
  TOKEN_PARAM: 'token',

  // Auth method (no API key at WebSocket edge per ADR-001)
  METHOD: 'JWT_QUERY_PARAM',

  // Connection close codes for auth failures
  CLOSE_CODES: {
    UNAUTHORIZED: 4001,
    FORBIDDEN: 4003,
    TOKEN_EXPIRED: 4010,
    INVALID_ROLE: 4020
  }
} as const;

/**
 * Helper function to build WebSocket URL with JWT token
 * @param baseUrl - WebSocket base URL
 * @param token - JWT token
 * @returns Complete WebSocket URL with token parameter
 */
export function buildWebSocketUrl(baseUrl: string, token: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set(WEBSOCKET_AUTH.TOKEN_PARAM, token);
  return url.toString();
}

/**
 * Validate JWT claims structure for admin access
 * @param claims - Decoded JWT claims
 * @returns True if claims meet admin requirements
 */
export function validateAdminClaims(claims: any): boolean {
  // Check required fields
  if (!claims.sub || !claims.roles || !claims.permissions) {
    return false;
  }

  // Check admin role
  const hasAdminRole = JWT_CONFIG.REQUIRED_ADMIN_ROLES.some(role =>
    claims.roles.includes(role)
  );

  // Check admin permissions
  const hasAdminPermission = JWT_CONFIG.REQUIRED_ADMIN_PERMISSIONS.some(permission =>
    claims.permissions.includes(permission)
  );

  return hasAdminRole && hasAdminPermission;
}

/**
 * Get environment-specific JWT configuration
 * @returns JWT configuration object for current environment
 */
export function getJwtConfig(): typeof JWT_CONFIG {
  return JWT_CONFIG;
}

/**
 * Get canonical environment variable names for JWT
 * @returns Environment variable name mappings
 */
export function getJwtEnvVars(): typeof JWT_ENV_VARS {
  return JWT_ENV_VARS;
}
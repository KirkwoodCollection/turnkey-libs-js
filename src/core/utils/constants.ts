// Shared constants - no business logic, only transport and utility constants

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST', 
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const;

export const CONNECTION_STATES = {
  CONNECTING: 'CONNECTING',
  OPEN: 'OPEN',
  CLOSING: 'CLOSING',
  CLOSED: 'CLOSED',
  RECONNECTING: 'RECONNECTING'
} as const;

export const ERROR_TYPES = {
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  MESSAGE_SEND_FAILED: 'MESSAGE_SEND_FAILED',
  HEARTBEAT_TIMEOUT: 'HEARTBEAT_TIMEOUT',
  RECONNECT_FAILED: 'RECONNECT_FAILED',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
} as const;

export const DEFAULT_CONFIG = {
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 30000,
  HEARTBEAT_INTERVAL: 30000,
  HEARTBEAT_TIMEOUT: 5000,
  MAX_RECONNECT_ATTEMPTS: 10
} as const;

export const MIME_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

export const EVENT_TYPES = {
  CONNECTION_STATE_CHANGED: 'connectionStateChanged',
  MESSAGE_RECEIVED: 'message',
  ERROR_OCCURRED: 'error',
  HEARTBEAT_PING: 'ping',
  HEARTBEAT_PONG: 'pong'
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'turnkey_auth_token',
  REFRESH_TOKEN: 'turnkey_refresh_token',
  SESSION_ID: 'turnkey_session_id',
  USER_PREFERENCES: 'turnkey_user_preferences'
} as const;

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
} as const;

export const CURRENCY_CODES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL',
  'MXN', 'SGD', 'HKD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'ILS'
] as const;

// Environment detection utilities
export const ENV_CHECKS = {
  isBrowser: () => typeof window !== 'undefined',
  isNode: () => typeof process !== 'undefined' && process.versions && process.versions.node,
  isWebWorker: () => typeof self !== 'undefined' && typeof (self as any).importScripts === 'function',
  hasLocalStorage: () => {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  },
  hasSessionStorage: () => {
    try {
      return typeof sessionStorage !== 'undefined';
    } catch {
      return false;
    }
  },
  hasWebSocket: () => typeof WebSocket !== 'undefined',
  hasFetch: () => typeof fetch !== 'undefined'
} as const;
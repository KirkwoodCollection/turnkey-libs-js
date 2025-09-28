import { EnvironmentConfig } from './environment';

/**
 * Firestore collection names shared across multiple services
 * These collections are accessed by multiple microservices and must remain consistent
 *
 * Naming convention: lowercase with underscores for multi-word collections
 */
export const FIRESTORE_COLLECTIONS = {
  // Core domain collections
  SESSIONS: 'sessions',
  EVENTS: 'events',
  EVENT_AGGREGATES: 'event_aggregates',
  BOOKINGS: 'bookings',
  BOOKING_STAGES: 'booking_stages',

  // User and authentication
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  USER_SESSIONS: 'user_sessions',

  // Property and inventory
  PROPERTIES: 'properties',
  ROOMS: 'rooms',
  AVAILABILITY: 'availability',
  RATES: 'rates',

  // Analytics and metrics
  METRICS_CACHE: 'metrics_cache',
  ANALYTICS_EVENTS: 'analytics_events',
  FUNNEL_METRICS: 'funnel_metrics',
  CONVERSION_DATA: 'conversion_data',

  // Configuration and settings
  SYSTEM_CONFIG: 'system_config',
  FEATURE_FLAGS: 'feature_flags',
  SERVICE_HEALTH: 'service_health',

  // Notifications and communications
  NOTIFICATIONS: 'notifications',
  EMAIL_TEMPLATES: 'email_templates',
  NOTIFICATION_PREFERENCES: 'notification_preferences',

  // AI and machine learning
  AI_MODELS: 'ai_models',
  AI_PREDICTIONS: 'ai_predictions',
  ML_TRAINING_DATA: 'ml_training_data',

  // Audit and logging
  AUDIT_LOGS: 'audit_logs',
  ERROR_LOGS: 'error_logs',
  ACTIVITY_LOGS: 'activity_logs'
} as const;

/**
 * Environment-specific Firestore database IDs
 * Different environments may use different Firestore database instances
 */
export const FIRESTORE_DATABASES: EnvironmentConfig<string> = {
  development: '(default)',
  staging: '(default)',
  production: '(default)'
};

/**
 * Firestore collection groups (for collection group queries)
 * These represent collections that exist as subcollections across multiple documents
 */
export const FIRESTORE_COLLECTION_GROUPS = {
  // Subcollections that appear under multiple parent documents
  TIMELINE_EVENTS: 'timeline_events',
  COMMENTS: 'comments',
  ATTACHMENTS: 'attachments',
  HISTORY: 'history',
  METADATA: 'metadata'
} as const;

/**
 * Common Firestore field names used across collections
 * Ensures consistency in field naming across the platform
 */
export const FIRESTORE_FIELDS = {
  // Standard document fields
  ID: 'id',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  CREATED_BY: 'createdBy',
  UPDATED_BY: 'updatedBy',
  DELETED_AT: 'deletedAt',
  VERSION: 'version',

  // Common business fields
  STATUS: 'status',
  TYPE: 'type',
  CATEGORY: 'category',
  PRIORITY: 'priority',
  TAGS: 'tags',
  METADATA: 'metadata',

  // User-related fields
  USER_ID: 'userId',
  SESSION_ID: 'sessionId',
  TENANT_ID: 'tenantId',
  ORGANIZATION_ID: 'organizationId',

  // Booking-related fields
  BOOKING_ID: 'bookingId',
  PROPERTY_ID: 'propertyId',
  ROOM_ID: 'roomId',
  CHECK_IN: 'checkIn',
  CHECK_OUT: 'checkOut',
  GUEST_COUNT: 'guestCount',

  // Analytics fields
  EVENT_TYPE: 'eventType',
  EVENT_DATA: 'eventData',
  TIMESTAMP: 'timestamp',
  SOURCE: 'source',
  CORRELATION_ID: 'correlationId'
} as const;

/**
 * Common Firestore indexes that should be created across environments
 * These represent frequently queried field combinations
 */
export const FIRESTORE_INDEXES = {
  // Common query patterns
  USER_SESSIONS: ['userId', 'status', 'createdAt'],
  BOOKING_SEARCH: ['propertyId', 'checkIn', 'checkOut', 'status'],
  EVENT_TIMELINE: ['sessionId', 'timestamp'],
  ANALYTICS_QUERIES: ['eventType', 'timestamp', 'userId'],
  PROPERTY_AVAILABILITY: ['propertyId', 'date', 'status'],

  // Admin and monitoring queries
  AUDIT_SEARCH: ['action', 'timestamp', 'userId'],
  ERROR_ANALYSIS: ['service', 'errorType', 'timestamp'],
  HEALTH_MONITORING: ['service', 'status', 'timestamp']
} as const;

/**
 * Firestore configuration settings
 */
export const FIRESTORE_CONFIG = {
  // Query limits
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 1000,
  BATCH_SIZE: 500,

  // Cache settings
  CACHE_SIZE_BYTES: 40 * 1024 * 1024, // 40MB
  OFFLINE_PERSISTENCE: true,

  // Retry settings
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,

  // Connection timeouts
  CONNECTION_TIMEOUT_MS: 30000,
  IDLE_TIMEOUT_MS: 60000
} as const;

/**
 * Get the Firestore database ID for a given environment
 * @param environment - Environment to get database ID for
 * @returns Firestore database ID
 */
export function getFirestoreDatabase(environment: keyof typeof FIRESTORE_DATABASES): string {
  return FIRESTORE_DATABASES[environment];
}

/**
 * Validate collection name follows naming conventions
 * @param collectionName - Collection name to validate
 * @returns True if collection name follows conventions
 */
export function isValidCollectionName(collectionName: string): boolean {
  // Collection names should be lowercase with underscores, no spaces or special chars
  const pattern = /^[a-z]+(_[a-z]+)*$/;
  return pattern.test(collectionName);
}

/**
 * Get a collection reference path
 * @param collectionName - Name of the collection
 * @param documentId - Optional document ID to create document reference path
 * @returns Collection or document reference path
 *
 * @example
 * getCollectionPath(FIRESTORE_COLLECTIONS.SESSIONS) // 'sessions'
 * getCollectionPath(FIRESTORE_COLLECTIONS.SESSIONS, 'session123') // 'sessions/session123'
 */
export function getCollectionPath(collectionName: string, documentId?: string): string {
  return documentId ? `${collectionName}/${documentId}` : collectionName;
}

/**
 * Get a subcollection reference path
 * @param parentCollection - Parent collection name
 * @param parentDocumentId - Parent document ID
 * @param subCollection - Subcollection name
 * @param subDocumentId - Optional subdocument ID
 * @returns Subcollection or subdocument reference path
 *
 * @example
 * getSubcollectionPath('sessions', 'session123', 'events') // 'sessions/session123/events'
 * getSubcollectionPath('sessions', 'session123', 'events', 'event456') // 'sessions/session123/events/event456'
 */
export function getSubcollectionPath(
  parentCollection: string,
  parentDocumentId: string,
  subCollection: string,
  subDocumentId?: string
): string {
  const basePath = `${parentCollection}/${parentDocumentId}/${subCollection}`;
  return subDocumentId ? `${basePath}/${subDocumentId}` : basePath;
}

/**
 * Collection ownership and access patterns
 * Defines which services are the primary owners vs consumers of each collection
 */
export const COLLECTION_OWNERSHIP = {
  // Service ownership (primary writer)
  OWNERS: {
    [FIRESTORE_COLLECTIONS.SESSIONS]: 'turnkey-session',
    [FIRESTORE_COLLECTIONS.EVENTS]: 'turnkey-events',
    [FIRESTORE_COLLECTIONS.BOOKINGS]: 'turnkey-booking-api',
    [FIRESTORE_COLLECTIONS.USERS]: 'turnkey-auth',
    [FIRESTORE_COLLECTIONS.PROPERTIES]: 'turnkey-property-service'
  },

  // Services that read from these collections
  CONSUMERS: {
    [FIRESTORE_COLLECTIONS.SESSIONS]: ['turnkey-analytics', 'turnkey-events'],
    [FIRESTORE_COLLECTIONS.EVENTS]: ['turnkey-analytics', 'turnkey-ai-insights'],
    [FIRESTORE_COLLECTIONS.BOOKINGS]: ['turnkey-analytics', 'turnkey-events'],
    [FIRESTORE_COLLECTIONS.USERS]: ['turnkey-session', 'turnkey-booking-api']
  }
} as const;
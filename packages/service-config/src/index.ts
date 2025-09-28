// Environment utilities
export {
  Environment,
  EnvironmentConfig,
  ENV_SUFFIX_MAP,
  getEnvironment,
  getConfig,
  getConfigForEnvironment,
  getEnvironmentSuffix,
  appendEnvironmentSuffix,
  createEnvironmentResourceName
} from './environment';

// Service URLs
export {
  SERVICE_BASE_URLS,
  INTERNAL_SERVICE_URLS,
  THIRD_PARTY_URLS
} from './service-urls';

// Timeout configurations
export {
  TIMEOUTS,
  RETRY_CONFIG
} from './timeouts';

// Port configurations
export {
  DEFAULT_PORTS,
  SERVICE_PORT_RANGES,
  getServicePort,
  isPortInRange
} from './ports';

// Route definitions
export {
  API_ROUTES,
  WIDGET_ROUTES,
  ADMIN_ROUTES,
  WEBSOCKET_ROUTES,
  STATIC_ROUTES,
  buildRoute,
  buildApiRoute,
  getWebSocketUrl
} from './routes';

// Performance and business thresholds
export {
  PERFORMANCE_THRESHOLDS,
  QUEUE_THRESHOLDS,
  DATABASE_THRESHOLDS,
  CACHE_THRESHOLDS,
  BUSINESS_THRESHOLDS
} from './thresholds';

// Pub/Sub topics and subscriptions
export {
  PUBSUB_TOPICS,
  PUBSUB_SUBSCRIPTIONS,
  DLQ_PATTERNS,
  PUBSUB_CONFIG,
  getTopicName,
  getSubscriptionName,
  getDeadLetterTopicName,
  getDeadLetterSubscriptionName,
  getAllTopicNames,
  getAllSubscriptionNames,
  isValidTopicName,
  getMigrationTopicNames,
  getMigrationSubscriptionNames
} from './pubsub';

// Firestore collections and configuration
export {
  FIRESTORE_COLLECTIONS,
  FIRESTORE_DATABASES,
  FIRESTORE_COLLECTION_GROUPS,
  FIRESTORE_FIELDS,
  FIRESTORE_INDEXES,
  FIRESTORE_CONFIG,
  COLLECTION_OWNERSHIP,
  getFirestoreDatabase,
  isValidCollectionName,
  getCollectionPath,
  getSubcollectionPath
} from './firestore';

// Redis keys and configuration
export {
  REDIS_KEYS,
  REDIS_CONSUMER_GROUPS,
  REDIS_DATABASES,
  REDIS_CONFIG,
  REDIS_TTL,
  REDIS_POOL_CONFIG,
  buildRedisKey,
  buildWebSocketChannel,
  buildCacheKey,
  parseRedisKey,
  isValidRedisKey,
  getRedisConfig
} from './redis';

// Service names and configuration
export {
  SERVICE_NAMES,
  SERVICE_CONFIGS,
  SERVICE_CATEGORIES,
  SERVICE_DEPENDENCIES,
  SERVICE_URL_PATTERNS,
  SERVICE_ROLES,
  SERVICE_HEALTH_CONFIG,
  SERVICE_DISCOVERY,
  getServiceConfig,
  getServicePort as getServiceDefaultPort,
  buildServiceUrl,
  getServicesByCategory,
  getServiceDependents,
  getServiceDependencies,
  isValidServiceName,
  getServicePriority
} from './services';

// BigQuery datasets and configuration
export {
  BIGQUERY_DATASETS,
  BIGQUERY_TABLES,
  BIGQUERY_PROJECTS,
  BIGQUERY_LOCATIONS,
  BIGQUERY_SCHEMA_FIELDS,
  BIGQUERY_JOB_CONFIG,
  BIGQUERY_RETENTION,
  getBigQueryDataset,
  getBigQueryProject,
  buildTableReference,
  buildSqlTableReference,
  getTableRetention,
  isValidDatasetName,
  isValidTableName
} from './bigquery';

// Authentication and JWT configuration
export {
  JWT_CONFIG,
  JWT_ENV_VARS,
  AUTH_HEADERS,
  WEBSOCKET_AUTH,
  buildWebSocketUrl,
  validateAdminClaims,
  getJwtConfig,
  getJwtEnvVars
} from './auth';
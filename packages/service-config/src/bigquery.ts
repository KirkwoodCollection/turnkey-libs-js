import { EnvironmentConfig } from './environment';

/**
 * BigQuery dataset names for analytics and data warehouse operations
 * Environment-specific to allow for separate staging and production data
 */
export const BIGQUERY_DATASETS: EnvironmentConfig<Record<string, string>> = {
  development: {
    ANALYTICS: 'turnkey_analytics_dev',
    EVENTS: 'turnkey_events_dev',
    BOOKINGS: 'turnkey_bookings_dev',
    SESSIONS: 'turnkey_sessions_dev',
    USERS: 'turnkey_users_dev',
    PROPERTIES: 'turnkey_properties_dev',
    RAW_DATA: 'turnkey_raw_dev',
    STAGING: 'turnkey_staging_dev'
  },
  staging: {
    ANALYTICS: 'turnkey_analytics_staging',
    EVENTS: 'turnkey_events_staging',
    BOOKINGS: 'turnkey_bookings_staging',
    SESSIONS: 'turnkey_sessions_staging',
    USERS: 'turnkey_users_staging',
    PROPERTIES: 'turnkey_properties_staging',
    RAW_DATA: 'turnkey_raw_staging',
    STAGING: 'turnkey_staging_area'
  },
  production: {
    ANALYTICS: 'turnkey_analytics',
    EVENTS: 'turnkey_events',
    BOOKINGS: 'turnkey_bookings',
    SESSIONS: 'turnkey_sessions',
    USERS: 'turnkey_users',
    PROPERTIES: 'turnkey_properties',
    RAW_DATA: 'turnkey_raw',
    STAGING: 'turnkey_staging'
  }
};

/**
 * Standard BigQuery table names within datasets
 * These tables are commonly used across different datasets
 */
export const BIGQUERY_TABLES = {
  // Event tracking tables
  EVENTS: 'events',
  EVENT_PARAMETERS: 'event_parameters',
  USER_EVENTS: 'user_events',
  SESSION_EVENTS: 'session_events',

  // Analytics tables
  FUNNEL_METRICS: 'funnel_metrics',
  CONVERSION_RATES: 'conversion_rates',
  USER_JOURNEY: 'user_journey',
  PAGE_VIEWS: 'page_views',
  SEARCH_ANALYTICS: 'search_analytics',

  // Booking-specific tables
  BOOKINGS: 'bookings',
  BOOKING_ATTEMPTS: 'booking_attempts',
  BOOKING_FUNNEL: 'booking_funnel',
  CANCELLATIONS: 'cancellations',
  MODIFICATIONS: 'modifications',

  // Session tracking tables
  SESSIONS: 'sessions',
  SESSION_ATTRIBUTES: 'session_attributes',
  SESSION_TIMELINE: 'session_timeline',

  // User data tables
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  USER_PREFERENCES: 'user_preferences',
  USER_SEGMENTS: 'user_segments',

  // Property and inventory tables
  PROPERTIES: 'properties',
  ROOMS: 'rooms',
  AVAILABILITY: 'availability',
  RATES: 'rates',
  INVENTORY_SNAPSHOTS: 'inventory_snapshots',

  // Raw data ingestion tables
  RAW_EVENTS: 'raw_events',
  RAW_LOGS: 'raw_logs',
  RAW_IMPORTS: 'raw_imports',

  // Aggregated views and materialized tables
  DAILY_METRICS: 'daily_metrics',
  WEEKLY_REPORTS: 'weekly_reports',
  MONTHLY_REPORTS: 'monthly_reports',
  REAL_TIME_METRICS: 'real_time_metrics'
} as const;

/**
 * BigQuery project configuration by environment
 */
export const BIGQUERY_PROJECTS: EnvironmentConfig<string> = {
  development: 'turnkey-hms-dev',
  staging: 'turnkey-hms-staging',
  production: 'turnkey-hms-prod'
};

/**
 * BigQuery locations/regions by environment
 */
export const BIGQUERY_LOCATIONS: EnvironmentConfig<string> = {
  development: 'US',
  staging: 'US',
  production: 'US'
};

/**
 * Common BigQuery schema field definitions
 * Ensures consistency across tables that share similar fields
 */
export const BIGQUERY_SCHEMA_FIELDS = {
  // Standard timestamp fields
  TIMESTAMP: { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
  CREATED_AT: { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
  UPDATED_AT: { name: 'updated_at', type: 'TIMESTAMP', mode: 'NULLABLE' },

  // Identifier fields
  ID: { name: 'id', type: 'STRING', mode: 'REQUIRED' },
  USER_ID: { name: 'user_id', type: 'STRING', mode: 'NULLABLE' },
  SESSION_ID: { name: 'session_id', type: 'STRING', mode: 'NULLABLE' },
  BOOKING_ID: { name: 'booking_id', type: 'STRING', mode: 'NULLABLE' },
  PROPERTY_ID: { name: 'property_id', type: 'STRING', mode: 'NULLABLE' },

  // Event fields
  EVENT_TYPE: { name: 'event_type', type: 'STRING', mode: 'REQUIRED' },
  EVENT_DATA: { name: 'event_data', type: 'JSON', mode: 'NULLABLE' },
  SOURCE: { name: 'source', type: 'STRING', mode: 'NULLABLE' },

  // Tracking fields
  IP_ADDRESS: { name: 'ip_address', type: 'STRING', mode: 'NULLABLE' },
  USER_AGENT: { name: 'user_agent', type: 'STRING', mode: 'NULLABLE' },
  REFERRER: { name: 'referrer', type: 'STRING', mode: 'NULLABLE' },

  // Geolocation fields
  COUNTRY: { name: 'country', type: 'STRING', mode: 'NULLABLE' },
  REGION: { name: 'region', type: 'STRING', mode: 'NULLABLE' },
  CITY: { name: 'city', type: 'STRING', mode: 'NULLABLE' },

  // Revenue and business fields
  REVENUE: { name: 'revenue', type: 'NUMERIC', mode: 'NULLABLE' },
  CURRENCY: { name: 'currency', type: 'STRING', mode: 'NULLABLE' },
  CONVERSION_VALUE: { name: 'conversion_value', type: 'NUMERIC', mode: 'NULLABLE' }
} as const;

/**
 * BigQuery job configuration defaults
 */
export const BIGQUERY_JOB_CONFIG = {
  // Query job settings
  QUERY_TIMEOUT_MS: 600000,        // 10 minutes
  MAX_RESULTS: 10000,
  USE_LEGACY_SQL: false,
  USE_QUERY_CACHE: true,

  // Load job settings
  WRITE_DISPOSITION: 'WRITE_APPEND',
  CREATE_DISPOSITION: 'CREATE_IF_NEEDED',
  SKIP_LEADING_ROWS: 1,
  ALLOW_QUOTED_NEWLINES: true,
  ALLOW_JAGGED_ROWS: false,

  // Extract job settings
  COMPRESSION: 'GZIP',
  DESTINATION_FORMAT: 'CSV',
  PRINT_HEADER: true
} as const;

/**
 * Data retention policies by table type
 */
export const BIGQUERY_RETENTION = {
  // Raw data retention (in days)
  RAW_EVENTS: 90,
  RAW_LOGS: 30,

  // Processed data retention
  EVENTS: 365,
  SESSIONS: 365,
  BOOKINGS: 2555,              // 7 years for financial records

  // Analytics data retention
  DAILY_METRICS: 1095,         // 3 years
  WEEKLY_REPORTS: 1095,
  MONTHLY_REPORTS: 2190,       // 6 years

  // Real-time data retention
  REAL_TIME_METRICS: 7         // 1 week
} as const;

/**
 * Get BigQuery dataset name for environment
 * @param datasetKey - Dataset key from BIGQUERY_DATASETS
 * @param environment - Target environment
 * @returns Full dataset name for the environment
 */
export function getBigQueryDataset(
  datasetKey: keyof typeof BIGQUERY_DATASETS.production,
  environment: keyof typeof BIGQUERY_DATASETS
): string {
  return BIGQUERY_DATASETS[environment][datasetKey];
}

/**
 * Get BigQuery project ID for environment
 * @param environment - Target environment
 * @returns Project ID for the environment
 */
export function getBigQueryProject(environment: keyof typeof BIGQUERY_PROJECTS): string {
  return BIGQUERY_PROJECTS[environment];
}

/**
 * Build a fully qualified BigQuery table reference
 * @param dataset - Dataset name or key
 * @param table - Table name
 * @param project - Project ID (optional, uses current environment if not provided)
 * @param environment - Environment to use for project/dataset resolution
 * @returns Fully qualified table reference in format: project.dataset.table
 *
 * @example
 * buildTableReference('ANALYTICS', 'events', undefined, 'production')
 * // Returns: 'turnkey-hms-prod.turnkey_analytics.events'
 */
export function buildTableReference(
  dataset: string | keyof typeof BIGQUERY_DATASETS.production,
  table: string,
  project?: string,
  environment: keyof typeof BIGQUERY_DATASETS = 'development'
): string {
  const resolvedProject = project || getBigQueryProject(environment);
  const resolvedDataset = typeof dataset === 'string' && !(dataset in BIGQUERY_DATASETS.production)
    ? dataset
    : getBigQueryDataset(dataset as keyof typeof BIGQUERY_DATASETS.production, environment);

  return `${resolvedProject}.${resolvedDataset}.${table}`;
}

/**
 * Build a SQL table reference with backticks for queries
 * @param dataset - Dataset name or key
 * @param table - Table name
 * @param project - Project ID (optional)
 * @param environment - Environment to use for resolution
 * @returns SQL-safe table reference with backticks
 *
 * @example
 * buildSqlTableReference('ANALYTICS', 'events', undefined, 'production')
 * // Returns: '`turnkey-hms-prod.turnkey_analytics.events`'
 */
export function buildSqlTableReference(
  dataset: string | keyof typeof BIGQUERY_DATASETS.production,
  table: string,
  project?: string,
  environment: keyof typeof BIGQUERY_DATASETS = 'development'
): string {
  const tableRef = buildTableReference(dataset, table, project, environment);
  return `\`${tableRef}\``;
}

/**
 * Get data retention period for a table
 * @param tableType - Table type from BIGQUERY_RETENTION
 * @returns Retention period in days
 */
export function getTableRetention(tableType: keyof typeof BIGQUERY_RETENTION): number {
  return BIGQUERY_RETENTION[tableType];
}

/**
 * Validate BigQuery dataset name format
 * @param datasetName - Dataset name to validate
 * @returns True if dataset name follows BigQuery naming conventions
 */
export function isValidDatasetName(datasetName: string): boolean {
  // BigQuery dataset names: alphanumeric and underscores, max 1024 chars
  const pattern = /^[a-zA-Z0-9_]{1,1024}$/;
  return pattern.test(datasetName);
}

/**
 * Validate BigQuery table name format
 * @param tableName - Table name to validate
 * @returns True if table name follows BigQuery naming conventions
 */
export function isValidTableName(tableName: string): boolean {
  // BigQuery table names: alphanumeric and underscores, max 1024 chars
  const pattern = /^[a-zA-Z0-9_]{1,1024}$/;
  return pattern.test(tableName);
}
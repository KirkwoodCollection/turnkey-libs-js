import { Environment, appendEnvironmentSuffix } from './environment';

/**
 * Base Pub/Sub topic names (without environment suffixes)
 * These represent the core event streams in the TurnkeyHMS platform
 */
export const PUBSUB_TOPICS = {
  // Core domain event topics
  BOOKING_EVENTS: 'booking-events',
  SESSION_EVENTS: 'session-events',
  ANALYTICS_EVENTS: 'analytics-events',
  AI_INSIGHTS_EVENTS: 'ai-insights-events',
  FINGERPRINT_EVENTS: 'fingerprint-events',

  // Result and response topics
  AI_INSIGHTS_RESULTS: 'ai-insights-results',

  // Infrastructure topics
  EVENTS_DLQ: 'events-dlq',

  // Additional event streams
  USER_EVENTS: 'user-events',
  PROPERTY_EVENTS: 'property-events',
  PAYMENT_EVENTS: 'payment-events',
  NOTIFICATION_EVENTS: 'notification-events'
} as const;

/**
 * Base subscription names (without environment suffixes)
 * These represent the standard subscription patterns across services
 */
export const PUBSUB_SUBSCRIPTIONS = {
  // Service-specific subscriptions
  EVENTS_INGEST: 'events-service-ingest-sub',
  ANALYTICS_PROCESSOR: 'analytics-processor',
  SESSION_EVENTS_ANALYTICS: 'session-events-analytics',
  AI_INSIGHTS_SUB: 'ai-insights-events-sub',

  // Cross-service subscriptions
  BOOKING_ANALYTICS: 'booking-events-analytics',
  SESSION_PROCESSOR: 'session-processor',
  NOTIFICATION_DISPATCHER: 'notification-dispatcher',

  // Dead letter subscriptions
  DLQ_PROCESSOR: 'dlq-processor'
} as const;

/**
 * Dead letter queue naming patterns
 */
export const DLQ_PATTERNS = {
  TOPIC_SUFFIX: 'dead-letter',
  SUBSCRIPTION_SUFFIX: 'dlq-sub'
} as const;

/**
 * Get a topic name with appropriate environment suffix
 * @param baseTopic - Base topic name from PUBSUB_TOPICS
 * @param environment - Environment to append suffix for (defaults to current environment)
 * @returns Full topic name with environment suffix
 *
 * @example
 * getTopicName(PUBSUB_TOPICS.BOOKING_EVENTS, 'production') // 'booking-events-production'
 * getTopicName(PUBSUB_TOPICS.SESSION_EVENTS, 'development') // 'session-events'
 */
export function getTopicName(baseTopic: string, environment?: Environment): string {
  return appendEnvironmentSuffix(baseTopic, environment);
}

/**
 * Get a subscription name with appropriate environment suffix
 * @param baseSubscription - Base subscription name from PUBSUB_SUBSCRIPTIONS
 * @param environment - Environment to append suffix for (defaults to current environment)
 * @returns Full subscription name with environment suffix
 *
 * @example
 * getSubscriptionName(PUBSUB_SUBSCRIPTIONS.ANALYTICS_PROCESSOR, 'staging') // 'analytics-processor-staging'
 */
export function getSubscriptionName(baseSubscription: string, environment?: Environment): string {
  return appendEnvironmentSuffix(baseSubscription, environment);
}

/**
 * Generate a dead letter topic name for a given base topic
 * @param baseTopic - Base topic name
 * @param environment - Environment to append suffix for (defaults to current environment)
 * @returns Dead letter topic name
 *
 * @example
 * getDeadLetterTopicName(PUBSUB_TOPICS.BOOKING_EVENTS, 'production') // 'booking-events-dead-letter-production'
 */
export function getDeadLetterTopicName(baseTopic: string, environment?: Environment): string {
  const baseWithDlq = `${baseTopic}-${DLQ_PATTERNS.TOPIC_SUFFIX}`;
  return appendEnvironmentSuffix(baseWithDlq, environment);
}

/**
 * Generate a dead letter subscription name for a given base topic
 * @param baseTopic - Base topic name
 * @param environment - Environment to append suffix for (defaults to current environment)
 * @returns Dead letter subscription name
 *
 * @example
 * getDeadLetterSubscriptionName(PUBSUB_TOPICS.BOOKING_EVENTS, 'production') // 'booking-events-dlq-sub-production'
 */
export function getDeadLetterSubscriptionName(baseTopic: string, environment?: Environment): string {
  const baseWithDlq = `${baseTopic}-${DLQ_PATTERNS.SUBSCRIPTION_SUFFIX}`;
  return appendEnvironmentSuffix(baseWithDlq, environment);
}

/**
 * Get all topic names for a given environment
 * @param environment - Environment to get topics for (defaults to current environment)
 * @returns Record of all topic names with environment suffixes applied
 */
export function getAllTopicNames(environment?: Environment): Record<keyof typeof PUBSUB_TOPICS, string> {
  const result = {} as Record<keyof typeof PUBSUB_TOPICS, string>;

  for (const [key, baseTopic] of Object.entries(PUBSUB_TOPICS)) {
    result[key as keyof typeof PUBSUB_TOPICS] = getTopicName(baseTopic, environment);
  }

  return result;
}

/**
 * Get all subscription names for a given environment
 * @param environment - Environment to get subscriptions for (defaults to current environment)
 * @returns Record of all subscription names with environment suffixes applied
 */
export function getAllSubscriptionNames(environment?: Environment): Record<keyof typeof PUBSUB_SUBSCRIPTIONS, string> {
  const result = {} as Record<keyof typeof PUBSUB_SUBSCRIPTIONS, string>;

  for (const [key, baseSubscription] of Object.entries(PUBSUB_SUBSCRIPTIONS)) {
    result[key as keyof typeof PUBSUB_SUBSCRIPTIONS] = getSubscriptionName(baseSubscription, environment);
  }

  return result;
}

/**
 * Validate topic name format
 * @param topicName - Topic name to validate
 * @returns True if topic name follows naming conventions
 */
export function isValidTopicName(topicName: string): boolean {
  // Topic names should be lowercase with hyphens, optionally with environment suffix
  const pattern = /^[a-z]+(-[a-z]+)*(-(?:staging|production))?$/;
  return pattern.test(topicName);
}

/**
 * Common Pub/Sub configuration defaults
 */
export const PUBSUB_CONFIG = {
  // Message retention settings
  MESSAGE_RETENTION_DURATION: '7d', // 7 days

  // Acknowledgment settings
  ACK_DEADLINE_SECONDS: 600, // 10 minutes

  // Retry settings
  MINIMUM_BACKOFF: '10s',
  MAXIMUM_BACKOFF: '600s',

  // Delivery settings
  MAX_DELIVERY_ATTEMPTS: 5,

  // Batch settings
  MAX_MESSAGES: 100,
  MAX_BYTES: 1024 * 1024, // 1MB
  MAX_LATENCY: '100ms'
} as const;

/**
 * Get both old and new topic names for migration period
 * Supports dual-subscription during transition from -production to -prod
 * @param baseName - Base topic name
 * @param environment - Current environment
 * @returns Array of topic names to subscribe to during migration
 */
export function getMigrationTopicNames(
  baseName: string,
  environment: Environment
): string[] {
  const newTopic = getTopicName(baseName, environment);

  // For production, also include legacy -production suffix
  if (environment === 'production') {
    const legacyTopic = `${baseName}-production`;
    return [newTopic, legacyTopic];
  }

  return [newTopic];
}

/**
 * Get both old and new subscription names for migration period
 * @param baseName - Base subscription name
 * @param environment - Current environment
 * @returns Array of subscription names to use during migration
 */
export function getMigrationSubscriptionNames(
  baseName: string,
  environment: Environment
): string[] {
  const newSubscription = getSubscriptionName(baseName, environment);

  // For production, also include legacy -production suffix
  if (environment === 'production') {
    const legacySubscription = `${baseName}-production`;
    return [newSubscription, legacySubscription];
  }

  return [newSubscription];
}
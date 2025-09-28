import {
  SERVICE_CONFIGS,
  SERVICE_NAMES,
  getServiceConfig,
  buildServiceUrl,
  getServicesByCategory,
  getServicePriority
} from '../src/services';

import {
  PUBSUB_TOPICS,
  getTopicName,
  getSubscriptionName,
  getMigrationTopicNames,
  getMigrationSubscriptionNames
} from '../src/pubsub';

import {
  FIRESTORE_COLLECTIONS,
  getCollectionPath,
  getSubcollectionPath,
  isValidCollectionName
} from '../src/firestore';

import {
  REDIS_KEYS,
  buildRedisKey,
  buildWebSocketChannel,
  parseRedisKey,
  isValidRedisKey
} from '../src/redis';

import {
  BIGQUERY_DATASETS,
  getBigQueryDataset,
  buildTableReference,
  buildSqlTableReference
} from '../src/bigquery';

import {
  getWebSocketUrl,
  WEBSOCKET_ROUTES
} from '../src/routes';

import {
  Environment,
  getEnvironment,
  getEnvironmentSuffix,
  appendEnvironmentSuffix
} from '../src/environment';

describe('Service Configuration Integration Tests', () => {
  describe('Port Assignments', () => {
    test('All development ports are unique', () => {
      const ports = Object.values(SERVICE_CONFIGS).map(config => config.defaultPort);
      const uniquePorts = new Set(ports);

      expect(uniquePorts.size).toBe(ports.length);
    });

    test('Port assignments match GPT-5 verified values', () => {
      expect(SERVICE_CONFIGS[SERVICE_NAMES.EVENTS].defaultPort).toBe(8080);
      expect(SERVICE_CONFIGS[SERVICE_NAMES.BOOKING_API].defaultPort).toBe(8000);
      expect(SERVICE_CONFIGS[SERVICE_NAMES.SESSION].defaultPort).toBe(8003);
      expect(SERVICE_CONFIGS[SERVICE_NAMES.ANALYTICS].defaultPort).toBe(8001);
      expect(SERVICE_CONFIGS[SERVICE_NAMES.WEBSOCKET].defaultPort).toBe(8002);
      expect(SERVICE_CONFIGS[SERVICE_NAMES.GATEWAY].defaultPort).toBe(8005);
      expect(SERVICE_CONFIGS[SERVICE_NAMES.ADMIN_DASHBOARD].defaultPort).toBe(3001);
      expect(SERVICE_CONFIGS[SERVICE_NAMES.ADMIN_API].defaultPort).toBe(8006);
    });

    test('No port conflicts between services', () => {
      const portUsage: Record<number, string[]> = {};

      Object.entries(SERVICE_CONFIGS).forEach(([serviceName, config]) => {
        const port = config.defaultPort;
        if (!portUsage[port]) {
          portUsage[port] = [];
        }
        portUsage[port].push(serviceName);
      });

      // Check for conflicts
      Object.entries(portUsage).forEach(([port, services]) => {
        expect(services.length).toBe(1);
      });
    });
  });

  describe('Pub/Sub Topic Configuration', () => {
    test('Topic names follow -prod suffix convention', () => {
      const prodTopic = getTopicName(PUBSUB_TOPICS.BOOKING_EVENTS, 'production');
      expect(prodTopic).toBe('booking-events-prod');

      const stagingTopic = getTopicName(PUBSUB_TOPICS.SESSION_EVENTS, 'staging');
      expect(stagingTopic).toBe('session-events-staging');

      const devTopic = getTopicName(PUBSUB_TOPICS.ANALYTICS_EVENTS, 'development');
      expect(devTopic).toBe('analytics-events');
    });

    test('Migration helper includes both old and new topic names', () => {
      const migrationTopics = getMigrationTopicNames(PUBSUB_TOPICS.BOOKING_EVENTS, 'production');

      expect(migrationTopics).toContain('booking-events-prod');
      expect(migrationTopics).toContain('booking-events-production');
      expect(migrationTopics).toHaveLength(2);
    });

    test('Migration helper for non-production environments', () => {
      const devTopics = getMigrationTopicNames(PUBSUB_TOPICS.BOOKING_EVENTS, 'development');
      const stagingTopics = getMigrationTopicNames(PUBSUB_TOPICS.BOOKING_EVENTS, 'staging');

      expect(devTopics).toEqual(['booking-events']);
      expect(stagingTopics).toEqual(['booking-events-staging']);
    });

    test('Subscription migration follows same pattern', () => {
      const migrationSubs = getMigrationSubscriptionNames('analytics-processor', 'production');

      expect(migrationSubs).toContain('analytics-processor-prod');
      expect(migrationSubs).toContain('analytics-processor-production');
    });
  });

  describe('WebSocket Configuration', () => {
    test('WebSocket paths are correctly defined', () => {
      expect(WEBSOCKET_ROUTES.PRIMARY).toBe('/ws');
      expect(WEBSOCKET_ROUTES.LEGACY).toBe('/websocket/ws');
    });

    test('WebSocket URLs are correctly formatted', () => {
      const devUrl = getWebSocketUrl('development', 'events');
      expect(devUrl).toBe('ws://localhost:8080/ws');

      const devWebSocketUrl = getWebSocketUrl('development', 'websocket');
      expect(devWebSocketUrl).toBe('ws://localhost:8002/ws');

      const prodUrl = getWebSocketUrl('production', 'websocket');
      expect(prodUrl).toBe('wss://api.turnkeyhms.com/ws');
    });

    test('Legacy WebSocket path support', () => {
      const legacyUrl = getWebSocketUrl('development', 'events', true);
      expect(legacyUrl).toBe('ws://localhost:8080/websocket/ws');
    });
  });

  describe('Environment Configuration', () => {
    test('Environment suffix mapping is correct', () => {
      expect(getEnvironmentSuffix('development')).toBe('');
      expect(getEnvironmentSuffix('staging')).toBe('staging');
      expect(getEnvironmentSuffix('production')).toBe('prod');
    });

    test('Environment suffix appending works correctly', () => {
      expect(appendEnvironmentSuffix('booking-events', 'production')).toBe('booking-events-prod');
      expect(appendEnvironmentSuffix('session-data', 'staging')).toBe('session-data-staging');
      expect(appendEnvironmentSuffix('analytics-events', 'development')).toBe('analytics-events');
    });
  });

  describe('Firestore Configuration', () => {
    test('Collection names are valid', () => {
      Object.values(FIRESTORE_COLLECTIONS).forEach(collectionName => {
        expect(isValidCollectionName(collectionName)).toBe(true);
      });
    });

    test('Collection paths are built correctly', () => {
      const docPath = getCollectionPath(FIRESTORE_COLLECTIONS.BOOKINGS, 'booking123');
      expect(docPath).toBe('bookings/booking123');

      const collPath = getCollectionPath(FIRESTORE_COLLECTIONS.SESSIONS);
      expect(collPath).toBe('sessions');
    });

    test('Subcollection paths work correctly', () => {
      const subPath = getSubcollectionPath(
        FIRESTORE_COLLECTIONS.SESSIONS,
        'session123',
        'events',
        'event456'
      );
      expect(subPath).toBe('sessions/session123/events/event456');
    });
  });

  describe('Redis Configuration', () => {
    test('Redis keys are built correctly', () => {
      const sessionKey = buildRedisKey(REDIS_KEYS.SESSION_PREFIX, 'user123');
      expect(sessionKey).toBe('session:user123');

      const cacheKey = buildRedisKey(REDIS_KEYS.CACHE_PREFIX, 'api', 'user/profile');
      expect(cacheKey).toBe('cache:api:user/profile');
    });

    test('WebSocket channels are built correctly', () => {
      const channel = buildWebSocketChannel('room123');
      expect(channel).toBe('turnkey:ws:room:room123');

      const subChannel = buildWebSocketChannel('room123', 'messages');
      expect(subChannel).toBe('turnkey:ws:room:room123:messages');
    });

    test('Redis key parsing works correctly', () => {
      const parsed = parseRedisKey('session:user123:data');
      expect(parsed.prefix).toBe('session:');
      expect(parsed.identifier).toBe('user123');
      expect(parsed.subKey).toBe('data');
    });

    test('Redis key validation', () => {
      expect(isValidRedisKey('session:user123')).toBe(true);
      expect(isValidRedisKey('cache:api:user/profile')).toBe(true);
      expect(isValidRedisKey('Invalid Key With Spaces')).toBe(false);
    });
  });

  describe('BigQuery Configuration', () => {
    test('Dataset names follow environment conventions', () => {
      const prodDataset = getBigQueryDataset('ANALYTICS', 'production');
      expect(prodDataset).toBe('turnkey_analytics');

      const stagingDataset = getBigQueryDataset('ANALYTICS', 'staging');
      expect(stagingDataset).toBe('turnkey_analytics_staging');

      const devDataset = getBigQueryDataset('ANALYTICS', 'development');
      expect(devDataset).toBe('turnkey_analytics_dev');
    });

    test('Table references are built correctly', () => {
      const tableRef = buildTableReference('ANALYTICS', 'events', undefined, 'production');
      expect(tableRef).toBe('turnkey-hms-prod.turnkey_analytics.events');

      const sqlRef = buildSqlTableReference('ANALYTICS', 'events', undefined, 'production');
      expect(sqlRef).toBe('`turnkey-hms-prod.turnkey_analytics.events`');
    });
  });

  describe('Service Dependencies', () => {
    test('Service categories are properly defined', () => {
      const backendServices = getServicesByCategory('BACKEND');
      expect(backendServices).toContain(SERVICE_NAMES.EVENTS);
      expect(backendServices).toContain(SERVICE_NAMES.ANALYTICS);

      const frontendServices = getServicesByCategory('FRONTEND');
      expect(frontendServices).toContain(SERVICE_NAMES.ADMIN_DASHBOARD);
    });

    test('Service priorities are correctly assigned', () => {
      expect(getServicePriority(SERVICE_NAMES.GATEWAY)).toBe(1); // CRITICAL
      expect(getServicePriority(SERVICE_NAMES.EVENTS)).toBe(2); // IMPORTANT
      expect(getServicePriority(SERVICE_NAMES.AI_INSIGHTS)).toBe(3); // OPTIONAL
    });
  });

  describe('Configuration Consistency', () => {
    test('All service names follow naming convention', () => {
      Object.values(SERVICE_NAMES).forEach(serviceName => {
        expect(serviceName).toMatch(/^turnkey-[a-z]+(-[a-z]+)*$/);
      });
    });

    test('All topic names follow naming convention', () => {
      Object.values(PUBSUB_TOPICS).forEach(topicName => {
        expect(topicName).toMatch(/^[a-z]+(-[a-z]+)*$/);
      });
    });

    test('Service configs exist for all service names', () => {
      // Check that core services have configurations
      const coreServices = [
        SERVICE_NAMES.EVENTS,
        SERVICE_NAMES.BOOKING_API,
        SERVICE_NAMES.SESSION,
        SERVICE_NAMES.ANALYTICS,
        SERVICE_NAMES.WEBSOCKET,
        SERVICE_NAMES.GATEWAY,
        SERVICE_NAMES.ADMIN_DASHBOARD,
        SERVICE_NAMES.ADMIN_API
      ];

      coreServices.forEach(serviceName => {
        expect(SERVICE_CONFIGS[serviceName]).toBeDefined();
        expect(getServiceConfig(serviceName)).toBeDefined();
      });
    });
  });

  describe('Cross-Environment Compatibility', () => {
    const environments: Environment[] = ['development', 'staging', 'production'];

    test('All environments support topic generation', () => {
      environments.forEach(env => {
        const topic = getTopicName(PUBSUB_TOPICS.BOOKING_EVENTS, env);
        expect(topic).toBeDefined();
        expect(typeof topic).toBe('string');
      });
    });

    test('All environments support BigQuery dataset resolution', () => {
      environments.forEach(env => {
        const dataset = getBigQueryDataset('ANALYTICS', env);
        expect(dataset).toBeDefined();
        expect(typeof dataset).toBe('string');
      });
    });

    test('WebSocket URLs work for all environments', () => {
      environments.forEach(env => {
        const url = getWebSocketUrl(env);
        expect(url).toBeDefined();
        expect(url).toMatch(/^wss?:\/\//);
      });
    });
  });
});
import { EnvironmentConfig } from './environment';

export const DEFAULT_PORTS = {
  // Application services
  API_GATEWAY: 8080,
  BOOKING_SERVICE: 8081,
  PAYMENT_SERVICE: 8082,
  SESSION_SERVICE: 8083,
  ANALYTICS_SERVICE: 8084,
  EVENTS_SERVICE: 8085,
  AI_SERVICE: 8086,

  // Frontend applications
  MAIN_APP: 3000,
  ADMIN_APP: 3001,
  WIDGET_APP: 3002,
  ANALYTICS_DASHBOARD: 3003,

  // Development tools
  DEV_SERVER: 3000,
  STORYBOOK: 6006,
  DOCS_SERVER: 4000,

  // Infrastructure
  REDIS: 6379,
  POSTGRES: 5432,
  MONGODB: 27017,
  ELASTICSEARCH: 9200,

  // Monitoring
  PROMETHEUS: 9090,
  GRAFANA: 3000,
  JAEGER: 16686,

  // Message queues
  RABBITMQ: 5672,
  KAFKA: 9092,

  // WebSocket
  WS_SERVER: 8080,
  WS_SECURE: 8443
} as const;

export const SERVICE_PORT_RANGES: EnvironmentConfig<Record<string, number>> = {
  development: {
    START_PORT: 8080,
    END_PORT: 8099
  },
  staging: {
    START_PORT: 8100,
    END_PORT: 8199
  },
  production: {
    START_PORT: 8080,
    END_PORT: 8099
  }
};

export function getServicePort(serviceName: keyof typeof DEFAULT_PORTS): number {
  return DEFAULT_PORTS[serviceName];
}

export function isPortInRange(port: number, environment: keyof typeof SERVICE_PORT_RANGES): boolean {
  const range = SERVICE_PORT_RANGES[environment];
  return port >= range.START_PORT && port <= range.END_PORT;
}
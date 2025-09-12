export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded', 
  UNHEALTHY = 'unhealthy'
}

export enum DependencyType {
  DATABASE = 'database',
  CACHE = 'cache',
  MESSAGE_QUEUE = 'message_queue',
  EXTERNAL_API = 'external_api',
  STORAGE = 'storage',
  SEARCH = 'search'
}

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  service: string;
  version?: string;
}

export interface DetailedHealthResponse extends HealthResponse {
  uptime: number;
  memory: MemoryUsage;
  cpu?: number;
  metrics: ServiceMetrics;
  environment?: string;
  build?: string;
}

export interface DependencyHealth {
  name: string;
  type: DependencyType;
  status: HealthStatus;
  responseTime?: number;
  lastChecked: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface DependenciesHealthResponse extends HealthResponse {
  dependencies: DependencyHealth[];
}

export interface IntegrationTestResult {
  name: string;
  status: HealthStatus;
  duration: number;
  error?: string;
  details?: Record<string, any>;
}

export interface IntegrationTestResponse extends HealthResponse {
  tests: IntegrationTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
  heap?: {
    used: number;
    total: number;
  };
}

export interface ServiceMetrics {
  requestCount: number;
  errorRate: number;
  averageResponseTime: number;
  lastRequestTimestamp?: string;
  customMetrics?: Record<string, number | string>;
}

export interface DatabaseDependencyMetadata {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  queryStats?: {
    slowQueries: number;
    avgQueryTime: number;
  };
}

export interface CacheDependencyMetadata {
  hitRate: number;
  missRate: number;
  evictions: number;
  keyCount?: number;
}

export interface MessageQueueDependencyMetadata {
  queueDepth: number;
  pendingMessages: number;
  deadLetterCount?: number;
}

export type DependencyMetadata = 
  | DatabaseDependencyMetadata 
  | CacheDependencyMetadata 
  | MessageQueueDependencyMetadata 
  | Record<string, any>;

export interface HealthCheckOptions {
  timeout?: number;
  retries?: number;
  includeDetails?: boolean;
}

export interface DependencyConfig {
  name: string;
  type: DependencyType;
  checkUrl?: string;
  timeout?: number;
  critical?: boolean;
  checker?: () => Promise<DependencyHealth>;
}
// Main exports for @turnkey/health-monitoring package
export * from './types.js';
export * from './health-monitor.js';
export * from './metrics-collector.js';
export * from './dependency-checkers.js';

// Re-export commonly used types for convenience
export type {
  HealthResponse,
  DetailedHealthResponse,
  DependenciesHealthResponse,
  IntegrationTestResponse,
  DependencyHealth,
  IntegrationTestResult,
  ServiceMetrics,
  MemoryUsage,
  DependencyConfig,
  HealthCheckOptions
} from './types.js';

// Re-export main classes
export { HealthMonitor } from './health-monitor.js';
export { MetricsCollector } from './metrics-collector.js';
export { DependencyCheckers } from './dependency-checkers.js';

// Re-export middleware helpers
export {
  createExpressMiddleware,
  createFastifyPlugin
} from './metrics-collector.js';
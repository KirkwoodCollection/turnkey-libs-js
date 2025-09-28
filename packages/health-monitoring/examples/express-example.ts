import express from 'express';
import { HealthMonitor } from '../src/health-monitor.js';
import { MetricsCollector, createExpressMiddleware } from '../src/metrics-collector.js';
import { DependencyCheckers } from '../src/dependency-checkers.js';
import { DependencyType, HealthStatus } from '../src/types.js';
import { DEFAULT_PORTS, API_ROUTES } from '@turnkey/service-config';
import { HTTP_STATUS } from '@turnkey/constants';

// Initialize Express app
const app = express();

// Initialize health monitoring
const healthMonitor = new HealthMonitor('admin-dashboard', '2.1.0');
const metricsCollector = new MetricsCollector();

// Add metrics middleware
app.use(createExpressMiddleware(metricsCollector));

// Register dependencies
healthMonitor.registerDependency({
  name: 'postgres-db',
  type: DependencyType.DATABASE,
  critical: true,
  checker: async () => {
    // Mock database connection check
    const mockDb = {
      query: async (sql: string) => ({ rows: [{ health_check: 1 }] }),
      getStats: async () => ({
        connectionPool: { active: 5, idle: 15, total: 20 },
        queryStats: { slowQueries: 2, avgQueryTime: 45 }
      })
    };
    return DependencyCheckers.checkDatabase('postgres-db', mockDb);
  }
});

healthMonitor.registerDependency({
  name: 'redis-cache',
  type: DependencyType.CACHE,
  critical: false,
  checker: async () => {
    const mockRedis = {
      ping: async () => 'PONG',
      getStats: async () => ({
        hitRate: 0.85,
        missRate: 0.15,
        evictions: 120,
        keyCount: 5000
      })
    };
    return DependencyCheckers.checkRedisCache('redis-cache', mockRedis);
  }
});

healthMonitor.registerDependency({
  name: 'api-gateway',
  type: DependencyType.EXTERNAL_API,
  critical: true,
  checker: async () => DependencyCheckers.checkHttpService(
    'api-gateway', 
    'http://api-gateway:8080/health',
    { timeout: 3000 }
  )
});

// Register integration tests
healthMonitor.registerIntegrationTest('user-login-flow', async () => {
  const startTime = Date.now();
  
  try {
    // Mock integration test
    await new Promise(resolve => setTimeout(resolve, 100));
    const success = Math.random() > 0.1; // 90% success rate
    
    if (!success) {
      throw new Error('Login flow test failed');
    }
    
    return {
      name: 'user-login-flow',
      status: HealthStatus.HEALTHY,
      duration: Date.now() - startTime,
      details: {
        steps: ['authenticate', 'load-profile', 'redirect'],
        performance: 'good'
      }
    };
  } catch (error) {
    return {
      name: 'user-login-flow',
      status: HealthStatus.UNHEALTHY,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Test failed'
    };
  }
});

// Update metrics periodically
setInterval(() => {
  const metrics = metricsCollector.getMetrics();
  healthMonitor.updateMetrics(metrics);
  
  // Add custom metrics
  metricsCollector.recordCustomMetric('bundle_size_kb', 2800);
  metricsCollector.recordCustomMetric('load_time_ms', 850);
  metricsCollector.recordCustomMetric('active_users', 45);
}, 30000);

// Health endpoints
app.get(API_ROUTES.HEALTH, async (req, res) => {
  try {
    const health = await healthMonitor.getBasicHealth();
    const statusCode = health.status === 'unhealthy' ? HTTP_STATUS.SERVICE_UNAVAILABLE : HTTP_STATUS.OK;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'admin-dashboard',
      error: 'Health check failed'
    });
  }
});

app.get(API_ROUTES.HEALTH_DETAILED, async (req, res) => {
  try {
    const health = await healthMonitor.getDetailedHealth();
    const statusCode = health.status === 'unhealthy' ? HTTP_STATUS.SERVICE_UNAVAILABLE : HTTP_STATUS.OK;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'admin-dashboard',
      error: 'Detailed health check failed'
    });
  }
});

app.get(API_ROUTES.HEALTH_DEPENDENCIES, async (req, res) => {
  try {
    const health = await healthMonitor.getDependenciesHealth();
    const statusCode = health.status === 'unhealthy' ? HTTP_STATUS.SERVICE_UNAVAILABLE : HTTP_STATUS.OK;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'admin-dashboard',
      dependencies: [],
      error: 'Dependencies health check failed'
    });
  }
});

app.get(API_ROUTES.HEALTH_INTEGRATION_TEST, async (req, res) => {
  try {
    const health = await healthMonitor.getIntegrationTestHealth();
    const statusCode = health.status === 'unhealthy' ? HTTP_STATUS.SERVICE_UNAVAILABLE : HTTP_STATUS.OK;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'admin-dashboard',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      error: 'Integration tests failed'
    });
  }
});

// Sample application routes
app.get('/', (req, res) => {
  res.json({ message: 'Admin Dashboard API', version: '2.1.0' });
});

app.get('/users', (req, res) => {
  // Simulate some processing time
  setTimeout(() => {
    res.json({ users: [] });
  }, Math.random() * 100);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || DEFAULT_PORTS.MAIN_APP;
app.listen(PORT, () => {
  console.log(`Admin Dashboard server running on port ${PORT}`);
  console.log('Health endpoints:');
  console.log(`  GET http://localhost:${PORT}${API_ROUTES.HEALTH}`);
  console.log(`  GET http://localhost:${PORT}${API_ROUTES.HEALTH_DETAILED}`);
  console.log(`  GET http://localhost:${PORT}${API_ROUTES.HEALTH_DEPENDENCIES}`);
  console.log(`  GET http://localhost:${PORT}${API_ROUTES.HEALTH_INTEGRATION_TEST}`);
});

export { app, healthMonitor, metricsCollector };
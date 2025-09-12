// Example for a React booking widget service
import express from 'express';
import { HealthMonitor } from '../src/health-monitor.js';
import { MetricsCollector, createExpressMiddleware } from '../src/metrics-collector.js';
import { DependencyCheckers } from '../src/dependency-checkers.js';
import { DependencyType, HealthStatus } from '../src/types.js';

const app = express();

// Initialize health monitoring for booking widget
const healthMonitor = new HealthMonitor('booking-widget', '3.2.1');
const metricsCollector = new MetricsCollector({ 
  windowSize: 600000, // 10 minutes for frontend service
  maxSamples: 2000 
});

app.use(createExpressMiddleware(metricsCollector));

// Register frontend-specific dependencies
healthMonitor.registerDependency({
  name: 'api-gateway',
  type: DependencyType.EXTERNAL_API,
  critical: true,
  checker: async () => DependencyCheckers.checkHttpService(
    'api-gateway',
    'https://api.turnkeyhms.com/health',
    { timeout: 5000 }
  )
});

healthMonitor.registerDependency({
  name: 'booking-api',
  type: DependencyType.EXTERNAL_API,
  critical: true,
  checker: async () => DependencyCheckers.checkHttpService(
    'booking-api',
    'https://api.turnkeyhms.com/booking/health',
    { timeout: 3000 }
  )
});

healthMonitor.registerDependency({
  name: 'payment-service',
  type: DependencyType.EXTERNAL_API,
  critical: true,
  checker: async () => DependencyCheckers.checkHttpService(
    'payment-service',
    'https://payments.turnkeyhms.com/health',
    { timeout: 8000 }
  )
});

healthMonitor.registerDependency({
  name: 'cdn',
  type: DependencyType.EXTERNAL_API,
  critical: false,
  checker: async () => DependencyCheckers.checkHttpService(
    'cdn',
    'https://cdn.turnkeyhms.com/health',
    { timeout: 2000 }
  )
});

// Register frontend-specific integration tests
healthMonitor.registerIntegrationTest('widget-loading', async () => {
  const startTime = Date.now();
  
  try {
    // Test widget initialization flow
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Mock checking if widget assets load properly
    const bundleSize = await checkBundleSize();
    const loadTime = await simulatePageLoad();
    
    if (bundleSize > 5000) { // 5MB max
      throw new Error(`Bundle too large: ${bundleSize}KB`);
    }
    
    if (loadTime > 3000) { // 3s max load time
      throw new Error(`Load time too slow: ${loadTime}ms`);
    }
    
    return {
      name: 'widget-loading',
      status: HealthStatus.HEALTHY,
      duration: Date.now() - startTime,
      details: {
        bundle_size_kb: bundleSize,
        load_time_ms: loadTime,
        performance_score: loadTime < 1000 ? 'excellent' : 'good'
      }
    };
  } catch (error) {
    return {
      name: 'widget-loading',
      status: HealthStatus.UNHEALTHY,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Widget loading test failed'
    };
  }
});

healthMonitor.registerIntegrationTest('booking-flow', async () => {
  const startTime = Date.now();
  
  try {
    // Test end-to-end booking flow
    const steps = [
      'search-availability',
      'select-room', 
      'guest-details',
      'payment-process',
      'confirmation'
    ];
    
    for (const step of steps) {
      await simulateBookingStep(step);
    }
    
    return {
      name: 'booking-flow',
      status: HealthStatus.HEALTHY,
      duration: Date.now() - startTime,
      details: {
        steps_completed: steps,
        user_journey: 'complete'
      }
    };
  } catch (error) {
    return {
      name: 'booking-flow', 
      status: HealthStatus.UNHEALTHY,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Booking flow test failed'
    };
  }
});

// Frontend-specific metrics tracking
setInterval(() => {
  const metrics = metricsCollector.getMetrics();
  
  // Add frontend-specific metrics
  metricsCollector.recordCustomMetric('bundle_size_kb', Math.floor(Math.random() * 200) + 2800);
  metricsCollector.recordCustomMetric('load_time_ms', Math.floor(Math.random() * 500) + 800);
  metricsCollector.recordCustomMetric('time_to_interactive_ms', Math.floor(Math.random() * 300) + 1200);
  metricsCollector.recordCustomMetric('lighthouse_performance', Math.floor(Math.random() * 20) + 80);
  metricsCollector.recordCustomMetric('active_sessions', Math.floor(Math.random() * 50) + 10);
  metricsCollector.recordCustomMetric('conversion_rate', (Math.random() * 0.1 + 0.15).toFixed(3));
  
  healthMonitor.updateMetrics(metrics);
}, 60000); // Update every minute for frontend service

// Simulate widget-specific checks
async function checkBundleSize(): Promise<number> {
  // Mock bundle size check
  return Math.floor(Math.random() * 1000) + 2800; // 2.8-3.8MB
}

async function simulatePageLoad(): Promise<number> {
  // Mock page load time
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
  return Math.floor(Math.random() * 1000) + 800; // 800-1800ms
}

async function simulateBookingStep(step: string): Promise<void> {
  // Mock booking step execution
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
  
  // 2% chance of step failure
  if (Math.random() < 0.02) {
    throw new Error(`Step ${step} failed`);
  }
}

// Health endpoints with proper error handling
app.get('/health', async (req, res) => {
  try {
    const health = await healthMonitor.getBasicHealth();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'booking-widget',
      error: 'Health check failed'
    });
  }
});

app.get('/health/detailed', async (req, res) => {
  try {
    const health = await healthMonitor.getDetailedHealth();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'booking-widget',
      error: 'Detailed health check failed'
    });
  }
});

app.get('/health/dependencies', async (req, res) => {
  try {
    const health = await healthMonitor.getDependenciesHealth();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'booking-widget',
      dependencies: [],
      error: 'Dependencies health check failed'
    });
  }
});

app.get('/health/integration-test', async (req, res) => {
  try {
    const health = await healthMonitor.getIntegrationTestHealth();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'booking-widget', 
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      error: 'Integration tests failed'
    });
  }
});

// Widget-specific endpoints
app.get('/widget/config', (req, res) => {
  res.json({
    version: '3.2.1',
    features: ['availability-search', 'multi-room', 'payment-processing'],
    theme: 'default',
    customization: {
      colors: process.env.WIDGET_COLORS || 'default',
      branding: process.env.WIDGET_BRANDING || 'enabled'
    }
  });
});

app.get('/widget/health-summary', async (req, res) => {
  try {
    const [basic, dependencies] = await Promise.all([
      healthMonitor.getBasicHealth(),
      healthMonitor.getDependenciesHealth()
    ]);

    const metrics = metricsCollector.getMetrics();
    
    res.json({
      service: basic,
      dependencies: dependencies.dependencies,
      performance: {
        bundle_size_kb: metrics.customMetrics?.bundle_size_kb || 0,
        load_time_ms: metrics.customMetrics?.load_time_ms || 0,
        lighthouse_score: metrics.customMetrics?.lighthouse_performance || 0,
        active_sessions: metrics.customMetrics?.active_sessions || 0
      },
      business_metrics: {
        conversion_rate: metrics.customMetrics?.conversion_rate || 0,
        request_count: metrics.requestCount,
        error_rate: metrics.errorRate
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get health summary'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Booking Widget service running on port ${PORT}`);
  console.log('Health endpoints:');
  console.log(`  GET http://localhost:${PORT}/health`);
  console.log(`  GET http://localhost:${PORT}/health/detailed`);  
  console.log(`  GET http://localhost:${PORT}/health/dependencies`);
  console.log(`  GET http://localhost:${PORT}/health/integration-test`);
  console.log(`  GET http://localhost:${PORT}/widget/health-summary`);
});

export { app, healthMonitor, metricsCollector };
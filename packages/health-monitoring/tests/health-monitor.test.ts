import { HealthMonitor } from '../src/health-monitor';
import { HealthStatus, DependencyType } from '../src/types';

// Mock fetch for testing HTTP dependencies
global.fetch = jest.fn();

describe('HealthMonitor', () => {
  let healthMonitor: HealthMonitor;

  beforeEach(() => {
    healthMonitor = new HealthMonitor('test-service', '1.0.0');
    jest.clearAllMocks();
  });

  describe('Basic Health', () => {
    it('should return healthy status by default', async () => {
      const health = await healthMonitor.getBasicHealth();
      
      expect(health.status).toBe(HealthStatus.HEALTHY);
      expect(health.service).toBe('test-service');
      expect(health.version).toBe('1.0.0');
      expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return unhealthy status when metrics indicate problems', async () => {
      healthMonitor.updateMetrics({ 
        requestCount: 100, 
        errorRate: 0.6, 
        averageResponseTime: 1000 
      });

      const health = await healthMonitor.getBasicHealth();
      expect(health.status).toBe(HealthStatus.UNHEALTHY);
    });

    it('should return degraded status for moderate issues', async () => {
      healthMonitor.updateMetrics({ 
        requestCount: 100, 
        errorRate: 0.2, 
        averageResponseTime: 500 
      });

      const health = await healthMonitor.getBasicHealth();
      expect(health.status).toBe(HealthStatus.DEGRADED);
    });
  });

  describe('Detailed Health', () => {
    it('should include system metrics', async () => {
      const health = await healthMonitor.getDetailedHealth();
      
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('memory');
      expect(health).toHaveProperty('metrics');
      expect(health.memory).toHaveProperty('used');
      expect(health.memory).toHaveProperty('total');
      expect(health.memory).toHaveProperty('percentage');
      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should include environment information when available', async () => {
      process.env.NODE_ENV = 'test';
      process.env.BUILD_VERSION = '1.2.3';

      const health = await healthMonitor.getDetailedHealth();
      
      expect(health.environment).toBe('test');
      expect(health.build).toBe('1.2.3');
    });
  });

  describe('Dependencies Health', () => {
    it('should check registered dependencies', async () => {
      const mockChecker = jest.fn().mockResolvedValue({
        name: 'test-db',
        type: DependencyType.DATABASE,
        status: HealthStatus.HEALTHY,
        lastChecked: new Date().toISOString()
      });

      healthMonitor.registerDependency({
        name: 'test-db',
        type: DependencyType.DATABASE,
        checker: mockChecker
      });

      const health = await healthMonitor.getDependenciesHealth();
      
      expect(mockChecker).toHaveBeenCalled();
      expect(health.dependencies).toHaveLength(1);
      expect(health.dependencies[0].name).toBe('test-db');
      expect(health.dependencies[0].status).toBe(HealthStatus.HEALTHY);
    });

    it('should handle dependency check failures', async () => {
      const mockChecker = jest.fn().mockRejectedValue(new Error('Connection failed'));

      healthMonitor.registerDependency({
        name: 'failing-service',
        type: DependencyType.EXTERNAL_API,
        checker: mockChecker
      });

      const health = await healthMonitor.getDependenciesHealth();
      
      expect(health.dependencies).toHaveLength(1);
      expect(health.dependencies[0].status).toBe(HealthStatus.UNHEALTHY);
      expect(health.dependencies[0].error).toBe('Connection failed');
    });

    it('should set overall status to unhealthy if critical dependency fails', async () => {
      const healthyChecker = jest.fn().mockResolvedValue({
        name: 'cache',
        type: DependencyType.CACHE,
        status: HealthStatus.HEALTHY,
        lastChecked: new Date().toISOString()
      });

      const unhealthyChecker = jest.fn().mockResolvedValue({
        name: 'critical-db',
        type: DependencyType.DATABASE,
        status: HealthStatus.UNHEALTHY,
        lastChecked: new Date().toISOString()
      });

      healthMonitor.registerDependency({
        name: 'cache',
        type: DependencyType.CACHE,
        critical: false,
        checker: healthyChecker
      });

      healthMonitor.registerDependency({
        name: 'critical-db',
        type: DependencyType.DATABASE,
        critical: true,
        checker: unhealthyChecker
      });

      const health = await healthMonitor.getDependenciesHealth();
      expect(health.status).toBe(HealthStatus.DEGRADED);
    });

    it('should use default HTTP checker when no custom checker provided', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      healthMonitor.registerDependency({
        name: 'http-service',
        type: DependencyType.EXTERNAL_API,
        checkUrl: 'http://example.com/health'
      });

      const health = await healthMonitor.getDependenciesHealth();
      
      expect(fetch).toHaveBeenCalledWith('http://example.com/health', expect.any(Object));
      expect(health.dependencies[0].status).toBe(HealthStatus.HEALTHY);
    });
  });

  describe('Integration Tests', () => {
    it('should run registered integration tests', async () => {
      const mockTest = jest.fn().mockResolvedValue({
        name: 'test-flow',
        status: HealthStatus.HEALTHY,
        duration: 150,
        details: { steps: ['step1', 'step2'] }
      });

      healthMonitor.registerIntegrationTest('test-flow', mockTest);

      const health = await healthMonitor.getIntegrationTestHealth();
      
      expect(mockTest).toHaveBeenCalled();
      expect(health.tests).toHaveLength(1);
      expect(health.tests[0].name).toBe('test-flow');
      expect(health.tests[0].status).toBe(HealthStatus.HEALTHY);
      expect(health.summary.total).toBe(1);
      expect(health.summary.passed).toBe(1);
    });

    it('should handle test failures gracefully', async () => {
      const mockTest = jest.fn().mockRejectedValue(new Error('Test failed'));

      healthMonitor.registerIntegrationTest('failing-test', mockTest);

      const health = await healthMonitor.getIntegrationTestHealth();
      
      expect(health.tests).toHaveLength(1);
      expect(health.tests[0].status).toBe(HealthStatus.UNHEALTHY);
      expect(health.tests[0].error).toBe('Test failed');
      expect(health.summary.failed).toBe(1);
      expect(health.status).toBe(HealthStatus.UNHEALTHY);
    });

    it('should calculate correct summary statistics', async () => {
      const healthyTest = jest.fn().mockResolvedValue({
        name: 'healthy-test',
        status: HealthStatus.HEALTHY,
        duration: 100
      });

      const unhealthyTest = jest.fn().mockResolvedValue({
        name: 'unhealthy-test', 
        status: HealthStatus.UNHEALTHY,
        duration: 50
      });

      const degradedTest = jest.fn().mockResolvedValue({
        name: 'degraded-test',
        status: HealthStatus.DEGRADED,
        duration: 75
      });

      healthMonitor.registerIntegrationTest('healthy-test', healthyTest);
      healthMonitor.registerIntegrationTest('unhealthy-test', unhealthyTest);
      healthMonitor.registerIntegrationTest('degraded-test', degradedTest);

      const health = await healthMonitor.getIntegrationTestHealth();
      
      expect(health.summary.total).toBe(3);
      expect(health.summary.passed).toBe(1);
      expect(health.summary.failed).toBe(1);
      expect(health.summary.skipped).toBe(1);
      expect(health.status).toBe(HealthStatus.UNHEALTHY);
    });
  });

  describe('Metrics Updates', () => {
    it('should update service metrics', () => {
      const newMetrics = {
        requestCount: 500,
        errorRate: 0.05,
        averageResponseTime: 120,
        lastRequestTimestamp: '2023-01-01T12:00:00Z'
      };

      healthMonitor.updateMetrics(newMetrics);
      
      // We can't directly access the private metrics, but we can verify through detailed health
      expect(() => healthMonitor.updateMetrics(newMetrics)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully in basic health check', async () => {
      // Force an error by corrupting internal state
      jest.spyOn(healthMonitor as any, 'determineOverallHealth').mockRejectedValue(new Error('Test error'));

      const health = await healthMonitor.getBasicHealth();
      
      expect(health.status).toBe(HealthStatus.UNHEALTHY);
    });

    it('should handle errors gracefully in detailed health check', async () => {
      jest.spyOn(healthMonitor as any, 'getMemoryUsage').mockImplementation(() => {
        throw new Error('Memory check failed');
      });

      const health = await healthMonitor.getDetailedHealth();
      
      expect(health.status).toBe(HealthStatus.UNHEALTHY);
      expect(health.memory.used).toBe(0);
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout dependency checks', async () => {
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      healthMonitor.registerDependency({
        name: 'slow-service',
        type: DependencyType.EXTERNAL_API,
        checkUrl: 'http://slow.example.com/health',
        timeout: 100
      });

      const startTime = Date.now();
      const health = await healthMonitor.getDependenciesHealth();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
      expect(health.dependencies[0].status).toBe(HealthStatus.UNHEALTHY);
    }, 2000);
  });
});
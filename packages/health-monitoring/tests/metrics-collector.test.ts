import { MetricsCollector } from '../src/metrics-collector';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  describe('Request Tracking', () => {
    it('should record successful requests', () => {
      collector.recordRequest(150, false);
      collector.recordRequest(200, false);

      const metrics = collector.getMetrics();
      
      expect(metrics.requestCount).toBe(2);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageResponseTime).toBe(175);
      expect(metrics.lastRequestTimestamp).toBeDefined();
    });

    it('should record failed requests', () => {
      collector.recordRequest(300, true);
      collector.recordRequest(250, false);
      collector.recordRequest(400, true);

      const metrics = collector.getMetrics();
      
      expect(metrics.requestCount).toBe(3);
      expect(metrics.errorRate).toBeCloseTo(0.667, 3);
      expect(metrics.averageResponseTime).toBeCloseTo(316.67, 2);
    });

    it('should handle zero requests gracefully', () => {
      const metrics = collector.getMetrics();
      
      expect(metrics.requestCount).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.lastRequestTimestamp).toBeUndefined();
    });

    it('should limit samples to max configured value', () => {
      const smallCollector = new MetricsCollector({ maxSamples: 3 });
      
      for (let i = 0; i < 5; i++) {
        smallCollector.recordRequest(100 + i, false);
      }

      const metrics = smallCollector.getMetrics();
      
      expect(metrics.requestCount).toBe(5);
      // Average should be calculated from last 3 samples (102, 103, 104)
      expect(metrics.averageResponseTime).toBe(103);
    });
  });

  describe('Custom Metrics', () => {
    it('should record and retrieve custom metrics', () => {
      collector.recordCustomMetric('cpu_usage', 75.5);
      collector.recordCustomMetric('queue_depth', 42);
      collector.recordCustomMetric('status', 'active');

      const metrics = collector.getMetrics();
      
      expect(metrics.customMetrics).toEqual({
        cpu_usage: 75.5,
        queue_depth: 42,
        status: 'active'
      });
    });

    it('should increment counter metrics', () => {
      collector.incrementCounter('api_calls');
      collector.incrementCounter('api_calls', 5);
      collector.incrementCounter('errors', 2);

      const metrics = collector.getMetrics();
      
      expect(metrics.customMetrics).toEqual({
        api_calls: 6,
        errors: 2
      });
    });

    it('should handle non-numeric counters gracefully', () => {
      collector.recordCustomMetric('status', 'healthy');
      collector.incrementCounter('status', 1);

      const metrics = collector.getMetrics();
      
      expect(metrics.customMetrics?.status).toBe(1);
    });
  });

  describe('Metrics Reset', () => {
    it('should reset all metrics', () => {
      collector.recordRequest(200, false);
      collector.recordCustomMetric('test_metric', 100);

      collector.reset();
      const metrics = collector.getMetrics();
      
      expect(metrics.requestCount).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.lastRequestTimestamp).toBeUndefined();
      expect(metrics.customMetrics).toEqual({});
    });
  });

  describe('Response Time Calculation', () => {
    it('should calculate average response time correctly', () => {
      const responseTimes = [100, 200, 300, 400, 500];
      
      responseTimes.forEach(time => {
        collector.recordRequest(time, false);
      });

      const metrics = collector.getMetrics();
      
      expect(metrics.averageResponseTime).toBe(300);
    });

    it('should round average response time to 2 decimal places', () => {
      collector.recordRequest(100, false);
      collector.recordRequest(150, false);
      collector.recordRequest(175, false);

      const metrics = collector.getMetrics();
      
      expect(metrics.averageResponseTime).toBe(141.67);
    });
  });

  describe('Error Rate Calculation', () => {
    it('should calculate error rate correctly', () => {
      // 3 successful, 2 failed
      collector.recordRequest(100, false);
      collector.recordRequest(150, false);
      collector.recordRequest(200, false);
      collector.recordRequest(250, true);
      collector.recordRequest(300, true);

      const metrics = collector.getMetrics();
      
      expect(metrics.errorRate).toBe(0.4);
    });

    it('should handle all successful requests', () => {
      collector.recordRequest(100, false);
      collector.recordRequest(150, false);

      const metrics = collector.getMetrics();
      
      expect(metrics.errorRate).toBe(0);
    });

    it('should handle all failed requests', () => {
      collector.recordRequest(100, true);
      collector.recordRequest(150, true);

      const metrics = collector.getMetrics();
      
      expect(metrics.errorRate).toBe(1);
    });
  });

  describe('Configuration Options', () => {
    it('should respect custom max samples configuration', () => {
      const customCollector = new MetricsCollector({ 
        maxSamples: 5,
        windowSize: 60000 
      });

      // Add 10 requests
      for (let i = 0; i < 10; i++) {
        customCollector.recordRequest(i * 10, false);
      }

      const metrics = customCollector.getMetrics();
      
      // Should only keep last 5 samples for average calculation
      expect(metrics.requestCount).toBe(10);
      expect(metrics.averageResponseTime).toBe(70); // Average of 50, 60, 70, 80, 90
    });

    it('should use default configuration when no options provided', () => {
      const defaultCollector = new MetricsCollector();
      
      // Should not throw and should work with defaults
      defaultCollector.recordRequest(100, false);
      const metrics = defaultCollector.getMetrics();
      
      expect(metrics.requestCount).toBe(1);
      expect(metrics.averageResponseTime).toBe(100);
    });
  });

  describe('Timestamp Tracking', () => {
    it('should update last request timestamp', () => {
      const beforeTime = new Date();
      collector.recordRequest(100, false);
      const afterTime = new Date();

      const metrics = collector.getMetrics();
      const timestamp = new Date(metrics.lastRequestTimestamp!);
      
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should update timestamp on each request', async () => {
      collector.recordRequest(100, false);
      const firstMetrics = collector.getMetrics();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      collector.recordRequest(200, false);
      const secondMetrics = collector.getMetrics();
      
      expect(secondMetrics.lastRequestTimestamp).not.toBe(firstMetrics.lastRequestTimestamp);
      expect(new Date(secondMetrics.lastRequestTimestamp!).getTime())
        .toBeGreaterThan(new Date(firstMetrics.lastRequestTimestamp!).getTime());
    });
  });
});
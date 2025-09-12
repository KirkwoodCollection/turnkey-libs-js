import { DependencyCheckers } from '../src/dependency-checkers';
import { HealthStatus, DependencyType } from '../src/types';

// Mock fetch for HTTP service tests
global.fetch = jest.fn();

describe('DependencyCheckers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Checker', () => {
    it('should check database connection successfully', async () => {
      const mockConnection = {
        query: jest.fn().mockResolvedValue({ rows: [{ health_check: 1 }] }),
        getStats: jest.fn().mockResolvedValue({
          connectionPool: { active: 5, idle: 15, total: 20 },
          queryStats: { slowQueries: 2, avgQueryTime: 45 }
        })
      };

      const result = await DependencyCheckers.checkDatabase('test-db', mockConnection);

      expect(result.name).toBe('test-db');
      expect(result.type).toBe(DependencyType.DATABASE);
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.metadata).toEqual({
        connectionPool: { active: 5, idle: 15, total: 20 },
        queryStats: { slowQueries: 2, avgQueryTime: 45 }
      });
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT 1 as health_check');
    });

    it('should handle database connection failure', async () => {
      const mockConnection = {
        query: jest.fn().mockRejectedValue(new Error('Connection refused'))
      };

      const result = await DependencyCheckers.checkDatabase('test-db', mockConnection);

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Connection refused');
      expect(result.responseTime).toBeGreaterThan(0);
    });

    it('should handle database timeout', async () => {
      const mockConnection = {
        query: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(resolve, 10000))
        )
      };

      const result = await DependencyCheckers.checkDatabase('test-db', mockConnection, 100);

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Database check timeout');
      expect(result.responseTime).toBeLessThan(1000);
    }, 2000);

    it('should work without optional getStats method', async () => {
      const mockConnection = {
        query: jest.fn().mockResolvedValue({ rows: [{ health_check: 1 }] })
      };

      const result = await DependencyCheckers.checkDatabase('test-db', mockConnection);

      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.metadata).toBeUndefined();
    });
  });

  describe('Redis Cache Checker', () => {
    it('should check Redis connection successfully', async () => {
      const mockConnection = {
        ping: jest.fn().mockResolvedValue('PONG'),
        getStats: jest.fn().mockResolvedValue({
          hitRate: 0.85,
          missRate: 0.15,
          evictions: 120,
          keyCount: 5000
        })
      };

      const result = await DependencyCheckers.checkRedisCache('test-redis', mockConnection);

      expect(result.name).toBe('test-redis');
      expect(result.type).toBe(DependencyType.CACHE);
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.metadata).toEqual({
        hitRate: 0.85,
        missRate: 0.15,
        evictions: 120,
        keyCount: 5000
      });
      expect(mockConnection.ping).toHaveBeenCalled();
    });

    it('should handle Redis connection failure', async () => {
      const mockConnection = {
        ping: jest.fn().mockRejectedValue(new Error('Redis unavailable'))
      };

      const result = await DependencyCheckers.checkRedisCache('test-redis', mockConnection);

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Redis unavailable');
    });

    it('should handle unexpected ping response', async () => {
      const mockConnection = {
        ping: jest.fn().mockResolvedValue('UNEXPECTED')
      };

      const result = await DependencyCheckers.checkRedisCache('test-redis', mockConnection);

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Redis ping returned unexpected response');
    });

    it('should handle Redis timeout', async () => {
      const mockConnection = {
        ping: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(resolve, 10000))
        )
      };

      const result = await DependencyCheckers.checkRedisCache('test-redis', mockConnection, 100);

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Redis check timeout');
    }, 2000);
  });

  describe('HTTP Service Checker', () => {
    it('should check HTTP service successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        ok: true
      });

      const result = await DependencyCheckers.checkHttpService(
        'test-api',
        'http://example.com/health'
      );

      expect(result.name).toBe('test-api');
      expect(result.type).toBe(DependencyType.EXTERNAL_API);
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.metadata).toEqual({
        statusCode: 200,
        url: 'http://example.com/health'
      });
    });

    it('should handle HTTP service returning wrong status code', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
        ok: false
      });

      const result = await DependencyCheckers.checkHttpService(
        'test-api',
        'http://example.com/health'
      );

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Expected status 200, got 500');
      expect(result.metadata).toEqual({
        statusCode: 500,
        url: 'http://example.com/health'
      });
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await DependencyCheckers.checkHttpService(
        'test-api',
        'http://example.com/health'
      );

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Network error');
      expect(result.metadata).toEqual({
        url: 'http://example.com/health'
      });
    });

    it('should handle custom expected status codes', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 201,
        ok: true
      });

      const result = await DependencyCheckers.checkHttpService(
        'test-api',
        'http://example.com/health',
        { expectedStatus: 201 }
      );

      expect(result.status).toBe(HealthStatus.HEALTHY);
    });

    it('should include custom headers', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        ok: true
      });

      await DependencyCheckers.checkHttpService(
        'test-api',
        'http://example.com/health',
        { headers: { 'Authorization': 'Bearer token123' } }
      );

      expect(fetch).toHaveBeenCalledWith(
        'http://example.com/health',
        expect.objectContaining({
          headers: { 'Authorization': 'Bearer token123' }
        })
      );
    });

    it('should timeout HTTP requests', async () => {
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      const result = await DependencyCheckers.checkHttpService(
        'test-api',
        'http://slow.example.com/health',
        { timeout: 100 }
      );

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
    }, 2000);
  });

  describe('Message Queue Checker', () => {
    it('should check message queue successfully', async () => {
      const mockConnection = {
        getStats: jest.fn().mockResolvedValue({
          queueDepth: 50,
          pendingMessages: 10,
          deadLetterCount: 2
        })
      };

      const result = await DependencyCheckers.checkMessageQueue(
        'test-queue',
        mockConnection,
        'orders'
      );

      expect(result.name).toBe('test-queue');
      expect(result.type).toBe(DependencyType.MESSAGE_QUEUE);
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.metadata).toEqual({
        queueDepth: 50,
        pendingMessages: 10,
        deadLetterCount: 2
      });
    });

    it('should mark as degraded for high queue depth', async () => {
      const mockConnection = {
        getStats: jest.fn().mockResolvedValue({
          queueDepth: 15000,
          pendingMessages: 100
        })
      };

      const result = await DependencyCheckers.checkMessageQueue('test-queue', mockConnection);

      expect(result.status).toBe(HealthStatus.DEGRADED);
    });

    it('should mark as unhealthy for very high queue depth', async () => {
      const mockConnection = {
        getStats: jest.fn().mockResolvedValue({
          queueDepth: 60000,
          pendingMessages: 1000
        })
      };

      const result = await DependencyCheckers.checkMessageQueue('test-queue', mockConnection);

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
    });

    it('should handle message queue connection failure', async () => {
      const mockConnection = {
        getStats: jest.fn().mockRejectedValue(new Error('Queue unavailable'))
      };

      const result = await DependencyCheckers.checkMessageQueue('test-queue', mockConnection);

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Queue unavailable');
    });
  });

  describe('File System Checker', () => {
    it('should check file system access successfully', async () => {
      // Mock fs/promises module
      const mockFs = {
        access: jest.fn().mockResolvedValue(undefined),
        stat: jest.fn().mockResolvedValue({
          isDirectory: () => false,
          size: 1024,
          mtime: new Date('2023-01-01T12:00:00Z')
        })
      };

      jest.doMock('fs/promises', () => mockFs);

      const result = await DependencyCheckers.checkFileSystem(
        'test-storage',
        '/tmp/test-file'
      );

      expect(result.name).toBe('test-storage');
      expect(result.type).toBe(DependencyType.STORAGE);
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.metadata).toEqual({
        path: '/tmp/test-file',
        isDirectory: false,
        size: 1024,
        lastModified: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle file system access failure', async () => {
      const mockFs = {
        access: jest.fn().mockRejectedValue(new Error('ENOENT: no such file or directory'))
      };

      jest.doMock('fs/promises', () => mockFs);

      const result = await DependencyCheckers.checkFileSystem(
        'test-storage',
        '/nonexistent/path'
      );

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('ENOENT: no such file or directory');
      expect(result.metadata).toEqual({
        path: '/nonexistent/path'
      });
    });
  });

  describe('Custom Checker', () => {
    it('should create custom dependency checker', async () => {
      const customCheckFn = jest.fn().mockResolvedValue({ connected: true, latency: 50 });
      const evaluator = jest.fn().mockReturnValue({
        status: HealthStatus.HEALTHY,
        metadata: { latency: 50 }
      });

      const customChecker = DependencyCheckers.createCustomChecker(
        'custom-service',
        DependencyType.EXTERNAL_API,
        customCheckFn,
        evaluator
      );

      const result = await customChecker();

      expect(customCheckFn).toHaveBeenCalled();
      expect(evaluator).toHaveBeenCalledWith({ connected: true, latency: 50 });
      expect(result.name).toBe('custom-service');
      expect(result.type).toBe(DependencyType.EXTERNAL_API);
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.metadata).toEqual({ latency: 50 });
    });

    it('should handle custom checker failures', async () => {
      const customCheckFn = jest.fn().mockRejectedValue(new Error('Custom check failed'));
      const evaluator = jest.fn();

      const customChecker = DependencyCheckers.createCustomChecker(
        'custom-service',
        DependencyType.EXTERNAL_API,
        customCheckFn,
        evaluator
      );

      const result = await customChecker();

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Custom check failed');
      expect(evaluator).not.toHaveBeenCalled();
    });

    it('should handle evaluator errors', async () => {
      const customCheckFn = jest.fn().mockResolvedValue({ data: 'test' });
      const evaluator = jest.fn().mockImplementation(() => {
        throw new Error('Evaluation failed');
      });

      const customChecker = DependencyCheckers.createCustomChecker(
        'custom-service',
        DependencyType.EXTERNAL_API,
        customCheckFn,
        evaluator
      );

      const result = await customChecker();

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Evaluation failed');
    });
  });
});
import {
  DependencyHealth,
  DependencyType,
  HealthStatus,
  DatabaseDependencyMetadata,
  CacheDependencyMetadata,
  MessageQueueDependencyMetadata
} from './types.js';

export interface DatabaseConnection {
  query(sql: string): Promise<any>;
  getStats?(): Promise<DatabaseDependencyMetadata>;
}

export interface CacheConnection {
  ping(): Promise<string>;
  info?(): Promise<any>;
  getStats?(): Promise<CacheDependencyMetadata>;
}

export interface MessageQueueConnection {
  getQueueInfo?(queueName: string): Promise<any>;
  getStats?(): Promise<MessageQueueDependencyMetadata>;
}

export class DependencyCheckers {
  static async checkDatabase(
    name: string,
    connection: DatabaseConnection,
    timeout = 5000
  ): Promise<DependencyHealth> {
    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database check timeout')), timeout)
      );

      const checkPromise = connection.query('SELECT 1 as health_check');
      await Promise.race([checkPromise, timeoutPromise]);

      const responseTime = Date.now() - startTime;
      let metadata: DatabaseDependencyMetadata | undefined;

      if (connection.getStats) {
        try {
          metadata = await connection.getStats();
        } catch (error) {
          // Metadata collection failed, but main check passed
        }
      }

      return {
        name,
        type: DependencyType.DATABASE,
        status: HealthStatus.HEALTHY,
        responseTime,
        lastChecked: new Date().toISOString(),
        metadata
      };
    } catch (error) {
      return {
        name,
        type: DependencyType.DATABASE,
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  static async checkRedisCache(
    name: string,
    connection: CacheConnection,
    timeout = 5000
  ): Promise<DependencyHealth> {
    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis check timeout')), timeout)
      );

      const pingPromise = connection.ping();
      const result = await Promise.race([pingPromise, timeoutPromise]);

      if (result !== 'PONG') {
        throw new Error('Redis ping returned unexpected response');
      }

      const responseTime = Date.now() - startTime;
      let metadata: CacheDependencyMetadata | undefined;

      if (connection.getStats) {
        try {
          metadata = await connection.getStats();
        } catch (error) {
          // Metadata collection failed, but main check passed
        }
      }

      return {
        name,
        type: DependencyType.CACHE,
        status: HealthStatus.HEALTHY,
        responseTime,
        lastChecked: new Date().toISOString(),
        metadata
      };
    } catch (error) {
      return {
        name,
        type: DependencyType.CACHE,
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Cache connection failed'
      };
    }
  }

  static async checkHttpService(
    name: string,
    url: string,
    options: { timeout?: number; expectedStatus?: number; headers?: Record<string, string> } = {}
  ): Promise<DependencyHealth> {
    const { timeout = 5000, expectedStatus = 200, headers = {} } = options;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const status = response.status === expectedStatus 
        ? HealthStatus.HEALTHY 
        : HealthStatus.UNHEALTHY;

      const error = response.status !== expectedStatus 
        ? `Expected status ${expectedStatus}, got ${response.status}`
        : undefined;

      return {
        name,
        type: DependencyType.EXTERNAL_API,
        status,
        responseTime,
        lastChecked: new Date().toISOString(),
        error,
        metadata: {
          statusCode: response.status,
          url
        }
      };
    } catch (error) {
      return {
        name,
        type: DependencyType.EXTERNAL_API,
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'HTTP service check failed',
        metadata: { url }
      };
    }
  }

  static async checkMessageQueue(
    name: string,
    connection: MessageQueueConnection,
    queueName?: string,
    timeout = 5000
  ): Promise<DependencyHealth> {
    const startTime = Date.now();

    try {
      let metadata: MessageQueueDependencyMetadata | undefined;

      if (connection.getStats) {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Message queue check timeout')), timeout)
        );

        const statsPromise = connection.getStats();
        metadata = await Promise.race([statsPromise, timeoutPromise]) as MessageQueueDependencyMetadata;
      }

      const responseTime = Date.now() - startTime;

      // Determine health based on queue depth if available
      let status = HealthStatus.HEALTHY;
      if (metadata?.queueDepth && metadata.queueDepth > 10000) {
        status = HealthStatus.DEGRADED;
      }
      if (metadata?.queueDepth && metadata.queueDepth > 50000) {
        status = HealthStatus.UNHEALTHY;
      }

      return {
        name,
        type: DependencyType.MESSAGE_QUEUE,
        status,
        responseTime,
        lastChecked: new Date().toISOString(),
        metadata
      };
    } catch (error) {
      return {
        name,
        type: DependencyType.MESSAGE_QUEUE,
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Message queue check failed'
      };
    }
  }

  static async checkFileSystem(
    name: string,
    path: string,
    timeout = 5000
  ): Promise<DependencyHealth> {
    const startTime = Date.now();

    try {
      const fs = await import('fs/promises');
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('File system check timeout')), timeout)
      );

      const accessPromise = fs.access(path);
      await Promise.race([accessPromise, timeoutPromise]);

      const stats = await fs.stat(path);
      const responseTime = Date.now() - startTime;

      return {
        name,
        type: DependencyType.STORAGE,
        status: HealthStatus.HEALTHY,
        responseTime,
        lastChecked: new Date().toISOString(),
        metadata: {
          path,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          lastModified: stats.mtime.toISOString()
        }
      };
    } catch (error) {
      return {
        name,
        type: DependencyType.STORAGE,
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'File system check failed',
        metadata: { path }
      };
    }
  }

  static createCustomChecker<T = any>(
    name: string,
    type: DependencyType,
    checkFn: () => Promise<T>,
    healthEvaluator: (result: T) => { status: HealthStatus; error?: string; metadata?: any }
  ): () => Promise<DependencyHealth> {
    return async (): Promise<DependencyHealth> => {
      const startTime = Date.now();

      try {
        const result = await checkFn();
        const evaluation = healthEvaluator(result);
        const responseTime = Date.now() - startTime;

        return {
          name,
          type,
          status: evaluation.status,
          responseTime,
          lastChecked: new Date().toISOString(),
          error: evaluation.error,
          metadata: evaluation.metadata
        };
      } catch (error) {
        return {
          name,
          type,
          status: HealthStatus.UNHEALTHY,
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Custom dependency check failed'
        };
      }
    };
  }
}
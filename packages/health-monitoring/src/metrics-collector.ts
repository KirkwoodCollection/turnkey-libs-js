import { ServiceMetrics } from './types.js';

export interface MetricsCollectorOptions {
  windowSize?: number;
  maxSamples?: number;
  collectCustomMetrics?: boolean;
}

export class MetricsCollector {
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];
  private lastRequestTimestamp?: string;
  private customMetrics: Map<string, number | string> = new Map();
  private readonly maxSamples: number;
  private readonly windowSize: number;

  constructor(options: MetricsCollectorOptions = {}) {
    this.maxSamples = options.maxSamples || 1000;
    this.windowSize = options.windowSize || 300000; // 5 minutes
  }

  recordRequest(responseTime: number, isError = false): void {
    this.requestCount++;
    if (isError) {
      this.errorCount++;
    }

    this.responseTimes.push(responseTime);
    this.lastRequestTimestamp = new Date().toISOString();

    // Keep only recent samples
    if (this.responseTimes.length > this.maxSamples) {
      this.responseTimes = this.responseTimes.slice(-this.maxSamples);
    }

    this.cleanupOldData();
  }

  recordCustomMetric(key: string, value: number | string): void {
    this.customMetrics.set(key, value);
  }

  incrementCounter(key: string, value = 1): void {
    const current = this.customMetrics.get(key);
    const currentValue = typeof current === 'number' ? current : 0;
    this.customMetrics.set(key, currentValue + value);
  }

  getMetrics(): ServiceMetrics {
    const errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0;
    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length 
      : 0;

    return {
      requestCount: this.requestCount,
      errorRate,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      lastRequestTimestamp: this.lastRequestTimestamp,
      customMetrics: Object.fromEntries(this.customMetrics)
    };
  }

  reset(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
    this.lastRequestTimestamp = undefined;
    this.customMetrics.clear();
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - this.windowSize;
    // In a real implementation, you might want to store timestamps with response times
    // For simplicity, we're just limiting by sample count here
  }
}

export function createExpressMiddleware(collector: MetricsCollector) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const isError = res.statusCode >= 400;
      collector.recordRequest(responseTime, isError);
    });

    next();
  };
}

export function createFastifyPlugin(collector: MetricsCollector) {
  return async function (fastify: any) {
    fastify.addHook('onRequest', async (request: any) => {
      request.startTime = Date.now();
    });

    fastify.addHook('onResponse', async (request: any, reply: any) => {
      const responseTime = Date.now() - request.startTime;
      const isError = reply.statusCode >= 400;
      collector.recordRequest(responseTime, isError);
    });
  };
}
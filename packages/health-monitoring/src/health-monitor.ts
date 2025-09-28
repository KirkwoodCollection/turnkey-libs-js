import {
  HealthStatus,
  DependencyType,
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
import { TIMEOUTS } from '@turnkey/service-config';
import { CONVERSION_FACTORS } from '@turnkey/constants';

export class HealthMonitor {
  private serviceName: string;
  private serviceVersion: string;
  private startTime: number;
  private dependencies: Map<string, DependencyConfig> = new Map();
  private integrationTests: Map<string, () => Promise<IntegrationTestResult>> = new Map();
  private metrics: ServiceMetrics = {
    requestCount: 0,
    errorRate: 0,
    averageResponseTime: 0
  };

  constructor(serviceName: string, serviceVersion?: string) {
    this.serviceName = serviceName;
    this.serviceVersion = serviceVersion || '1.0.0';
    this.startTime = Date.now();
  }

  registerDependency(config: DependencyConfig): void {
    this.dependencies.set(config.name, config);
  }

  registerIntegrationTest(
    name: string, 
    test: () => Promise<IntegrationTestResult>
  ): void {
    this.integrationTests.set(name, test);
  }

  updateMetrics(metrics: Partial<ServiceMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics };
  }

  async getBasicHealth(options?: HealthCheckOptions): Promise<HealthResponse> {
    try {
      const status = await this.determineOverallHealth();
      
      return {
        status,
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        version: this.serviceVersion
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        version: this.serviceVersion
      };
    }
  }

  async getDetailedHealth(options?: HealthCheckOptions): Promise<DetailedHealthResponse> {
    try {
      const basicHealth = await this.getBasicHealth(options);
      const uptime = Math.floor((Date.now() - this.startTime) / CONVERSION_FACTORS.MILLISECONDS_PER_SECOND);
      const memory = this.getMemoryUsage();
      const cpu = await this.getCpuUsage();

      return {
        ...basicHealth,
        uptime,
        memory,
        cpu,
        metrics: { ...this.metrics },
        environment: process.env.NODE_ENV,
        build: process.env.BUILD_VERSION
      };
    } catch (error) {
      const basicHealth = await this.getBasicHealth(options);
      return {
        ...basicHealth,
        status: HealthStatus.UNHEALTHY,
        uptime: Math.floor((Date.now() - this.startTime) / CONVERSION_FACTORS.MILLISECONDS_PER_SECOND),
        memory: { used: 0, total: 0, percentage: 0 },
        metrics: this.metrics
      };
    }
  }

  async getDependenciesHealth(options?: HealthCheckOptions): Promise<DependenciesHealthResponse> {
    const basicHealth = await this.getBasicHealth(options);
    const dependencies: DependencyHealth[] = [];

    for (const [name, config] of this.dependencies) {
      try {
        const dependencyHealth = config.checker 
          ? await config.checker()
          : await this.checkDependencyHealth(config, options);
        
        dependencies.push(dependencyHealth);
      } catch (error) {
        dependencies.push({
          name,
          type: config.type,
          status: HealthStatus.UNHEALTHY,
          lastChecked: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const overallStatus = this.determineDependenciesOverallStatus(dependencies);

    return {
      ...basicHealth,
      status: overallStatus,
      dependencies
    };
  }

  async getIntegrationTestHealth(options?: HealthCheckOptions): Promise<IntegrationTestResponse> {
    const basicHealth = await this.getBasicHealth(options);
    const tests: IntegrationTestResult[] = [];
    
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    for (const [name, testFn] of this.integrationTests) {
      try {
        const result = await testFn();
        tests.push(result);
        
        if (result.status === HealthStatus.HEALTHY) {
          passed++;
        } else if (result.status === HealthStatus.UNHEALTHY) {
          failed++;
        } else {
          skipped++;
        }
      } catch (error) {
        failed++;
        tests.push({
          name,
          status: HealthStatus.UNHEALTHY,
          duration: 0,
          error: error instanceof Error ? error.message : 'Test execution failed'
        });
      }
    }

    const overallStatus = failed > 0 ? HealthStatus.UNHEALTHY : 
                         skipped > 0 ? HealthStatus.DEGRADED : HealthStatus.HEALTHY;

    return {
      ...basicHealth,
      status: overallStatus,
      tests,
      summary: {
        total: tests.length,
        passed,
        failed,
        skipped
      }
    };
  }

  private async determineOverallHealth(): Promise<HealthStatus> {
    const memory = this.getMemoryUsage();
    const cpu = await this.getCpuUsage();

    if (memory.percentage > 90 || (cpu && cpu > 90)) {
      return HealthStatus.UNHEALTHY;
    }

    if (memory.percentage > 80 || (cpu && cpu > 80)) {
      return HealthStatus.DEGRADED;
    }

    if (this.metrics.errorRate > 0.1) {
      return HealthStatus.DEGRADED;
    }

    if (this.metrics.errorRate > 0.5) {
      return HealthStatus.UNHEALTHY;
    }

    return HealthStatus.HEALTHY;
  }

  private getMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage();
    const totalMemory = process.platform === 'linux' ? 
      this.getTotalSystemMemory() : usage.heapTotal * 4;

    return {
      used: usage.rss,
      total: totalMemory,
      percentage: (usage.rss / totalMemory) * CONVERSION_FACTORS.PERCENT_MULTIPLIER,
      heap: {
        used: usage.heapUsed,
        total: usage.heapTotal
      }
    };
  }

  private getTotalSystemMemory(): number {
    if (typeof process !== 'undefined' && process.platform === 'linux') {
      try {
        const fs = require('fs');
        const memInfo = fs.readFileSync('/proc/meminfo', 'utf8');
        const match = memInfo.match(/MemTotal:\s+(\d+) kB/);
        return match ? parseInt(match[1]) * 1024 : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  private async getCpuUsage(): Promise<number | undefined> {
    try {
      const startUsage = process.cpuUsage();
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.SHORT_OPERATION));
      const endUsage = process.cpuUsage(startUsage);
      
      const totalTime = endUsage.user + endUsage.system;
      return (totalTime / 100000) * CONVERSION_FACTORS.PERCENT_MULTIPLIER;
    } catch {
      return undefined;
    }
  }

  private async checkDependencyHealth(
    config: DependencyConfig,
    options?: HealthCheckOptions
  ): Promise<DependencyHealth> {
    const startTime = Date.now();
    const timeout = options?.timeout || config.timeout || TIMEOUTS.DEPENDENCY_CHECK;

    try {
      if (config.checkUrl) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(config.checkUrl, {
          signal: controller.signal,
          method: 'GET'
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        return {
          name: config.name,
          type: config.type,
          status: response.ok ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          responseTime,
          lastChecked: new Date().toISOString()
        };
      }

      return {
        name: config.name,
        type: config.type,
        status: HealthStatus.HEALTHY,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        name: config.name,
        type: config.type,
        status: HealthStatus.UNHEALTHY,
        responseTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  private determineDependenciesOverallStatus(dependencies: DependencyHealth[]): HealthStatus {
    const criticalUnhealthy = dependencies.some(dep => {
      const config = this.dependencies.get(dep.name);
      return config?.critical !== false && dep.status === HealthStatus.UNHEALTHY;
    });

    if (criticalUnhealthy) {
      return HealthStatus.UNHEALTHY;
    }

    const anyUnhealthy = dependencies.some(dep => dep.status === HealthStatus.UNHEALTHY);
    const anyDegraded = dependencies.some(dep => dep.status === HealthStatus.DEGRADED);

    if (anyUnhealthy || anyDegraded) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }
}
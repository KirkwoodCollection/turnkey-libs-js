// Jest setup file for health monitoring tests

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.mockFetch = (response: any, options: { ok?: boolean; status?: number } = {}) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
    ...response
  });
};

global.mockFetchError = (error: Error) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(error);
};

// Mock timers helper
global.advanceTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

// Test data factories
global.createMockDependencyHealth = (overrides: any = {}) => ({
  name: 'test-dependency',
  type: 'database',
  status: 'healthy',
  lastChecked: new Date().toISOString(),
  responseTime: 150,
  ...overrides
});

global.createMockMetrics = (overrides: any = {}) => ({
  requestCount: 100,
  errorRate: 0.05,
  averageResponseTime: 200,
  lastRequestTimestamp: new Date().toISOString(),
  customMetrics: {},
  ...overrides
});

// Add custom matchers if needed
expect.extend({
  toBeHealthyStatus(received) {
    const pass = ['healthy', 'degraded', 'unhealthy'].includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid health status`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid health status (healthy, degraded, or unhealthy)`,
        pass: false,
      };
    }
  },

  toBeWithinResponseTimeRange(received, min = 0, max = 10000) {
    const pass = received >= min && received <= max;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within ${min}-${max}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within ${min}-${max}ms`,
        pass: false,
      };
    }
  }
});

// Type declarations for global utilities
declare global {
  function mockFetch(response: any, options?: { ok?: boolean; status?: number }): void;
  function mockFetchError(error: Error): void;
  function advanceTime(ms: number): void;
  function createMockDependencyHealth(overrides?: any): any;
  function createMockMetrics(overrides?: any): any;
  
  namespace jest {
    interface Matchers<R> {
      toBeHealthyStatus(): R;
      toBeWithinResponseTimeRange(min?: number, max?: number): R;
    }
  }
}
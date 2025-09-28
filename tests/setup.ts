// Jest setup file

import '@testing-library/jest-dom';

// Mock console warnings about mock data in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn('🧪 USING MOCK DATA FOR TESTING 🧪');
  console.warn('Tests will use clearly marked mock data that should not appear in production');
});

beforeEach(() => {
  // Suppress specific warnings during tests
  jest.spyOn(console, 'warn').mockImplementation((message, ...args) => {
    if (typeof message === 'string' && message.includes('MOCK')) {
      return; // Suppress mock data warnings in tests
    }
    originalWarn(message, ...args);
  });

  jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
    if (typeof message === 'string' && message.includes('MOCK')) {
      return; // Suppress mock data errors in tests
    }
    originalError(message, ...args);
  });
});

afterEach(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

afterAll(() => {
  console.warn('🧹 CLEARING ALL MOCK DATA 🧹');
  console.warn('Test suite completed - all mock data indicators should be removed for production');
});

// Global test utilities
export const TestUtils = {
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create mock fetch response
  createMockResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Map([['content-type', 'application/json']])
  }),

  // Mock WebSocket
  createMockWebSocket: () => {
    const mockWS = {
      readyState: 1, // OPEN state
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null
    };
    return mockWS;
  },

  // Mock local storage
  createMockLocalStorage: () => {
    const storage: Record<string, string> = {};
    return {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        Object.keys(storage).forEach(key => delete storage[key]);
      },
      length: Object.keys(storage).length,
      key: (index: number) => Object.keys(storage)[index] || null
    };
  }
};

// Global mocks
global.fetch = jest.fn();

// Mock WebSocket with all required properties
const MockWebSocket = jest.fn().mockImplementation(() => ({
  readyState: 1, // OPEN state
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null
}));

// Add static properties required by TypeScript
(MockWebSocket as any).CONNECTING = 0;
(MockWebSocket as any).OPEN = 1;
(MockWebSocket as any).CLOSING = 2;
(MockWebSocket as any).CLOSED = 3;
(MockWebSocket as any).prototype = {};

global.WebSocket = MockWebSocket as any;

// Mock environment detection
if (typeof window === 'undefined') {
  Object.defineProperty(global, 'window', {
    value: {
      location: { href: 'http://localhost:3000' },
      localStorage: TestUtils.createMockLocalStorage(),
      sessionStorage: TestUtils.createMockLocalStorage()
    },
    writable: true
  });
} else {
  // If window exists, just ensure our mocks are available
  (window as any).localStorage = TestUtils.createMockLocalStorage();
  (window as any).sessionStorage = TestUtils.createMockLocalStorage();
}

// Mock process.env for Node.js environment detection
global.process = {
  ...global.process,
  env: {
    NODE_ENV: 'test'
  }
} as NodeJS.Process;
// API Client tests with mock data warnings

import { BaseApiClient, TurnkeyApiError, createApiError } from '@/core/api-client/base-client';
import { ApiClientConfig } from '@/core/api-client/types';
import { TestUtils } from '../setup';
import { mockBookingResponse, MOCK_DATA_INDICATOR, containsMockData } from '../mocks/api-responses';

describe('🧪 API Client Tests (Using Mock Data)', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;
  
  // Concrete implementation for testing
  class TestApiClient extends BaseApiClient {
    constructor(config: ApiClientConfig) {
      super(config);
    }
  }

  beforeEach(() => {
    console.warn('🧪 USING MOCK DATA FOR TESTING 🧪');
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
  });

  afterEach(() => {
    console.warn('🧹 Clearing mock data for next test 🧹');
  });

  describe('BaseApiClient', () => {
    it('should initialize with correct configuration', () => {
      const config: ApiClientConfig = {
        baseUrl: 'https://api.example.com',
        headers: { 'X-Test': 'true' },
        timeout: 5000
      };

      const client = new TestApiClient(config);
      
      expect(client.getBaseUrl()).toBe('https://api.example.com');
      expect(client.getDefaultHeaders()).toEqual(
        expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Test': 'true'
        })
      );
    });

    it('should make successful GET request with mock data', async () => {
      const client = new TestApiClient({ baseUrl: 'https://api.example.com' });
      
      // Verify mock data contains indicators
      expect(containsMockData(mockBookingResponse)).toBe(true);
      expect(mockBookingResponse._warning).toBe(MOCK_DATA_INDICATOR);

      mockFetch.mockResolvedValueOnce(
        TestUtils.createMockResponse(mockBookingResponse) as any
      );

      const response = await client.get('/bookings/123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/bookings/123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      expect(response.data).toEqual(mockBookingResponse);
      expect(response.status).toBe(200);
    });

    it('should handle API errors correctly', async () => {
      const client = new TestApiClient({ baseUrl: 'https://api.example.com' });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/bookings/123')).rejects.toThrow('Network error');
    });

    it('should retry on retryable errors', async () => {
      const client = new TestApiClient({ 
        baseUrl: 'https://api.example.com',
        retryAttempts: 3,
        retryDelay: 100
      });

      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(createApiError('Server Error', 500))
        .mockRejectedValueOnce(createApiError('Server Error', 500))
        .mockResolvedValueOnce(TestUtils.createMockResponse(mockBookingResponse) as any);

      const response = await client.get('/bookings/123');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(response.data).toEqual(mockBookingResponse);
    });

    it('should add and apply request interceptors', async () => {
      const client = new TestApiClient({ baseUrl: 'https://api.example.com' });

      client.addRequestInterceptor(async (config) => ({
        ...config,
        headers: { ...config.headers, 'X-Interceptor': 'applied' }
      }));

      mockFetch.mockResolvedValueOnce(
        TestUtils.createMockResponse(mockBookingResponse) as any
      );

      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Interceptor': 'applied'
          })
        })
      );
    });

    it('should handle timeout correctly', async () => {
      const client = new TestApiClient({ 
        baseUrl: 'https://api.example.com',
        timeout: 100
      });

      // Mock a slow response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );

      await expect(client.get('/slow-endpoint')).rejects.toThrow();
    });

    it('should update default headers', () => {
      const client = new TestApiClient({ baseUrl: 'https://api.example.com' });

      client.updateDefaultHeaders({ 'Authorization': 'Bearer token123' });

      expect(client.getDefaultHeaders()).toEqual(
        expect.objectContaining({
          'Authorization': 'Bearer token123'
        })
      );
    });

    it('should warn about mock data usage', () => {
      const consoleSpy = jest.spyOn(console, 'warn');
      
      // This test verifies our mock data warning system works
      expect(mockBookingResponse._mock).toBe(true);
      expect(mockBookingResponse._warning).toContain('MOCK DATA');
      
      // The setup file should have logged mock data warnings
      expect(consoleSpy).toHaveBeenCalledWith('🧪 USING MOCK DATA FOR TESTING 🧪');
    });
  });

  describe('Error Handling', () => {
    it('should create proper API errors', () => {
      const error = createApiError('Test error', 400, { data: 'test' });

      expect(error).toBeInstanceOf(TurnkeyApiError);
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.code).toBe('API_ERROR_400');
    });

    it('should identify retryable errors correctly', () => {
      const { isRetryableError } = require('@/core/api-client/error-handler');

      expect(isRetryableError({ status: 500 })).toBe(true);
      expect(isRetryableError({ status: 429 })).toBe(true);
      expect(isRetryableError({ status: 408 })).toBe(true);
      expect(isRetryableError({ status: 400 })).toBe(false);
      expect(isRetryableError({ status: 404 })).toBe(false);
    });
  });
});
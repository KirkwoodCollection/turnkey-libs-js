// Abstract base API client - transport abstraction ONLY, no business logic

import {
  ApiClientConfig,
  RequestConfig,
  ApiResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  HttpMethod,
  RetryOptions,
} from './types';
import { TurnkeyApiError, createApiError, isRetryableError, handleApiError } from './error-handler';

export abstract class BaseApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;
  private defaultRetryAttempts: number;
  private defaultRetryDelay: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.defaultTimeout = config.timeout || 10000;
    this.defaultRetryAttempts = config.retryAttempts || 3;
    this.defaultRetryDelay = config.retryDelay || 1000;
  }

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // Core HTTP methods
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  // Main request method with retry logic
  private async request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url);
    let requestConfig = this.buildRequestConfig(config);

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }

    const retryOptions: RetryOptions = {
      attempts: requestConfig.retryAttempts || this.defaultRetryAttempts,
      delay: this.defaultRetryDelay,
    };

    return this.executeWithRetry(
      () => this.executeRequest<T>(method, fullUrl, data, requestConfig),
      retryOptions
    );
  }

  // Execute request with retry logic
  private async executeWithRetry<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    retryOptions: RetryOptions
  ): Promise<ApiResponse<T>> {
    let lastError: TurnkeyApiError | null = null;
    let delay = retryOptions.delay;

    for (let attempt = 1; attempt <= retryOptions.attempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError =
          error instanceof TurnkeyApiError
            ? error
            : createApiError(
                error instanceof Error ? error.message : 'Unknown error',
                (error as any).status,
                (error as any).response
              );

        // Don't retry on the last attempt
        if (attempt === retryOptions.attempts) {
          break;
        }

        // Check if error is retryable
        if (!isRetryableError(lastError)) {
          break;
        }

        // Apply error interceptors before retrying
        for (const interceptor of this.errorInterceptors) {
          lastError = await interceptor(lastError);
        }

        // Wait before retrying with exponential backoff
        await this.delay(delay);
        delay *= 2; // Exponential backoff
      }
    }

    // Apply error interceptors before throwing
    if (lastError) {
      for (const interceptor of this.errorInterceptors) {
        lastError = await interceptor(lastError);
      }
      throw lastError;
    }

    throw createApiError('Unknown error occurred');
  }

  // Execute the actual HTTP request
  private async executeRequest<T>(
    method: HttpMethod,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const timeout = config?.timeout || this.defaultTimeout;
    const headers = { ...this.defaultHeaders, ...config?.headers };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (data && method !== 'GET') {
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      let responseData: T;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = (await response.text()) as unknown as T;
      }

      const apiResponse: ApiResponse<T> = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(response.headers),
      };

      if (!response.ok) {
        throw createApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          apiResponse
        );
      }

      // Apply response interceptors
      let processedResponse = apiResponse;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }

      return processedResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof TurnkeyApiError) {
        throw error;
      }

      handleApiError(error);
    }
  }

  // Helper methods
  private buildUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/${cleanPath}`;
  }

  private buildRequestConfig(config?: RequestConfig): RequestConfig {
    return {
      headers: { ...this.defaultHeaders, ...config?.headers },
      timeout: config?.timeout || this.defaultTimeout,
      retryAttempts: config?.retryAttempts || this.defaultRetryAttempts,
      params: config?.params,
    };
  }

  private extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Getter methods for configuration
  getBaseUrl(): string {
    return this.baseUrl;
  }

  getDefaultHeaders(): Record<string, string> {
    return { ...this.defaultHeaders };
  }

  updateDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

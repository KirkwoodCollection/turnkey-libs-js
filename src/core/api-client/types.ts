// Types for API client - transport abstraction only, no business logic

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  params?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  code?: string;
  response?: {
    data?: any;
    status: number;
    statusText: string;
  };
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor<T = any> = (response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: any) => any | Promise<any>;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RetryOptions {
  attempts: number;
  delay: number;
  shouldRetry?: (error: ApiError) => boolean;
}
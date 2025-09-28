// React hook for API client - wraps core API client functionality

import { useEffect, useRef, useCallback, useState } from 'react';
import { BaseApiClient } from '../../core/api-client/base-client';
import { TurnkeyApiError } from '../../core/api-client/error-handler';
import { ApiClientConfig, ApiResponse, RequestConfig } from '../../core/api-client/types';

export interface UseApiClientOptions extends ApiClientConfig {
  onError?: (error: TurnkeyApiError) => void;
  onResponse?: <T>(response: ApiResponse<T>) => void;
}

export interface UseApiClientReturn {
  client: BaseApiClient | null;
  loading: boolean;
  error: TurnkeyApiError | null;
  clearError: () => void;
  updateConfig: (config: Partial<ApiClientConfig>) => void;
}

export function useApiClient(options: UseApiClientOptions): UseApiClientReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TurnkeyApiError | null>(null);
  const clientRef = useRef<BaseApiClient | null>(null);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize client
  useEffect(() => {
    // Create a concrete implementation of BaseApiClient for the hook
    class ConcreteApiClient extends BaseApiClient {
      constructor(config: ApiClientConfig) {
        super(config);

        // Add error interceptor
        this.addErrorInterceptor(async error => {
          setError(error);
          optionsRef.current.onError?.(error);
          return error;
        });

        // Add response interceptor
        this.addResponseInterceptor(async response => {
          optionsRef.current.onResponse?.(response);
          return response;
        });
      }
    }

    clientRef.current = new ConcreteApiClient(options);

    return () => {
      clientRef.current = null;
    };
  }, [options.baseUrl]); // Only recreate if baseUrl changes

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ApiClientConfig>) => {
    if (clientRef.current) {
      if (newConfig.headers) {
        clientRef.current.updateDefaultHeaders(newConfig.headers);
      }
      // For other config changes, we'd need to recreate the client
      // This is a simplified implementation
    }
  }, []);

  // Wrap client methods to handle loading state
  useEffect(() => {
    if (!clientRef.current) return;

    const originalRequest = clientRef.current.get.bind(clientRef.current);

    // This is a simplified example - in a full implementation,
    // you'd wrap all HTTP methods to handle loading state
  }, []);

  return {
    client: clientRef.current,
    loading,
    error,
    clearError,
    updateConfig,
  };
}

// Convenience hooks for specific clients
export function useBookingApiClient(config: UseApiClientOptions) {
  return useApiClient({
    ...config,
    headers: {
      'X-Service': 'booking',
      ...config.headers,
    },
  });
}

export function useAnalyticsApiClient(config: UseApiClientOptions) {
  return useApiClient({
    ...config,
    headers: {
      'X-Service': 'analytics',
      ...config.headers,
    },
  });
}

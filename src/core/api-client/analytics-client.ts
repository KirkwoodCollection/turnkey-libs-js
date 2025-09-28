// Analytics API client wrapper - extends base client for analytics operations

import { BaseApiClient } from './base-client';
import { ApiClientConfig, ApiResponse, RequestConfig } from './types';

export class AnalyticsApiClient extends BaseApiClient {
  constructor(config: ApiClientConfig) {
    super({
      ...config,
      headers: {
        'X-Service': 'analytics',
        ...config.headers,
      },
    });

    // Add analytics-specific request interceptor
    this.addRequestInterceptor(async config => {
      // Add timestamp to all analytics requests
      return {
        ...config,
        headers: {
          ...config.headers,
          'X-Timestamp': new Date().toISOString(),
        },
      };
    });
  }

  // Generic analytics operations - consuming services implement specific logic
  async trackEvent<T = any>(eventData: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/events', eventData, config);
  }

  async batchTrackEvents<T = any>(events: any[], config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/events/batch', { events }, config);
  }

  async getMetrics<T = any>(metricsQuery: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/metrics', metricsQuery, config);
  }

  async getFunnelData<T = any>(funnelParams: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/funnel', funnelParams, config);
  }

  async getConversionRates<T = any>(
    conversionParams: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.post<T>('/conversions', conversionParams, config);
  }

  async getUserJourney<T = any>(
    sessionId: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.get<T>(`/journey/${sessionId}`, config);
  }

  async getSessionData<T = any>(
    sessionId: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.get<T>(`/sessions/${sessionId}`, config);
  }

  async createSegment<T = any>(segmentData: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/segments', segmentData, config);
  }

  async getSegmentData<T = any>(
    segmentId: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.get<T>(`/segments/${segmentId}`, config);
  }

  // Utility method for real-time tracking
  async trackPageView<T = any>(pageViewData: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/pageviews', pageViewData, {
      ...config,
      timeout: 2000, // Shorter timeout for page tracking
    });
  }
}

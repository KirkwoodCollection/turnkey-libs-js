// Booking API client wrapper - extends base client for booking operations

import { BaseApiClient } from './base-client';
import { ApiClientConfig, ApiResponse, RequestConfig } from './types';

export class BookingApiClient extends BaseApiClient {
  constructor(config: ApiClientConfig) {
    super({
      ...config,
      headers: {
        'X-Service': 'booking',
        ...config.headers
      }
    });

    // Add booking-specific request interceptor for auth tokens
    this.addRequestInterceptor(async (config) => {
      // This would be implemented by consuming services
      // to add their specific authentication headers
      return config;
    });
  }

  // Generic booking operations - consuming services implement specific logic
  async searchAvailability<T = any>(searchParams: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/search', searchParams, config);
  }

  async getRoomDetails<T = any>(roomId: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.get<T>(`/rooms/${roomId}`, config);
  }

  async createBooking<T = any>(bookingData: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/bookings', bookingData, config);
  }

  async getBooking<T = any>(bookingId: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.get<T>(`/bookings/${bookingId}`, config);
  }

  async updateBooking<T = any>(bookingId: string, updateData: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.put<T>(`/bookings/${bookingId}`, updateData, config);
  }

  async cancelBooking<T = any>(bookingId: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.delete<T>(`/bookings/${bookingId}`, config);
  }

  async getPricing<T = any>(pricingParams: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/pricing', pricingParams, config);
  }

  // Utility method for batched requests
  async batchRequest<T = any>(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    data?: any;
  }>, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.post<T>('/batch', { requests }, config);
  }
}
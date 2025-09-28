// API client context provider

import React, { createContext, useContext, ReactNode } from 'react';
// import { BaseApiClient } from '../../core/api-client/base-client';
import { BookingApiClient } from '../../core/api-client/booking-client';
import { AnalyticsApiClient } from '../../core/api-client/analytics-client';
import { ApiClientConfig } from '../../core/api-client/types';

export interface ApiProviderConfig {
  booking?: ApiClientConfig;
  analytics?: ApiClientConfig;
}

export interface ApiContextValue {
  bookingClient?: BookingApiClient;
  analyticsClient?: AnalyticsApiClient;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export interface ApiProviderProps {
  children: ReactNode;
  config: ApiProviderConfig;
}

export function ApiProvider({ children, config }: ApiProviderProps) {
  const contextValue: ApiContextValue = {};

  if (config.booking) {
    contextValue.bookingClient = new BookingApiClient(config.booking);
  }

  if (config.analytics) {
    contextValue.analyticsClient = new AnalyticsApiClient(config.analytics);
  }

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext(): ApiContextValue {
  const context = useContext(ApiContext);
  
  if (context === null) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }

  return context;
}

// Convenience hooks for specific clients
export function useBookingClient(): BookingApiClient {
  const { bookingClient } = useApiContext();
  
  if (!bookingClient) {
    throw new Error('BookingApiClient not configured. Please provide booking config to ApiProvider.');
  }

  return bookingClient;
}

export function useAnalyticsClient(): AnalyticsApiClient {
  const { analyticsClient } = useApiContext();
  
  if (!analyticsClient) {
    throw new Error('AnalyticsApiClient not configured. Please provide analytics config to ApiProvider.');
  }

  return analyticsClient;
}
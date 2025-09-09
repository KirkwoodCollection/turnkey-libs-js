// WebSocket context provider

import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket, UseWebSocketReturn, UseWebSocketOptions } from '../hooks/useWebSocket';

export interface WebSocketProviderConfig {
  url: string;
  options?: Omit<UseWebSocketOptions, 'url'>;
}

export interface WebSocketContextValue extends UseWebSocketReturn {}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export interface WebSocketProviderProps {
  children: ReactNode;
  config: WebSocketProviderConfig;
}

export function WebSocketProvider({ children, config }: WebSocketProviderProps) {
  const webSocketReturn = useWebSocket(config.url, config.options || {});

  return (
    <WebSocketContext.Provider value={webSocketReturn}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  
  if (context === null) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }

  return context;
}

// Convenience components for specific WebSocket endpoints
export interface BookingWebSocketProviderProps {
  children: ReactNode;
  baseUrl: string;
  options?: Omit<UseWebSocketOptions, 'url'>;
}

export function BookingWebSocketProvider({ 
  children, 
  baseUrl, 
  options = {} 
}: BookingWebSocketProviderProps) {
  const url = baseUrl.replace(/^http/, 'ws') + '/booking';
  
  return (
    <WebSocketProvider config={{ url, options }}>
      {children}
    </WebSocketProvider>
  );
}

export interface AnalyticsWebSocketProviderProps {
  children: ReactNode;
  baseUrl: string;
  options?: Omit<UseWebSocketOptions, 'url'>;
}

export function AnalyticsWebSocketProvider({ 
  children, 
  baseUrl, 
  options = {} 
}: AnalyticsWebSocketProviderProps) {
  const url = baseUrl.replace(/^http/, 'ws') + '/analytics';
  
  return (
    <WebSocketProvider config={{ url, options }}>
      {children}
    </WebSocketProvider>
  );
}
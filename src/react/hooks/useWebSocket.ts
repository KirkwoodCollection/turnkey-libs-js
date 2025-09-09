// React hook for WebSocket connection - wraps core WebSocket functionality

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketConnectionManager } from '../../core/websocket/connection-manager';
import { 
  WebSocketConfig,
  ConnectionState,
  WebSocketMessage,
  SendOptions,
  WebSocketError
} from '../../core/websocket/types';

export interface UseWebSocketOptions extends WebSocketConfig {
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: WebSocketError) => void;
  onConnectionChange?: (state: ConnectionState) => void;
}

export interface UseWebSocketReturn {
  connectionState: ConnectionState;
  lastMessage: WebSocketMessage | null;
  error: WebSocketError | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  send: (message: WebSocketMessage, options?: SendOptions) => Promise<void>;
  subscribe: (eventType: string, handler: (message: WebSocketMessage) => void) => () => void;
  clearError: () => void;
  stats: any;
}

export function useWebSocket(
  url: string, 
  options: Omit<UseWebSocketOptions, 'url'> = {}
): UseWebSocketReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('CLOSED');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<WebSocketError | null>(null);
  const [stats, setStats] = useState<any>({});

  const managerRef = useRef<WebSocketConnectionManager | undefined>(undefined);
  const optionsRef = useRef(options);
  const subscriptionsRef = useRef<Set<() => void>>(new Set());

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize WebSocket manager
  useEffect(() => {
    const config: WebSocketConfig = {
      url,
      ...options
    };

    managerRef.current = new WebSocketConnectionManager(config);
    subscriptionsRef.current = new Set();

    // Set up event listeners
    const unsubscribeStateChange = managerRef.current.onConnectionStateChange((state) => {
      setConnectionState(state);
      optionsRef.current.onConnectionChange?.(state);
      
      // Update stats when state changes
      setStats(managerRef.current?.getStats() || {});
    });

    const unsubscribeError = managerRef.current.onError((error) => {
      setError(error);
      optionsRef.current.onError?.(error);
    });

    const unsubscribeMessage = managerRef.current.subscribe('message', (message) => {
      setLastMessage(message);
      optionsRef.current.onMessage?.(message);
    });

    // Store unsubscribe functions
    subscriptionsRef.current?.add(unsubscribeStateChange);
    subscriptionsRef.current?.add(unsubscribeError);
    subscriptionsRef.current?.add(unsubscribeMessage);

    // Auto-connect if enabled
    if (options.autoConnect !== false) {
      managerRef.current.connect().catch((err) => {
        console.error('Auto-connect failed:', err);
      });
    }

    // Cleanup function
    return () => {
      // Clean up all subscriptions
      subscriptionsRef.current?.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current?.clear();

      // Disconnect and destroy manager
      if (managerRef.current) {
        managerRef.current.destroy();
        (managerRef.current as any) = undefined;
      }
    };
  }, [url]); // Only recreate if URL changes

  const connect = useCallback(async () => {
    if (managerRef.current) {
      try {
        await managerRef.current.connect();
        setError(null);
      } catch (err) {
        console.error('Connection failed:', err);
      }
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (managerRef.current) {
      await managerRef.current.disconnect();
    }
  }, []);

  const send = useCallback(async (message: WebSocketMessage, sendOptions?: SendOptions) => {
    if (!managerRef.current) {
      throw new Error('WebSocket manager not initialized');
    }

    try {
      await managerRef.current.send(message, sendOptions);
      setError(null);
    } catch (err) {
      console.error('Send failed:', err);
      throw err;
    }
  }, []);

  const subscribe = useCallback((eventType: string, handler: (message: WebSocketMessage) => void) => {
    if (!managerRef.current) {
      return () => {}; // Return no-op function
    }

    const unsubscribe = managerRef.current.subscribe(eventType, handler);
    subscriptionsRef.current?.add(unsubscribe);

    // Return a wrapper that also removes from our set
    return () => {
      unsubscribe();
      subscriptionsRef.current?.delete(unsubscribe);
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isConnected = connectionState === 'OPEN';

  return {
    connectionState,
    lastMessage,
    error,
    isConnected,
    connect,
    disconnect,
    send,
    subscribe,
    clearError,
    stats
  };
}

// Convenience hook for specific WebSocket endpoints
export function useBookingWebSocket(baseUrl: string, options: Omit<UseWebSocketOptions, 'url'> = {}) {
  const url = baseUrl.replace(/^http/, 'ws') + '/booking';
  return useWebSocket(url, options);
}

export function useAnalyticsWebSocket(baseUrl: string, options: Omit<UseWebSocketOptions, 'url'> = {}) {
  const url = baseUrl.replace(/^http/, 'ws') + '/analytics';
  return useWebSocket(url, options);
}
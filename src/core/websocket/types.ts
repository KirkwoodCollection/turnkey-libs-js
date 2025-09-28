// WebSocket types - pure connection handling, no business logic

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectOptions?: ReconnectOptions;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
}

export interface ReconnectOptions {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

export type ConnectionState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'RECONNECTING';

export interface WebSocketMessage {
  id?: string;
  type: string;
  timestamp: string;
  payload: any;
  correlationId?: string;
}

export type EventHandler = (message: WebSocketMessage) => void;
export type ConnectionHandler = (state: ConnectionState) => void;
export type ErrorHandler = (error: WebSocketError) => void;

export interface WebSocketError {
  type: 'CONNECTION_FAILED' | 'MESSAGE_SEND_FAILED' | 'HEARTBEAT_TIMEOUT' | 'RECONNECT_FAILED';
  message: string;
  originalError?: Event | Error;
  timestamp: string;
}

export interface SendOptions {
  timeout?: number;
  expectResponse?: boolean;
  correlationId?: string;
}

export interface WebSocketStats {
  connectionAttempts: number;
  successfulConnections: number;
  reconnectAttempts: number;
  messagesSent: number;
  messagesReceived: number;
  lastConnectedAt?: string;
  lastDisconnectedAt?: string;
  averageLatency?: number;
}

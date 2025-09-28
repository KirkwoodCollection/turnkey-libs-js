// Pure WebSocket connection handling - no TurnkeyHMS business logic

import {
  WebSocketConfig,
  ConnectionState,
  WebSocketMessage,
  EventHandler,
  ConnectionHandler,
  ErrorHandler,
  WebSocketError,
  SendOptions,
  WebSocketStats,
} from './types';
import { EventEmitter } from './event-emitter';
import { ReconnectionStrategy } from './reconnection-strategy';

export class WebSocketConnectionManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private eventEmitter: EventEmitter;
  private reconnectionStrategy: ReconnectionStrategy;
  private connectionState: ConnectionState = 'CLOSED';
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private stats: WebSocketStats;
  private pendingMessages: Map<
    string,
    {
      resolve: (value: WebSocketMessage) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  > = new Map();

  constructor(config: WebSocketConfig) {
    this.config = {
      heartbeatInterval: 30000, // 30 seconds
      heartbeatTimeout: 5000, // 5 seconds
      reconnectOptions: {
        enabled: true,
        maxAttempts: 10,
        initialDelay: 1000,
        maxDelay: 30000,
        exponentialBackoff: true,
      },
      ...config,
    };

    this.eventEmitter = new EventEmitter();
    this.reconnectionStrategy = new ReconnectionStrategy(this.config.reconnectOptions!);
    this.stats = {
      connectionAttempts: 0,
      successfulConnections: 0,
      reconnectAttempts: 0,
      messagesSent: 0,
      messagesReceived: 0,
    };
  }

  // Connection management
  async connect(): Promise<void> {
    if (this.connectionState === 'CONNECTING' || this.connectionState === 'OPEN') {
      return;
    }

    this.stats.connectionAttempts++;
    this.setConnectionState('CONNECTING');

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);

        this.ws.onopen = () => {
          this.stats.successfulConnections++;
          this.stats.lastConnectedAt = new Date().toISOString();
          this.setConnectionState('OPEN');
          this.reconnectionStrategy.reset();
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = event => {
          this.handleMessage(event);
        };

        this.ws.onclose = event => {
          this.handleClose(event);
        };

        this.ws.onerror = event => {
          this.handleError(event);
          if (this.connectionState === 'CONNECTING') {
            reject(new Error('Failed to connect to WebSocket server'));
          }
        };
      } catch (error) {
        this.setConnectionState('CLOSED');
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    this.reconnectionStrategy.setEnabled(false);
    this.stopHeartbeat();

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      this.setConnectionState('CLOSING');
      this.ws.close(1000, 'Client initiated disconnect');
    } else {
      this.setConnectionState('CLOSED');
    }

    // Clear pending messages
    this.pendingMessages.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Connection closed'));
    });
    this.pendingMessages.clear();
  }

  // Message handling
  async send(message: WebSocketMessage, options: SendOptions = {}): Promise<void> {
    if (this.connectionState !== 'OPEN' || !this.ws) {
      throw new Error('WebSocket is not connected');
    }

    const messageToSend = {
      ...message,
      id: message.id || this.generateMessageId(),
      timestamp: new Date().toISOString(),
      correlationId: options.correlationId || message.correlationId,
    };

    if (options.expectResponse && messageToSend.id) {
      await this.sendWithResponse(messageToSend, options.timeout);
      return;
    }

    this.ws.send(JSON.stringify(messageToSend));
    this.stats.messagesSent++;
  }

  private async sendWithResponse(
    message: WebSocketMessage,
    timeout = 10000
  ): Promise<WebSocketMessage> {
    return new Promise((resolve, reject) => {
      const messageId = message.id!;

      const timeoutHandle = setTimeout(() => {
        this.pendingMessages.delete(messageId);
        reject(new Error(`Message timeout after ${timeout}ms`));
      }, timeout);

      this.pendingMessages.set(messageId, {
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      this.ws!.send(JSON.stringify(message));
      this.stats.messagesSent++;
    });
  }

  // Event subscription
  subscribe(eventType: string, handler: EventHandler): () => void {
    return this.eventEmitter.on(eventType, handler);
  }

  unsubscribe(eventType: string, handler?: EventHandler): void {
    this.eventEmitter.off(eventType, handler);
  }

  onConnectionStateChange(handler: ConnectionHandler): () => void {
    return this.eventEmitter.on('connectionStateChanged', handler);
  }

  onError(handler: ErrorHandler): () => void {
    return this.eventEmitter.on('error', handler);
  }

  // State and info getters
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === 'OPEN';
  }

  getStats(): WebSocketStats {
    return { ...this.stats };
  }

  getReconnectionInfo() {
    return this.reconnectionStrategy.getReconnectionInfo();
  }

  // Private methods
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.eventEmitter.emit('connectionStateChanged', state);

      if (state === 'CLOSED') {
        this.stats.lastDisconnectedAt = new Date().toISOString();
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.stats.messagesReceived++;

      // Handle response to pending message
      if (message.id && this.pendingMessages.has(message.id)) {
        const pending = this.pendingMessages.get(message.id)!;
        clearTimeout(pending.timeout);
        this.pendingMessages.delete(message.id);
        pending.resolve(message);
        return;
      }

      // Handle heartbeat pong
      if (message.type === 'pong') {
        this.handleHeartbeatPong();
        return;
      }

      // Emit to subscribers
      this.eventEmitter.emit('message', message);
      this.eventEmitter.emit(message.type, message);
    } catch (error) {
      this.emitError('MESSAGE_SEND_FAILED', 'Failed to parse incoming message', error as Error);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.setConnectionState('CLOSED');
    this.stopHeartbeat();

    if (event.code !== 1000 && this.reconnectionStrategy.shouldReconnect()) {
      this.attemptReconnection();
    }
  }

  private handleError(event: Event): void {
    this.emitError('CONNECTION_FAILED', 'WebSocket connection error', event);
  }

  private async attemptReconnection(): Promise<void> {
    this.setConnectionState('RECONNECTING');
    this.stats.reconnectAttempts++;

    const success = await this.reconnectionStrategy.attemptReconnection(async () => {
      await this.connect();
    });

    if (!success && this.reconnectionStrategy.isMaxAttemptsReached()) {
      this.emitError('RECONNECT_FAILED', 'Maximum reconnection attempts reached');
      this.setConnectionState('CLOSED');
    }
  }

  private startHeartbeat(): void {
    if (!this.config.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private sendHeartbeat(): void {
    if (this.connectionState !== 'OPEN') return;

    try {
      const heartbeatMessage: WebSocketMessage = {
        type: 'ping',
        timestamp: new Date().toISOString(),
        payload: {},
      };

      this.ws!.send(JSON.stringify(heartbeatMessage));

      // Set timeout for pong response
      if (this.config.heartbeatTimeout) {
        this.heartbeatTimeout = setTimeout(() => {
          this.emitError('HEARTBEAT_TIMEOUT', 'Heartbeat timeout - connection may be dead');
          this.disconnect();
        }, this.config.heartbeatTimeout);
      }
    } catch (error) {
      this.emitError('MESSAGE_SEND_FAILED', 'Failed to send heartbeat', error as Error);
    }
  }

  private handleHeartbeatPong(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private emitError(
    type: WebSocketError['type'],
    message: string,
    originalError?: Error | Event
  ): void {
    const error: WebSocketError = {
      type,
      message,
      originalError,
      timestamp: new Date().toISOString(),
    };

    this.eventEmitter.emit('error', error);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update configuration
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.reconnectOptions) {
      this.reconnectionStrategy.updateOptions(newConfig.reconnectOptions);
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.eventEmitter.removeAllListeners();
    this.reconnectionStrategy.cancelReconnection();
  }
}

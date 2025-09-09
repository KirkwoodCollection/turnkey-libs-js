// WebSocket tests with mock data warnings

import { WebSocketConnectionManager } from '@/core/websocket/connection-manager';
import { EventEmitter } from '@/core/websocket/event-emitter';
import { ReconnectionStrategy } from '@/core/websocket/reconnection-strategy';
import { TestUtils } from '../setup';
import { mockWebSocketMessage, mockConnectionEvent, containsMockData, MOCK_DATA_INDICATOR } from '../mocks/websocket-events';

describe('🧪 WebSocket Tests (Using Mock Data)', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    console.warn('🧪 USING MOCK DATA FOR TESTING 🧪');
    mockWebSocket = TestUtils.createMockWebSocket();
    (global.WebSocket as jest.Mock) = jest.fn().mockImplementation(() => mockWebSocket);
  });

  afterEach(() => {
    console.warn('🧹 Clearing WebSocket mock data for next test 🧹');
    jest.clearAllMocks();
  });

  describe('EventEmitter', () => {
    it('should emit and listen to events', () => {
      const emitter = new EventEmitter();
      const handler = jest.fn();

      emitter.on('test-event', handler);
      emitter.emit('test-event', 'test data');

      expect(handler).toHaveBeenCalledWith('test data');
    });

    it('should handle once listeners correctly', () => {
      const emitter = new EventEmitter();
      const handler = jest.fn();

      emitter.once('test-event', handler);
      emitter.emit('test-event', 'data1');
      emitter.emit('test-event', 'data2');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('data1');
    });

    it('should remove listeners', () => {
      const emitter = new EventEmitter();
      const handler = jest.fn();

      const unsubscribe = emitter.on('test-event', handler);
      emitter.emit('test-event', 'data1');
      
      unsubscribe();
      emitter.emit('test-event', 'data2');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('data1');
    });
  });

  describe('ReconnectionStrategy', () => {
    it('should calculate exponential backoff delays', () => {
      const strategy = new ReconnectionStrategy({
        enabled: true,
        maxAttempts: 5,
        initialDelay: 1000,
        maxDelay: 10000,
        exponentialBackoff: true
      });

      expect(strategy.getDelay()).toBe(1000); // First attempt
      
      // Simulate attempt
      (strategy as any).currentAttempt = 1;
      expect(strategy.getDelay()).toBe(2000); // Second attempt
      
      (strategy as any).currentAttempt = 2;
      expect(strategy.getDelay()).toBe(4000); // Third attempt
    });

    it('should respect max delay', () => {
      const strategy = new ReconnectionStrategy({
        enabled: true,
        maxAttempts: 10,
        initialDelay: 1000,
        maxDelay: 5000,
        exponentialBackoff: true
      });

      (strategy as any).currentAttempt = 10; // Would calculate to 1024000ms
      expect(strategy.getDelay()).toBe(5000); // Should be capped at maxDelay
    });

    it('should check if should reconnect', () => {
      const strategy = new ReconnectionStrategy({
        enabled: true,
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        exponentialBackoff: true
      });

      expect(strategy.shouldReconnect()).toBe(true);
      
      (strategy as any).currentAttempt = 3;
      expect(strategy.shouldReconnect()).toBe(false); // Max attempts reached
    });
  });

  describe('WebSocketConnectionManager', () => {
    it('should initialize with correct configuration', () => {
      const manager = new WebSocketConnectionManager({
        url: 'ws://localhost:8080',
        heartbeatInterval: 30000
      });

      expect(manager.getConnectionState()).toBe('CLOSED');
      expect(manager.isConnected()).toBe(false);
    });

    it('should connect successfully with mock data', async () => {
      // Verify mock data contains indicators
      expect(containsMockData(mockConnectionEvent)).toBe(true);
      expect(mockConnectionEvent._warning).toBe(MOCK_DATA_INDICATOR);

      const manager = new WebSocketConnectionManager({
        url: 'ws://localhost:8080'
      });

      // Mock successful connection
      const connectPromise = manager.connect();
      
      // Simulate connection opening
      mockWebSocket.onopen();

      await connectPromise;

      expect(manager.getConnectionState()).toBe('OPEN');
      expect(manager.isConnected()).toBe(true);
    });

    it('should handle connection errors', async () => {
      const manager = new WebSocketConnectionManager({
        url: 'ws://localhost:8080'
      });

      const connectPromise = manager.connect();

      // Simulate connection error
      mockWebSocket.onerror(new Error('Connection failed'));

      await expect(connectPromise).rejects.toThrow('Failed to connect to WebSocket server');
    });

    it('should send messages correctly with mock data', async () => {
      // Verify mock message contains indicators
      expect(containsMockData(mockWebSocketMessage)).toBe(true);
      expect(mockWebSocketMessage._warning).toBe(MOCK_DATA_INDICATOR);

      const manager = new WebSocketConnectionManager({
        url: 'ws://localhost:8080'
      });

      // Connect first
      const connectPromise = manager.connect();
      mockWebSocket.onopen();
      await connectPromise;

      // Send message
      await manager.send({
        type: 'test',
        timestamp: new Date().toISOString(),
        payload: { test: 'MOCK_DATA' }
      });

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"test"')
      );
    });

    it('should handle incoming messages with mock data', async () => {
      const manager = new WebSocketConnectionManager({
        url: 'ws://localhost:8080'
      });

      const messageHandler = jest.fn();
      manager.subscribe('test-message', messageHandler);

      // Connect first
      const connectPromise = manager.connect();
      mockWebSocket.onopen();
      await connectPromise;

      // Simulate incoming message with mock data
      const mockMessage = {
        ...mockWebSocketMessage,
        type: 'test-message'
      };

      mockWebSocket.onmessage({
        data: JSON.stringify(mockMessage)
      });

      expect(messageHandler).toHaveBeenCalledWith(mockMessage);
    });

    it('should disconnect properly', async () => {
      const manager = new WebSocketConnectionManager({
        url: 'ws://localhost:8080'
      });

      // Connect first
      const connectPromise = manager.connect();
      mockWebSocket.onopen();
      await connectPromise;

      // Disconnect
      await manager.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Client initiated disconnect');
    });

    it('should collect connection statistics', async () => {
      const manager = new WebSocketConnectionManager({
        url: 'ws://localhost:8080'
      });

      const stats = manager.getStats();
      
      expect(stats.connectionAttempts).toBe(0);
      expect(stats.successfulConnections).toBe(0);
      expect(stats.messagesSent).toBe(0);
      expect(stats.messagesReceived).toBe(0);

      // Connect
      const connectPromise = manager.connect();
      mockWebSocket.onopen();
      await connectPromise;

      const updatedStats = manager.getStats();
      expect(updatedStats.connectionAttempts).toBe(1);
      expect(updatedStats.successfulConnections).toBe(1);
    });

    it('should warn about mock data usage', () => {
      const consoleSpy = jest.spyOn(console, 'warn');
      
      // This test verifies our mock data warning system works for WebSocket
      expect(mockWebSocketMessage._mock).toBe(true);
      expect(mockWebSocketMessage._warning).toContain('MOCK DATA');
      
      // The setup file should have logged mock data warnings
      expect(consoleSpy).toHaveBeenCalledWith('🧪 USING MOCK DATA FOR TESTING 🧪');
    });

    it('should handle heartbeat with mock pong response', async () => {
      const manager = new WebSocketConnectionManager({
        url: 'ws://localhost:8080',
        heartbeatInterval: 100 // Short interval for testing
      });

      // Connect first
      const connectPromise = manager.connect();
      mockWebSocket.onopen();
      await connectPromise;

      // Wait for heartbeat to be sent
      await TestUtils.waitFor(150);

      // Check if ping was sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"ping"')
      );

      // Simulate pong response
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
          payload: {}
        })
      });

      // Should handle pong without errors
      expect(manager.getConnectionState()).toBe('OPEN');
    });
  });
});
// WebSocket reconnection strategy with exponential backoff

import { ReconnectOptions } from './types';

export class ReconnectionStrategy {
  private options: Required<ReconnectOptions>;
  private currentAttempt: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isReconnecting: boolean = false;

  constructor(options: ReconnectOptions) {
    const defaultOptions: Required<ReconnectOptions> = {
      enabled: true,
      maxAttempts: 10,
      initialDelay: 1000,
      maxDelay: 30000,
      exponentialBackoff: true,
    };

    this.options = { ...defaultOptions, ...options };
  }

  // Calculate delay for current attempt
  getDelay(): number {
    if (!this.options.exponentialBackoff) {
      return this.options.initialDelay;
    }

    const delay = this.options.initialDelay * Math.pow(2, this.currentAttempt);
    return Math.min(delay, this.options.maxDelay);
  }

  // Get current attempt number
  getCurrentAttempt(): number {
    return this.currentAttempt;
  }

  // Get maximum attempts
  getMaxAttempts(): number {
    return this.options.maxAttempts;
  }

  // Check if reconnection should be attempted
  shouldReconnect(): boolean {
    return (
      this.options.enabled && this.currentAttempt < this.options.maxAttempts && !this.isReconnecting
    );
  }

  // Start reconnection attempt
  async attemptReconnection(reconnectFn: () => Promise<void>): Promise<boolean> {
    if (!this.shouldReconnect()) {
      return false;
    }

    this.isReconnecting = true;
    this.currentAttempt++;

    const delay = this.getDelay();

    return new Promise(resolve => {
      this.reconnectTimeout = setTimeout(async () => {
        try {
          await reconnectFn();
          this.reset(); // Reset on successful connection
          this.isReconnecting = false;
          resolve(true);
        } catch (error) {
          this.isReconnecting = false;
          resolve(false);
        }
      }, delay);
    });
  }

  // Reset reconnection state
  reset(): void {
    this.currentAttempt = 0;
    this.isReconnecting = false;
    this.cancelReconnection();
  }

  // Cancel current reconnection attempt
  cancelReconnection(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.isReconnecting = false;
  }

  // Update reconnection options
  updateOptions(options: Partial<ReconnectOptions>): void {
    this.options = { ...this.options, ...options };
  }

  // Get reconnection info
  getReconnectionInfo(): {
    isReconnecting: boolean;
    currentAttempt: number;
    maxAttempts: number;
    nextDelay: number;
    canReconnect: boolean;
  } {
    return {
      isReconnecting: this.isReconnecting,
      currentAttempt: this.currentAttempt,
      maxAttempts: this.options.maxAttempts,
      nextDelay: this.getDelay(),
      canReconnect: this.shouldReconnect(),
    };
  }

  // Check if max attempts reached
  isMaxAttemptsReached(): boolean {
    return this.currentAttempt >= this.options.maxAttempts;
  }

  // Enable/disable reconnection
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
    if (!enabled) {
      this.cancelReconnection();
    }
  }

  // Check if reconnection is enabled
  isEnabled(): boolean {
    return this.options.enabled;
  }
}

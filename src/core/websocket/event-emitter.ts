// Custom event bus for WebSocket events

export type EventListener<T = any> = (data: T) => void;

export class EventEmitter {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private onceListeners: Map<string, Set<EventListener>> = new Map();
  private maxListeners: number = 100;

  // Add event listener
  on<T = any>(event: string, listener: EventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listenersSet = this.listeners.get(event)!;
    
    if (listenersSet.size >= this.maxListeners) {
      console.warn(`EventEmitter: Maximum listeners (${this.maxListeners}) exceeded for event: ${event}`);
    }

    listenersSet.add(listener);

    // Return unsubscribe function
    return () => {
      listenersSet.delete(listener);
      if (listenersSet.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  // Add one-time event listener
  once<T = any>(event: string, listener: EventListener<T>): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }

    const onceListenersSet = this.onceListeners.get(event)!;
    onceListenersSet.add(listener);

    // Return unsubscribe function
    return () => {
      onceListenersSet.delete(listener);
      if (onceListenersSet.size === 0) {
        this.onceListeners.delete(event);
      }
    };
  }

  // Remove event listener
  off<T = any>(event: string, listener?: EventListener<T>): void {
    if (listener) {
      // Remove specific listener
      const listenersSet = this.listeners.get(event);
      if (listenersSet) {
        listenersSet.delete(listener);
        if (listenersSet.size === 0) {
          this.listeners.delete(event);
        }
      }

      const onceListenersSet = this.onceListeners.get(event);
      if (onceListenersSet) {
        onceListenersSet.delete(listener);
        if (onceListenersSet.size === 0) {
          this.onceListeners.delete(event);
        }
      }
    } else {
      // Remove all listeners for event
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    }
  }

  // Emit event to all listeners
  emit<T = any>(event: string, data: T): boolean {
    let hasListeners = false;

    // Emit to regular listeners
    const listenersSet = this.listeners.get(event);
    if (listenersSet && listenersSet.size > 0) {
      hasListeners = true;
      // Create a copy to avoid issues if listeners are modified during emission
      const listeners = Array.from(listenersSet);
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`EventEmitter: Error in listener for event '${event}':`, error);
        }
      });
    }

    // Emit to once listeners and then remove them
    const onceListenersSet = this.onceListeners.get(event);
    if (onceListenersSet && onceListenersSet.size > 0) {
      hasListeners = true;
      const onceListeners = Array.from(onceListenersSet);
      this.onceListeners.delete(event); // Remove all once listeners
      
      onceListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`EventEmitter: Error in once listener for event '${event}':`, error);
        }
      });
    }

    return hasListeners;
  }

  // Get listener count for event
  listenerCount(event: string): number {
    const regularCount = this.listeners.get(event)?.size || 0;
    const onceCount = this.onceListeners.get(event)?.size || 0;
    return regularCount + onceCount;
  }

  // Get all event names
  eventNames(): string[] {
    const regularEvents = Array.from(this.listeners.keys());
    const onceEvents = Array.from(this.onceListeners.keys());
    return [...new Set([...regularEvents, ...onceEvents])];
  }

  // Remove all listeners
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  // Set maximum listeners per event
  setMaxListeners(max: number): void {
    this.maxListeners = Math.max(0, max);
  }

  // Get maximum listeners
  getMaxListeners(): number {
    return this.maxListeners;
  }
}
// React hook for event bus - wraps core event emitter functionality

import { useEffect, useRef, useCallback } from 'react';
import { EventEmitter } from '../../core/websocket/event-emitter';

export interface UseEventBusOptions {
  maxListeners?: number;
}

export interface UseEventBusReturn {
  emit: <T = any>(event: string, data: T) => boolean;
  subscribe: <T = any>(event: string, handler: (data: T) => void) => () => void;
  subscribeOnce: <T = any>(event: string, handler: (data: T) => void) => () => void;
  unsubscribe: <T = any>(event: string, handler?: (data: T) => void) => void;
  listenerCount: (event: string) => number;
  eventNames: () => string[];
  removeAllListeners: (event?: string) => void;
}

export function useEventBus(options: UseEventBusOptions = {}): UseEventBusReturn {
  const eventEmitterRef = useRef<EventEmitter>(new EventEmitter());
  const subscriptionsRef = useRef<Set<() => void>>(new Set());

  // Initialize event emitter
  useEffect(() => {
    if (!eventEmitterRef.current) {
      eventEmitterRef.current = new EventEmitter();
      subscriptionsRef.current = new Set();
      
      if (options.maxListeners) {
        eventEmitterRef.current.setMaxListeners(options.maxListeners);
      }
    }

    return () => {
      // Clean up all subscriptions
      subscriptionsRef.current?.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current?.clear();
      
      // Clean up event emitter
      eventEmitterRef.current?.removeAllListeners();
    };
  }, [options.maxListeners]);

  const emit = useCallback(<T = any>(event: string, data: T): boolean => {
    return eventEmitterRef.current?.emit(event, data) || false;
  }, []);

  const subscribe = useCallback(<T = any>(event: string, handler: (data: T) => void) => {
    if (!eventEmitterRef.current) {
      return () => {}; // Return no-op function
    }

    const unsubscribe = eventEmitterRef.current.on(event, handler);
    subscriptionsRef.current?.add(unsubscribe);

    // Return a wrapper that also removes from our set
    return () => {
      unsubscribe();
      subscriptionsRef.current?.delete(unsubscribe);
    };
  }, []);

  const subscribeOnce = useCallback(<T = any>(event: string, handler: (data: T) => void) => {
    if (!eventEmitterRef.current) {
      return () => {}; // Return no-op function
    }

    const unsubscribe = eventEmitterRef.current.once(event, handler);
    subscriptionsRef.current?.add(unsubscribe);

    // Return a wrapper that also removes from our set
    return () => {
      unsubscribe();
      subscriptionsRef.current?.delete(unsubscribe);
    };
  }, []);

  const unsubscribe = useCallback(<T = any>(event: string, handler?: (data: T) => void) => {
    eventEmitterRef.current?.off(event, handler);
  }, []);

  const listenerCount = useCallback((event: string): number => {
    return eventEmitterRef.current?.listenerCount(event) || 0;
  }, []);

  const eventNames = useCallback((): string[] => {
    return eventEmitterRef.current?.eventNames() || [];
  }, []);

  const removeAllListeners = useCallback((event?: string) => {
    eventEmitterRef.current?.removeAllListeners(event);
    if (!event) {
      // If removing all listeners, clear our subscriptions set
      subscriptionsRef.current.clear();
    }
  }, []);

  return {
    emit,
    subscribe,
    subscribeOnce,
    unsubscribe,
    listenerCount,
    eventNames,
    removeAllListeners
  };
}

// Convenience hook for typed event bus
export function useTypedEventBus<EventMap extends Record<string, any>>(
  options: UseEventBusOptions = {}
) {
  const eventBus = useEventBus(options);

  const typedEmit = useCallback(<K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ): boolean => {
    return eventBus.emit(event as string, data);
  }, [eventBus]);

  const typedSubscribe = useCallback(<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void
  ) => {
    return eventBus.subscribe(event as string, handler);
  }, [eventBus]);

  const typedSubscribeOnce = useCallback(<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void
  ) => {
    return eventBus.subscribeOnce(event as string, handler);
  }, [eventBus]);

  const typedUnsubscribe = useCallback(<K extends keyof EventMap>(
    event: K,
    handler?: (data: EventMap[K]) => void
  ) => {
    eventBus.unsubscribe(event as string, handler);
  }, [eventBus]);

  return {
    ...eventBus,
    emit: typedEmit,
    subscribe: typedSubscribe,
    subscribeOnce: typedSubscribeOnce,
    unsubscribe: typedUnsubscribe
  };
}

// Example usage with typed events:
export interface BookingEventMap {
  'booking:created': { bookingId: string; amount: number };
  'booking:updated': { bookingId: string; status: string };
  'booking:cancelled': { bookingId: string; reason: string };
  'search:performed': { destination: string; checkIn: string; checkOut: string };
}

export function useBookingEventBus() {
  return useTypedEventBus<BookingEventMap>();
}
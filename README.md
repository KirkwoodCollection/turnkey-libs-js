# @turnkey/libs-js

Shared JavaScript/TypeScript utilities for TurnkeyHMS frontend microservices.

[![npm version](https://badge.fury.io/js/%40turnkey%2Flibs-js.svg)](https://badge.fury.io/js/%40turnkey%2Flibs-js)
[![Build Status](https://github.com/turnkeyhms/turnkey-libs-js/workflows/CI/badge.svg)](https://github.com/turnkeyhms/turnkey-libs-js/actions)
[![Coverage Status](https://coveralls.io/repos/github/turnkeyhms/turnkey-libs-js/badge.svg?branch=main)](https://coveralls.io/github/turnkeyhms/turnkey-libs-js?branch=main)

## Overview

This library provides reusable client-side components for TurnkeyHMS booking engine frontend services. It includes framework-agnostic core utilities and optional React-specific wrappers.

**Key Features:**
- 🌐 **Framework Agnostic**: Core utilities work with any JavaScript framework
- ⚛️ **React Support**: Optional React hooks and components
- 📡 **API Client**: HTTP client with retry logic and interceptors  
- 🔌 **WebSocket Manager**: Connection management with auto-reconnection
- 🔒 **Authentication**: Token management and auth helpers
- 🧪 **Mock Data Safe**: Clearly marked mock data that's stripped from production builds
- 📦 **Multiple Formats**: ESM, CommonJS, and UMD builds available

## Installation

```bash
npm install @turnkey/libs-js

# If using React features
npm install react react-dom
```

## Quick Start

### Framework-Agnostic Usage

```typescript
import { BaseApiClient, WebSocketConnectionManager } from '@turnkey/libs-js/core';

// API Client
class MyApiClient extends BaseApiClient {
  constructor() {
    super({ baseUrl: 'https://api.example.com' });
  }
}

const client = new MyApiClient();
const response = await client.get('/bookings');

// WebSocket
const ws = new WebSocketConnectionManager({
  url: 'wss://api.example.com/ws'
});

await ws.connect();
ws.subscribe('booking_update', (message) => {
  console.log('Booking updated:', message);
});
```

### React Usage

```tsx
import { ApiProvider, useWebSocket, useAuth } from '@turnkey/libs-js/react';

function App() {
  return (
    <ApiProvider config={{
      booking: { baseUrl: 'https://api.example.com' }
    }}>
      <BookingWidget />
    </ApiProvider>
  );
}

function BookingWidget() {
  const { isConnected, send } = useWebSocket('wss://api.example.com/ws');
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {isAuthenticated && <p>Welcome, {user?.displayName}</p>}
    </div>
  );
}
```

## API Documentation

### Core Modules

#### API Client

The base API client provides HTTP functionality with built-in retry logic, interceptors, and error handling.

```typescript
import { BaseApiClient, BookingApiClient } from '@turnkey/libs-js/core';

// Extend for custom clients
class CustomApiClient extends BaseApiClient {
  constructor() {
    super({
      baseUrl: 'https://api.example.com',
      timeout: 10000,
      retryAttempts: 3
    });
  }
}

// Or use pre-built clients
const bookingClient = new BookingApiClient({
  baseUrl: 'https://booking-api.example.com'
});

// Add interceptors
bookingClient.addRequestInterceptor(async (config) => ({
  ...config,
  headers: { ...config.headers, 'Authorization': 'Bearer ' + token }
}));
```

#### WebSocket Manager

Manages WebSocket connections with automatic reconnection and event handling.

```typescript
import { WebSocketConnectionManager } from '@turnkey/libs-js/core';

const ws = new WebSocketConnectionManager({
  url: 'wss://api.example.com/ws',
  reconnectOptions: {
    enabled: true,
    maxAttempts: 10,
    initialDelay: 1000
  },
  heartbeatInterval: 30000
});

// Connection management
await ws.connect();
ws.onConnectionStateChange((state) => {
  console.log('Connection state:', state);
});

// Message handling
ws.subscribe('booking_update', (message) => {
  console.log('Booking updated:', message.payload);
});

await ws.send({
  type: 'subscribe',
  payload: { topic: 'bookings' }
});
```

### React Hooks

#### useApiClient

```tsx
import { useApiClient } from '@turnkey/libs-js/react';

function MyComponent() {
  const { client, loading, error } = useApiClient({
    baseUrl: 'https://api.example.com',
    onError: (error) => console.error('API Error:', error)
  });

  const handleClick = async () => {
    const response = await client?.get('/data');
    console.log(response.data);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Loading...' : 'Fetch Data'}
    </button>
  );
}
```

#### useWebSocket

```tsx
import { useWebSocket } from '@turnkey/libs-js/react';

function RealTimeComponent() {
  const {
    isConnected,
    lastMessage,
    send,
    subscribe
  } = useWebSocket('wss://api.example.com/ws');

  useEffect(() => {
    const unsubscribe = subscribe('booking_update', (message) => {
      console.log('New booking update:', message);
    });
    
    return unsubscribe;
  }, [subscribe]);

  return (
    <div>
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      {lastMessage && <p>Last message: {lastMessage.type}</p>}
    </div>
  );
}
```

#### useAuth

```tsx
import { useAuth } from '@turnkey/libs-js/react';

function AuthComponent() {
  const { 
    isAuthenticated, 
    user, 
    signIn, 
    signOut,
    loading 
  } = useAuth({
    autoRefresh: true,
    onAuthStateChange: (state) => {
      console.log('Auth state changed:', state);
    }
  });

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? (
    <div>
      <p>Welcome, {user?.displayName}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  ) : (
    <button onClick={() => signIn(token, user)}>Sign In</button>
  );
}
```

### React Providers

#### ApiProvider

```tsx
import { ApiProvider, useBookingClient } from '@turnkey/libs-js/react';

function App() {
  return (
    <ApiProvider config={{
      booking: { baseUrl: 'https://booking-api.example.com' },
      analytics: { baseUrl: 'https://analytics-api.example.com' }
    }}>
      <BookingComponent />
    </ApiProvider>
  );
}

function BookingComponent() {
  const bookingClient = useBookingClient();
  
  const searchRooms = async () => {
    const response = await bookingClient.searchAvailability({
      checkIn: '2024-12-15',
      checkOut: '2024-12-18',
      guests: 2
    });
    
    console.log('Available rooms:', response.data);
  };

  return <button onClick={searchRooms}>Search Rooms</button>;
}
```

## Bundle Formats

The library is built in multiple formats to support different environments:

### ES Modules (Recommended)
```javascript
import { BaseApiClient } from '@turnkey/libs-js';
// or
import { BaseApiClient } from '@turnkey/libs-js/core';
```

### CommonJS
```javascript
const { BaseApiClient } = require('@turnkey/libs-js');
// or
const { BaseApiClient } = require('@turnkey/libs-js/core');
```

### UMD (CDN)
```html
<script src="https://unpkg.com/@turnkey/libs-js/dist/umd/turnkey-libs.min.js"></script>
<script>
  const { BaseApiClient } = TurnkeyLibs;
</script>
```

### Core-Only (No React)
```javascript
// Only includes framework-agnostic utilities
import { BaseApiClient, WebSocketConnectionManager } from '@turnkey/libs-js/core';
```

## Mock Data Handling

This library includes mock data for testing, clearly marked with indicators:

```typescript
// Mock data is clearly marked
const mockResponse = {
  _mock: true,
  _warning: "⚠️ MOCK DATA - NOT FOR PRODUCTION ⚠️",
  data: { bookingId: "MOCK_BOOKING_12345" }
};

// Utility functions help identify mock data
import { containsMockData, stripMockIndicators } from '@turnkey/libs-js/tests/mocks';

console.log(containsMockData(mockResponse)); // true

// Strip mock indicators before production use
const cleanData = stripMockIndicators(mockResponse);
```

**Production Safety:**
- Mock data is automatically excluded from npm package
- Build script validates no mock data in output
- Clear warnings in development/testing

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test
npm run test:coverage

# Build the library
npm run build

# Lint and format
npm run lint
npm run format

# Check for mock data in build
npm run clear-mock-data
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import {
  ApiClientConfig,
  WebSocketConfig,
  ConnectionState,
  AuthToken,
  AuthUser
} from '@turnkey/libs-js';

const config: ApiClientConfig = {
  baseUrl: 'https://api.example.com',
  timeout: 5000
};

const wsConfig: WebSocketConfig = {
  url: 'wss://api.example.com/ws',
  reconnectOptions: {
    enabled: true,
    maxAttempts: 5
  }
};
```

## Browser Support

- Chrome/Edge 88+
- Firefox 78+  
- Safari 14+
- Node.js 14+

## License

MIT © TurnkeyHMS Team

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for your changes  
4. Ensure `npm run clear-mock-data` passes
5. Submit a pull request

## Support

- 📖 [Documentation](https://github.com/turnkeyhms/turnkey-libs-js/tree/main/docs)
- 🐛 [Issue Tracker](https://github.com/turnkeyhms/turnkey-libs-js/issues)
- 💬 [Discussions](https://github.com/turnkeyhms/turnkey-libs-js/discussions)

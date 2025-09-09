# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of @turnkey/libs-js
- Framework-agnostic core utilities
- React hooks and providers
- Comprehensive mock data handling
- Multiple build formats (ESM, CommonJS, UMD)

### Features

#### Core API Client
- `BaseApiClient` with retry logic and interceptors
- `BookingApiClient` for booking operations
- `AnalyticsApiClient` for analytics tracking
- Comprehensive error handling with `TurnkeyApiError`
- Request/response interceptors
- Automatic retry with exponential backoff
- Timeout configuration

#### WebSocket Management
- `WebSocketConnectionManager` with auto-reconnection
- `EventEmitter` for message handling
- `ReconnectionStrategy` with exponential backoff
- Heartbeat/ping-pong functionality
- Connection state management
- Message queuing and correlation

#### Authentication
- Token management utilities
- Auth state management
- Automatic token refresh
- Firebase Auth integration helpers

#### React Integration
- `useApiClient` hook for HTTP operations
- `useWebSocket` hook for real-time connections
- `useAuth` hook for authentication state
- `useEventBus` hook for event handling
- `ApiProvider` context for API clients
- `WebSocketProvider` for WebSocket connections
- `AuthProvider` for authentication state
- `ErrorBoundary` component for error handling
- `LoadingSpinner` and `ConnectionStatus` components

#### Developer Experience
- 🧪 Mock data with clear production safety indicators
- TypeScript support with full type definitions
- Jest testing setup with >80% coverage requirement
- ESLint and Prettier configuration
- Rollup build system for multiple formats
- GitHub Actions CI/CD pipeline
- Comprehensive documentation and examples

#### Production Safety
- Mock data detection and stripping
- Bundle size analysis in CI
- Security scanning
- No hardcoded secrets or eval() usage
- Clean build validation before publishing

## [0.1.0] - 2024-12-01

### Added
- Initial project setup
- Core architecture implementation
- React wrapper components
- Testing infrastructure
- CI/CD pipeline
- Documentation and examples

### Security
- Mock data safety measures
- Build output validation
- Security scanning in CI pipeline
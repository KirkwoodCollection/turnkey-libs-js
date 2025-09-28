# TurnkeyHMS JavaScript Libraries Monorepo

## Overview
This monorepo contains shared TypeScript/JavaScript packages used across all TurnkeyHMS v2 microservices. Each package is independently versioned and published to enable selective consumption by services.

## Architecture Principles
1. **Single Source of Truth**: Event schemas, data models, and contracts are defined once
2. **Type Safety**: All packages are written in TypeScript with strict typing
3. **Zero Runtime Dependencies**: Minimize external dependencies to reduce version conflicts
4. **Tree-Shakeable**: All exports support tree-shaking for optimal bundle sizes
5. **Service Agnostic**: Libraries should not contain business logic specific to any service

## Package Development Guidelines
- Each package must be independently buildable and testable
- Use semantic versioning for all packages
- Document breaking changes in CHANGELOG.md
- All packages must export TypeScript definitions
- Maintain 90%+ test coverage for critical packages

## Build and Publishing
- Use Lerna for monorepo management
- Packages are published to private npm registry
- CI/CD automatically publishes on merge to main
- Pre-release versions for feature branches

## Package Interdependencies

### Core Dependencies
- **service-config**: Central configuration package used by health-monitoring and other services
- **constants**: Shared constants used by health-monitoring and other packages
- **health-monitoring** → service-config, constants
- **event-contracts** → data-models
- **service-clients** → event-contracts, data-models, error-handling
- **event-normalizer** → event-contracts
- **All packages** → logging (optional peer dependency)

### Package Categories
1. **Configuration & Constants**: service-config, constants
2. **Core Business Logic**: data-models, event-contracts
3. **Service Communication**: service-clients, messaging
4. **Event Processing**: event-normalizer, event-contracts
5. **Infrastructure**: logging, error-handling, validation, cache-utils
6. **Authentication**: auth-helpers, auth-config
7. **Monitoring**: health-monitoring

## Current Package Status

### Implemented Packages (14 total)
1. **auth-config**: Authentication configuration and Firebase integration
2. **auth-helpers**: Authentication utilities and middleware
3. **cache-utils**: Caching strategies and Redis/memory implementations
4. **constants**: HTTP status codes, error codes, metrics, calculations
5. **data-models**: Shared business entity interfaces and type guards
6. **error-handling**: Standardized error classes and handling patterns
7. **event-contracts**: Event schemas and validation for event-driven architecture
8. **event-normalizer**: Event transformation from external sources (Skipper, GTM)
9. **health-monitoring**: Health check endpoints and service monitoring
10. **logging**: Structured logging with correlation tracking
11. **messaging**: Pub/Sub and WebSocket messaging patterns
12. **service-clients**: HTTP/gRPC clients with resilience patterns
13. **service-config**: Centralized configuration for all microservices
14. **validation**: Data validation rules and schema enforcement

### Package Evolution Notes
- **service-config** has become the central configuration hub, containing:
  - Service URLs, ports, routes
  - Database configurations (Firestore, Redis, BigQuery)
  - Pub/Sub topics and subscriptions
  - Authentication and JWT settings
  - Environment-specific configurations
- **constants** package provides shared HTTP status codes, error codes, and business calculations
- **health-monitoring** provides standardized health check endpoints for all microservices
- **auth-config** separates authentication configuration from auth-helpers utilities

This reflects the actual evolution of the microservice architecture beyond the original 10-package design.
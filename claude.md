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
- event-contracts → data-models
- service-clients → event-contracts, data-models, error-handling
- event-normalizer → event-contracts
- All packages → logging (optional peer dependency)
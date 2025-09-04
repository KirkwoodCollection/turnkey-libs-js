# Authentication Helpers Package

## Purpose
Shared authentication and authorization utilities for service-to-service and user authentication.

## Authentication Strategies

### JWT Token Management
- Token generation and validation
- Refresh token rotation
- Claims extraction
- Signature verification

### Firebase Auth Integration
- ID token verification
- Custom claims management
- Admin SDK helpers
- Session cookie handling

### Service Authentication
- mTLS certificate validation
- API key management
- OAuth2 client credentials
- Service account authentication

## Authorization Patterns

### RBAC Implementation
```typescript
interface Role {
  name: string;
  permissions: Permission[];
}

interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}
```

### Policy Enforcement
- Attribute-based access control (ABAC)
- Resource ownership validation
- Multi-tenancy isolation
- Rate limiting per user/role

## Middleware Components

### Express/Fastify Middleware
- Token extraction from headers/cookies
- User context injection
- Permission checking

### gRPC Interceptors
- Metadata authentication
- Service-to-service auth

## Security Best Practices
- Token rotation schedules
- Secret management (HashiCorp Vault)
- Audit logging for auth events
- OWASP compliance checks
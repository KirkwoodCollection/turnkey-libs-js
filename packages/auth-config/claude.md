# Authentication Configuration Package

## Purpose
Centralized authentication configuration for Firebase Auth integration, JWT settings, and authentication-related constants used across TurnkeyHMS microservices.

## Core Configuration Areas

### Firebase Authentication Configuration
Environment-specific Firebase project settings and authentication providers:

```typescript
interface FirebaseAuthConfig {
  projectId: string;
  apiKey: string;
  authDomain: string;
  enabledProviders: AuthProvider[];
  customClaims: CustomClaimConfig;
  sessionCookie: SessionCookieConfig;
}

interface AuthProvider {
  type: 'google' | 'email' | 'phone' | 'anonymous';
  enabled: boolean;
  configuration?: ProviderSpecificConfig;
}
```

### JWT Configuration
Token generation and validation settings:

```typescript
interface JWTConfig {
  issuer: string;
  audience: string[];
  algorithm: 'RS256' | 'HS256';
  expirationTime: string; // e.g., '1h', '24h'
  refreshTokenExpiry: string;
  publicKeyUrl?: string;
  secretKey?: string;
  claims: {
    required: string[];
    optional: string[];
    custom: CustomClaimDefinition[];
  };
}
```

### Custom Claims Configuration
Role-based access control and permission definitions:

```typescript
interface CustomClaimDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  allowedValues?: any[];
  validation?: ValidationRule;
}

interface RoleConfig {
  roles: {
    [roleName: string]: {
      permissions: string[];
      inherits?: string[];
      constraints?: RoleConstraint[];
    };
  };
  defaultRole: string;
  adminRoles: string[];
}
```

### Session Configuration
Session management and security settings:

```typescript
interface SessionConfig {
  cookieName: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number; // milliseconds
  domain?: string;
  path: string;
  regenerateOnAuth: boolean;
}
```

## Environment-Specific Configuration

### Development Environment
```typescript
export const DEVELOPMENT_AUTH_CONFIG: AuthConfig = {
  firebase: {
    projectId: 'turnkey-hms-dev',
    emulatorPort: 9099,
    useEmulator: true
  },
  jwt: {
    algorithm: 'HS256',
    secretKey: process.env.DEV_JWT_SECRET,
    expirationTime: '24h'
  },
  session: {
    secure: false,
    sameSite: 'lax'
  }
};
```

### Production Environment
```typescript
export const PRODUCTION_AUTH_CONFIG: AuthConfig = {
  firebase: {
    projectId: 'turnkey-hms-prod',
    useEmulator: false,
    customDomain: 'auth.turnkeyhms.com'
  },
  jwt: {
    algorithm: 'RS256',
    publicKeyUrl: 'https://securetoken.google.com/turnkey-hms-prod',
    expirationTime: '1h'
  },
  session: {
    secure: true,
    sameSite: 'strict',
    domain: '.turnkeyhms.com'
  }
};
```

## Authentication Constants

### Error Codes
Authentication-specific error codes:
```typescript
export const AUTH_ERROR_CODES = {
  TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  ACCOUNT_DISABLED: 'AUTH_ACCOUNT_DISABLED',
  RATE_LIMIT_EXCEEDED: 'AUTH_RATE_LIMIT_EXCEEDED'
} as const;
```

### Permission Constants
```typescript
export const PERMISSIONS = {
  // Booking permissions
  'booking:create': 'Create new bookings',
  'booking:read': 'View booking details',
  'booking:update': 'Modify bookings',
  'booking:cancel': 'Cancel bookings',

  // Admin permissions
  'admin:users': 'Manage user accounts',
  'admin:properties': 'Manage property settings',
  'admin:reports': 'Access admin reports',

  // System permissions
  'system:health': 'Access system health endpoints',
  'system:metrics': 'View system metrics'
} as const;
```

### Role Definitions
```typescript
export const ROLES = {
  GUEST: {
    name: 'guest',
    permissions: ['booking:create', 'booking:read'],
    description: 'Anonymous or basic user'
  },
  AUTHENTICATED_USER: {
    name: 'user',
    permissions: ['booking:create', 'booking:read', 'booking:update'],
    description: 'Verified user account'
  },
  PROPERTY_ADMIN: {
    name: 'property_admin',
    permissions: ['booking:*', 'admin:properties'],
    description: 'Property management access'
  },
  SYSTEM_ADMIN: {
    name: 'system_admin',
    permissions: ['*'],
    description: 'Full system access'
  }
} as const;
```

## Integration Points

### Service Integration
Each microservice imports relevant authentication configuration:

```typescript
// Booking service
import { getAuthConfig, ROLES, PERMISSIONS } from '@turnkey/auth-config';

const authConfig = getAuthConfig('booking-service');
```

### Middleware Configuration
```typescript
// Express middleware setup
import { AUTH_CONFIG, SESSION_CONFIG } from '@turnkey/auth-config';

app.use(session(SESSION_CONFIG));
app.use(authMiddleware(AUTH_CONFIG));
```

### Firebase Admin Integration
```typescript
import { getFirebaseConfig } from '@turnkey/auth-config';

const admin = require('firebase-admin');
admin.initializeApp(getFirebaseConfig());
```

## Configuration Validation

### Runtime Validation
```typescript
export function validateAuthConfig(config: AuthConfig): ValidationResult {
  const errors: string[] = [];

  // Validate JWT configuration
  if (!config.jwt.algorithm) {
    errors.push('JWT algorithm is required');
  }

  // Validate Firebase configuration
  if (!config.firebase.projectId) {
    errors.push('Firebase project ID is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Environment Checks
```typescript
export function checkAuthEnvironment(): EnvironmentStatus {
  return {
    firebaseConfigured: !!process.env.FIREBASE_PROJECT_ID,
    jwtSecretPresent: !!process.env.JWT_SECRET,
    sessionSecretPresent: !!process.env.SESSION_SECRET,
    httpsRequired: process.env.NODE_ENV === 'production'
  };
}
```

## Security Best Practices

### Token Security
- JWT secrets stored in secure environment variables
- Token rotation policies defined
- Refresh token secure storage requirements

### Session Security
- Secure cookie configuration for production
- CSRF protection settings
- Session timeout and renewal policies

### Permission Management
- Principle of least privilege
- Role inheritance patterns
- Permission audit trail requirements

## Usage Examples

### Basic Configuration
```typescript
import { getAuthConfig, validateToken } from '@turnkey/auth-config';

const config = getAuthConfig();
const tokenValidation = await validateToken(request.headers.authorization, config);
```

### Role-Based Access Control
```typescript
import { hasPermission, PERMISSIONS } from '@turnkey/auth-config';

if (hasPermission(user.claims, PERMISSIONS['booking:create'])) {
  // Allow booking creation
}
```

### Environment Setup
```typescript
import { setupAuthEnvironment } from '@turnkey/auth-config';

// Initialize authentication for the current environment
await setupAuthEnvironment({
  service: 'booking-service',
  environment: process.env.NODE_ENV
});
```

This package ensures consistent authentication configuration across all TurnkeyHMS microservices while maintaining security best practices and environment-specific customization.
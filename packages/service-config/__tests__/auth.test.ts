import {
  JWT_CONFIG,
  JWT_ENV_VARS,
  AUTH_HEADERS,
  WEBSOCKET_AUTH,
  buildWebSocketUrl,
  validateAdminClaims,
  getJwtConfig,
  getJwtEnvVars
} from '../src/auth';

describe('Auth Configuration', () => {
  describe('JWT Configuration', () => {
    test('JWT_CONFIG contains ADR-001 mandated values', () => {
      expect(JWT_CONFIG.ALGORITHM).toBe('HS256');
      expect(JWT_CONFIG.AUDIENCE).toBe('turnkey-platform');
      expect(JWT_CONFIG.ISSUER).toBe('turnkey-session');
      expect(JWT_CONFIG.MAX_EXPIRY_MINUTES).toBe(15);
    });

    test('Required admin roles are defined', () => {
      expect(JWT_CONFIG.REQUIRED_ADMIN_ROLES).toContain('admin');
      expect(JWT_CONFIG.REQUIRED_ADMIN_ROLES).toContain('administrator');
    });

    test('Required admin permissions are defined', () => {
      expect(JWT_CONFIG.REQUIRED_ADMIN_PERMISSIONS).toContain('admin:*');
      expect(JWT_CONFIG.REQUIRED_ADMIN_PERMISSIONS).toContain('admin:read');
      expect(JWT_CONFIG.REQUIRED_ADMIN_PERMISSIONS).toContain('admin:write');
      expect(JWT_CONFIG.REQUIRED_ADMIN_PERMISSIONS).toContain('system:admin');
      expect(JWT_CONFIG.REQUIRED_ADMIN_PERMISSIONS).toContain('turnkey:admin');
    });
  });

  describe('Environment Variables', () => {
    test('JWT_ENV_VARS contains canonical names from ADR-001', () => {
      expect(JWT_ENV_VARS.WEBSOCKET_SECRET).toBe('WEBSOCKET_JWT_SECRET_KEY');
      expect(JWT_ENV_VARS.WEBSOCKET_AUDIENCE).toBe('WEBSOCKET_JWT_AUDIENCE');
      expect(JWT_ENV_VARS.SESSION_SECRET).toBe('SESSION_JWT_SECRET_KEY');
      expect(JWT_ENV_VARS.SESSION_ISSUER).toBe('SESSION_JWT_ISSUER');
    });
  });

  describe('Auth Headers', () => {
    test('AUTH_HEADERS defines standard headers', () => {
      expect(AUTH_HEADERS.API_KEY).toBe('X-API-Key');
      expect(AUTH_HEADERS.LEGACY_API_KEY).toBe('X-Internal-API-Key');
      expect(AUTH_HEADERS.AUTHORIZATION).toBe('Authorization');
    });
  });

  describe('WebSocket Authentication', () => {
    test('WEBSOCKET_AUTH follows ADR-001 query param method', () => {
      expect(WEBSOCKET_AUTH.TOKEN_PARAM).toBe('token');
      expect(WEBSOCKET_AUTH.METHOD).toBe('JWT_QUERY_PARAM');
    });

    test('Close codes are defined for auth failures', () => {
      expect(WEBSOCKET_AUTH.CLOSE_CODES.UNAUTHORIZED).toBe(4001);
      expect(WEBSOCKET_AUTH.CLOSE_CODES.FORBIDDEN).toBe(4003);
      expect(WEBSOCKET_AUTH.CLOSE_CODES.TOKEN_EXPIRED).toBe(4010);
      expect(WEBSOCKET_AUTH.CLOSE_CODES.INVALID_ROLE).toBe(4020);
    });
  });

  describe('WebSocket URL Building', () => {
    test('buildWebSocketUrl adds token parameter correctly', () => {
      const baseUrl = 'ws://localhost:8002/ws';
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const result = buildWebSocketUrl(baseUrl, token);

      expect(result).toBe(`${baseUrl}?token=${token}`);
    });

    test('buildWebSocketUrl handles existing query parameters', () => {
      const baseUrl = 'ws://localhost:8002/ws?existing=param';
      const token = 'test-token';
      const result = buildWebSocketUrl(baseUrl, token);

      expect(result).toContain('existing=param');
      expect(result).toContain('token=test-token');
    });
  });

  describe('Admin Claims Validation', () => {
    test('validateAdminClaims accepts valid admin claims', () => {
      const validClaims = {
        sub: 'user123',
        roles: ['admin', 'user'],
        permissions: ['admin:read', 'admin:write']
      };

      expect(validateAdminClaims(validClaims)).toBe(true);
    });

    test('validateAdminClaims rejects claims without admin role', () => {
      const invalidClaims = {
        sub: 'user123',
        roles: ['user'],
        permissions: ['admin:read']
      };

      expect(validateAdminClaims(invalidClaims)).toBe(false);
    });

    test('validateAdminClaims rejects claims without admin permission', () => {
      const invalidClaims = {
        sub: 'user123',
        roles: ['admin'],
        permissions: ['user:read']
      };

      expect(validateAdminClaims(invalidClaims)).toBe(false);
    });

    test('validateAdminClaims rejects claims missing required fields', () => {
      const incompleteClaims = {
        sub: 'user123'
        // Missing roles and permissions
      };

      expect(validateAdminClaims(incompleteClaims)).toBe(false);
    });

    test('validateAdminClaims accepts alternative admin role', () => {
      const validClaims = {
        sub: 'user123',
        roles: ['administrator'],
        permissions: ['system:admin']
      };

      expect(validateAdminClaims(validClaims)).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    test('getJwtConfig returns JWT_CONFIG', () => {
      expect(getJwtConfig()).toEqual(JWT_CONFIG);
    });

    test('getJwtEnvVars returns JWT_ENV_VARS', () => {
      expect(getJwtEnvVars()).toEqual(JWT_ENV_VARS);
    });
  });

  describe('ADR-001 Compliance', () => {
    test('All ADR-001 JWT constants are present', () => {
      // Verify the exact values mandated by ADR-001
      expect(JWT_CONFIG.ALGORITHM).toBe('HS256');
      expect(JWT_CONFIG.AUDIENCE).toBe('turnkey-platform');
      expect(JWT_CONFIG.ISSUER).toBe('turnkey-session');

      // Verify canonical env var names
      expect(JWT_ENV_VARS.WEBSOCKET_SECRET).toBe('WEBSOCKET_JWT_SECRET_KEY');
      expect(JWT_ENV_VARS.SESSION_SECRET).toBe('SESSION_JWT_SECRET_KEY');

      // Verify WebSocket auth method
      expect(WEBSOCKET_AUTH.TOKEN_PARAM).toBe('token');
      expect(WEBSOCKET_AUTH.METHOD).toBe('JWT_QUERY_PARAM');
    });

    test('Required admin roles match ADR-001 specification', () => {
      const requiredRoles = ['admin', 'administrator'];
      requiredRoles.forEach(role => {
        expect(JWT_CONFIG.REQUIRED_ADMIN_ROLES).toContain(role);
      });
    });

    test('Required admin permissions match ADR-001 specification', () => {
      const requiredPermissions = [
        'admin:*',
        'admin:read',
        'admin:write',
        'system:admin',
        'turnkey:admin'
      ];
      requiredPermissions.forEach(permission => {
        expect(JWT_CONFIG.REQUIRED_ADMIN_PERMISSIONS).toContain(permission);
      });
    });
  });
});
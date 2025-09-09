// Auth types - transport and token management only, no business logic

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
  scope?: string;
}

export interface TokenManagerConfig {
  storage: 'localStorage' | 'sessionStorage' | 'memory';
  autoRefresh: boolean;
  refreshThreshold: number; // seconds before expiry to refresh
  maxRetries: number;
  onTokenRefresh?: (token: AuthToken) => void;
  onTokenExpired?: () => void;
  onRefreshFailed?: (error: Error) => void;
}

export interface FirebaseAuthConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  customClaims?: string[];
}

export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  customClaims?: Record<string, any>;
  roles?: string[];
  permissions?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: AuthToken | null;
  loading: boolean;
  error: string | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  clientId?: string;
  clientSecret?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
}

export type AuthEventType = 
  | 'TOKEN_REFRESHED' 
  | 'TOKEN_EXPIRED' 
  | 'TOKEN_REFRESH_FAILED'
  | 'USER_SIGNED_IN'
  | 'USER_SIGNED_OUT'
  | 'AUTH_STATE_CHANGED';

export interface AuthEvent {
  type: AuthEventType;
  payload?: any;
  timestamp: string;
}

export type AuthEventHandler = (event: AuthEvent) => void;
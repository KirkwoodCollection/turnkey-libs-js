// React hook for authentication state - wraps auth utilities

import { useEffect, useState, useCallback, useRef } from 'react';
import { AuthState, AuthUser, AuthToken, AuthEventType } from '../../core/auth/types';
import { EventEmitter } from '../../core/websocket/event-emitter';

export interface UseAuthOptions {
  autoRefresh?: boolean;
  refreshThreshold?: number; // seconds before expiry to refresh
  onAuthStateChange?: (state: AuthState) => void;
  onTokenRefresh?: (token: AuthToken) => void;
  onError?: (error: Error) => void;
}

export interface UseAuthReturn extends AuthState {
  signIn: (token: AuthToken, user?: AuthUser) => void;
  signOut: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  clearError: () => void;
}

// Simple auth manager for the hook
class AuthManager extends EventEmitter {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  };

  private refreshTimer: NodeJS.Timeout | null = null;

  private options: UseAuthOptions;
  
  constructor(options: UseAuthOptions = {}) {
    super();
    this.options = options;
  }

  getState(): AuthState {
    return { ...this.state };
  }

  setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.emit('authStateChange', this.state);
    this.options.onAuthStateChange?.(this.state);
  }

  signIn(token: AuthToken, user?: AuthUser) {
    this.setState({
      isAuthenticated: true,
      token,
      user: user || null,
      error: null,
      loading: false
    });

    if (this.options.autoRefresh !== false) {
      this.scheduleRefresh(token);
    }

    this.emit('authEvent', { type: 'USER_SIGNED_IN', payload: { user, token } });
  }

  signOut() {
    this.clearRefreshTimer();
    this.setState({
      isAuthenticated: false,
      user: null,
      token: null,
      error: null,
      loading: false
    });

    this.emit('authEvent', { type: 'USER_SIGNED_OUT' });
  }

  updateUser(userUpdate: Partial<AuthUser>) {
    if (!this.state.user) return;

    const updatedUser = { ...this.state.user, ...userUpdate };
    this.setState({ user: updatedUser });
  }

  setError(error: string | null) {
    this.setState({ error, loading: false });
    if (error) {
      this.options.onError?.(new Error(error));
    }
  }

  setLoading(loading: boolean) {
    this.setState({ loading });
  }

  clearError() {
    this.setState({ error: null });
  }

  async refreshToken(): Promise<void> {
    if (!this.state.token?.refreshToken) {
      this.setError('No refresh token available');
      return;
    }

    this.setLoading(true);

    try {
      // This would typically make an API call to refresh the token
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you'd call your token refresh endpoint
      const newToken: AuthToken = {
        ...this.state.token,
        expiresAt: Date.now() + (this.state.token.expiresIn * 1000)
      };

      this.setState({ token: newToken, loading: false, error: null });
      this.options.onTokenRefresh?.(newToken);
      this.scheduleRefresh(newToken);

      this.emit('authEvent', { type: 'TOKEN_REFRESHED', payload: { token: newToken } });
    } catch (error) {
      this.setError('Token refresh failed');
      this.emit('authEvent', { type: 'TOKEN_REFRESH_FAILED', payload: { error } });
    }
  }

  private scheduleRefresh(token: AuthToken) {
    this.clearRefreshTimer();

    const threshold = this.options.refreshThreshold || 300; // 5 minutes
    const refreshTime = token.expiresAt - Date.now() - (threshold * 1000);

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  destroy() {
    this.clearRefreshTimer();
    this.removeAllListeners();
  }
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  });

  const managerRef = useRef<AuthManager>(new AuthManager());

  // Initialize auth manager
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new AuthManager(options);

      const unsubscribe = managerRef.current.on('authStateChange', (newState: AuthState) => {
        setState(newState);
      });

      // Initialize state
      setState(managerRef.current.getState());

      return () => {
        unsubscribe();
        managerRef.current?.destroy();
      };
    }
  }, []); // Empty dependency array - only run once

  // Update options when they change
  useEffect(() => {
    if (managerRef.current) {
      (managerRef.current as any).options = options;
    }
  }, [options]);

  const signIn = useCallback((token: AuthToken, user?: AuthUser) => {
    managerRef.current?.signIn(token, user);
  }, []);

  const signOut = useCallback(() => {
    managerRef.current?.signOut();
  }, []);

  const refreshToken = useCallback(async () => {
    await managerRef.current?.refreshToken();
  }, []);

  const updateUser = useCallback((userUpdate: Partial<AuthUser>) => {
    managerRef.current?.updateUser(userUpdate);
  }, []);

  const clearError = useCallback(() => {
    managerRef.current?.clearError();
  }, []);

  return {
    ...state,
    signIn,
    signOut,
    refreshToken,
    updateUser,
    clearError
  };
}

// Hook for checking specific permissions
export function usePermissions(requiredPermissions: string[] = []) {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = useCallback((permission: string) => {
    if (!isAuthenticated || !user?.permissions) return false;
    return user.permissions.includes(permission);
  }, [isAuthenticated, user?.permissions]);

  const hasAllPermissions = useCallback(() => {
    return requiredPermissions.every(permission => hasPermission(permission));
  }, [requiredPermissions, hasPermission]);

  const hasAnyPermission = useCallback(() => {
    return requiredPermissions.some(permission => hasPermission(permission));
  }, [requiredPermissions, hasPermission]);

  return {
    hasPermission,
    hasAllPermissions: hasAllPermissions(),
    hasAnyPermission: hasAnyPermission(),
    permissions: user?.permissions || []
  };
}
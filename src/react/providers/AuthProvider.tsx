// Auth context provider

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UseAuthReturn, UseAuthOptions } from '../hooks/useAuth';

export interface AuthContextValue extends UseAuthReturn {}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  options?: UseAuthOptions;
}

export function AuthProvider({ children, options = {} }: AuthProviderProps) {
  const authReturn = useAuth(options);

  return (
    <AuthContext.Provider value={authReturn}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

// Higher-order component for protecting routes
export interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any permission
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [],
  requireAll = true,
  fallback = <div>Access denied</div>,
  redirectTo
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuthContext();

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check authentication
  if (!isAuthenticated) {
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
      return null;
    }
    return <>{fallback}</>;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && user?.permissions) {
    const hasPermissions = requireAll
      ? requiredPermissions.every(permission => user.permissions!.includes(permission))
      : requiredPermissions.some(permission => user.permissions!.includes(permission));

    if (!hasPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Higher-order component for conditional rendering based on permissions
export interface ConditionalRenderProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function ConditionalRender({ 
  children, 
  permissions = [],
  roles = [],
  requireAll = true,
  fallback = null
}: ConditionalRenderProps) {
  const { isAuthenticated, user } = useAuthContext();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check permissions
  if (permissions.length > 0 && user.permissions) {
    const hasPermissions = requireAll
      ? permissions.every(permission => user.permissions!.includes(permission))
      : permissions.some(permission => user.permissions!.includes(permission));

    if (!hasPermissions) {
      return <>{fallback}</>;
    }
  }

  // Check roles
  if (roles.length > 0 && user.roles) {
    const hasRoles = requireAll
      ? roles.every(role => user.roles!.includes(role))
      : roles.some(role => user.roles!.includes(role));

    if (!hasRoles) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
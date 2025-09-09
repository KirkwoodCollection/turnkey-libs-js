// Error boundary component for catching React errors

import React, { Component, ReactNode, ErrorInfo } from 'react';

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error, errorInfo } = this.state;

      // If fallback is a function, call it with error details
      if (typeof fallback === 'function' && error && errorInfo) {
        return fallback(error, errorInfo);
      }

      // If fallback is provided, render it
      if (fallback && typeof fallback !== 'function') {
        return fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '4px',
          backgroundColor: '#fff5f5',
          color: '#c53030',
          fontFamily: 'monospace',
          margin: '20px 0'
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
            Something went wrong
          </h2>
          {process.env.NODE_ENV === 'development' && error && (
            <>
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Error details
                </summary>
                <pre style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid #e2e2e2',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto'
                }}>
                  {error.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </details>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#c53030',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Reload page
              </button>
            </>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Error caught by error handler:', error, errorInfo);
    
    // In a real application, you might want to report this to an error tracking service
    // like Sentry, Bugsnag, etc.
  };
}
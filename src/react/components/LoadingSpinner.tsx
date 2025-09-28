// Loading spinner component

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export function LoadingSpinner({
  size = 'medium',
  color = '#3182ce',
  className = '',
  style = {},
  label = 'Loading...',
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: 16,
    medium: 32,
    large: 48,
  };

  const spinnerSize = sizeMap[size];

  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: `2px solid ${color}20`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'turnkey-spinner-spin 1s linear infinite',
    ...style,
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
    color,
  };

  return (
    <>
      <style>{`
        @keyframes turnkey-spinner-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={containerStyle} className={className}>
        <div style={spinnerStyle} aria-hidden="true" />
        {label && <span>{label}</span>}
      </div>
    </>
  );
}

// Overlay loading spinner
export interface LoadingOverlayProps extends LoadingSpinnerProps {
  visible: boolean;
  backdrop?: boolean;
  backdropColor?: string;
  zIndex?: number;
}

export function LoadingOverlay({
  visible,
  backdrop = true,
  backdropColor = 'rgba(255, 255, 255, 0.8)',
  zIndex = 1000,
  ...spinnerProps
}: LoadingOverlayProps) {
  if (!visible) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex,
    backgroundColor: backdrop ? backdropColor : 'transparent',
    pointerEvents: 'all',
  };

  return (
    <div style={overlayStyle}>
      <LoadingSpinner {...spinnerProps} />
    </div>
  );
}

// Loading button component
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  spinnerSize?: 'small' | 'medium' | 'large';
  spinnerColor?: string;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading,
  spinnerSize = 'small',
  spinnerColor,
  loadingText,
  children,
  disabled,
  style = {},
  ...buttonProps
}: LoadingButtonProps) {
  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#3182ce',
    color: 'white',
    fontSize: '14px',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    opacity: loading || disabled ? 0.7 : 1,
    fontFamily: 'system-ui, sans-serif',
    ...style,
  };

  return (
    <button {...buttonProps} disabled={loading || disabled} style={buttonStyle}>
      {loading && (
        <LoadingSpinner size={spinnerSize} color={spinnerColor || 'currentColor'} label="" />
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}

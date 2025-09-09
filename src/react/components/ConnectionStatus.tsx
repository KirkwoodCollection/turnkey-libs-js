// Connection status component for WebSocket connections

import React from 'react';
import { ConnectionState } from '../../core/websocket/types';

export interface ConnectionStatusProps {
  connectionState: ConnectionState;
  showText?: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'medium' | 'large';
}

export function ConnectionStatus({
  connectionState,
  showText = true,
  className = '',
  style = {},
  size = 'medium'
}: ConnectionStatusProps) {
  const getStatusColor = (state: ConnectionState): string => {
    switch (state) {
      case 'OPEN':
        return '#48bb78'; // green
      case 'CONNECTING':
      case 'RECONNECTING':
        return '#ed8936'; // orange
      case 'CLOSING':
      case 'CLOSED':
        return '#f56565'; // red
      default:
        return '#a0aec0'; // gray
    }
  };

  const getStatusText = (state: ConnectionState): string => {
    switch (state) {
      case 'OPEN':
        return 'Connected';
      case 'CONNECTING':
        return 'Connecting...';
      case 'RECONNECTING':
        return 'Reconnecting...';
      case 'CLOSING':
        return 'Disconnecting...';
      case 'CLOSED':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const sizeMap = {
    small: { dot: 6, text: '12px', gap: '4px' },
    medium: { dot: 8, text: '14px', gap: '6px' },
    large: { dot: 10, text: '16px', gap: '8px' }
  };

  const sizes = sizeMap[size];
  const color = getStatusColor(connectionState);
  const text = getStatusText(connectionState);

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sizes.gap,
    fontFamily: 'system-ui, sans-serif',
    fontSize: sizes.text,
    color: '#4a5568',
    ...style
  };

  const dotStyle: React.CSSProperties = {
    width: sizes.dot,
    height: sizes.dot,
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
    animation: (connectionState === 'CONNECTING' || connectionState === 'RECONNECTING') 
      ? 'turnkey-pulse 2s infinite' 
      : undefined
  };

  return (
    <>
      <style>{`
        @keyframes turnkey-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div className={className} style={containerStyle}>
        <div style={dotStyle} aria-hidden="true" />
        {showText && <span>{text}</span>}
      </div>
    </>
  );
}

// Enhanced connection status with additional info
export interface DetailedConnectionStatusProps extends ConnectionStatusProps {
  lastConnected?: string;
  reconnectAttempts?: number;
  maxReconnectAttempts?: number;
  showDetails?: boolean;
}

export function DetailedConnectionStatus({
  lastConnected,
  reconnectAttempts = 0,
  maxReconnectAttempts = 0,
  showDetails = false,
  ...statusProps
}: DetailedConnectionStatusProps) {
  const formatLastConnected = (timestamp?: string): string => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <ConnectionStatus {...statusProps} />
      
      {showDetails && (
        <div style={{
          fontSize: '12px',
          color: '#718096',
          fontFamily: 'system-ui, sans-serif'
        }}>
          {lastConnected && (
            <div>Last connected: {formatLastConnected(lastConnected)}</div>
          )}
          
          {statusProps.connectionState === 'RECONNECTING' && maxReconnectAttempts > 0 && (
            <div>
              Attempt {reconnectAttempts} of {maxReconnectAttempts}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Connection status badge
export interface ConnectionBadgeProps {
  connectionState: ConnectionState;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

export function ConnectionBadge({
  connectionState,
  size = 'medium',
  className = '',
  style = {}
}: ConnectionBadgeProps) {
  const getStatusColor = (state: ConnectionState) => {
    switch (state) {
      case 'OPEN':
        return { bg: '#f0fff4', border: '#9ae6b4', text: '#22543d' };
      case 'CONNECTING':
      case 'RECONNECTING':
        return { bg: '#fffaf0', border: '#fbd38d', text: '#744210' };
      case 'CLOSING':
      case 'CLOSED':
        return { bg: '#fff5f5', border: '#feb2b2', text: '#742a2a' };
      default:
        return { bg: '#f7fafc', border: '#cbd5e0', text: '#4a5568' };
    }
  };

  const sizeMap = {
    small: { padding: '2px 6px', fontSize: '10px' },
    medium: { padding: '4px 8px', fontSize: '12px' },
    large: { padding: '6px 12px', fontSize: '14px' }
  };

  const colors = getStatusColor(connectionState);
  const sizes = sizeMap[size];

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: sizes.padding,
    fontSize: sizes.fontSize,
    fontWeight: 500,
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '4px',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.bg,
    color: colors.text,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    ...style
  };

  return (
    <span className={className} style={badgeStyle}>
      {connectionState}
    </span>
  );
}
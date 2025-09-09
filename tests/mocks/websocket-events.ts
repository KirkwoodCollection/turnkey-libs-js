// ⚠️ MOCK_DATA - NOT FOR PRODUCTION ⚠️
// MARKED: MOCK_DATA

export const MOCK_DATA_INDICATOR = "⚠️ MOCK DATA - NOT FOR PRODUCTION ⚠️";

export const mockWebSocketMessage = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  id: "MOCK_MSG_001",
  type: "booking_update",
  timestamp: new Date().toISOString(),
  payload: {
    bookingId: "MOCK_BOOKING_12345",
    status: "confirmed",
    updatedFields: ["status", "confirmationNumber"],
    confirmationNumber: "MOCK_CONF_789"
  },
  correlationId: "MOCK_CORR_ABC123"
};

export const mockConnectionEvent = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  id: "MOCK_CONN_001",
  type: "connection_established",
  timestamp: new Date().toISOString(),
  payload: {
    sessionId: "MOCK_SESSION_XYZ789",
    serverInfo: {
      version: "MOCK_v1.0.0",
      region: "MOCK_us-east-1"
    }
  }
};

export const mockAnalyticsEvent = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  id: "MOCK_ANALYTICS_001",
  type: "user_action",
  timestamp: new Date().toISOString(),
  payload: {
    action: "room_selected",
    userId: "MOCK_USER_456",
    sessionId: "MOCK_SESSION_789",
    properties: {
      roomTypeId: "MOCK_DELUXE_SUITE",
      price: 299.99,
      currency: "USD"
    }
  }
};

export const mockErrorEvent = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  id: "MOCK_ERROR_001",
  type: "error",
  timestamp: new Date().toISOString(),
  payload: {
    error: {
      code: "MOCK_WS_ERROR_001",
      message: "MOCK: WebSocket error for testing",
      severity: "warning"
    }
  }
};

export const mockHeartbeatEvent = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  id: "MOCK_HEARTBEAT_001",
  type: "ping",
  timestamp: new Date().toISOString(),
  payload: {}
};

export const mockBatchEvents = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  events: [
    {
      id: "MOCK_BATCH_001",
      type: "page_view",
      timestamp: new Date().toISOString(),
      payload: {
        page: "/search",
        sessionId: "MOCK_SESSION_BATCH_1"
      }
    },
    {
      id: "MOCK_BATCH_002", 
      type: "search_performed",
      timestamp: new Date().toISOString(),
      payload: {
        destination: "MOCK_DESTINATION",
        sessionId: "MOCK_SESSION_BATCH_1"
      }
    },
    {
      id: "MOCK_BATCH_003",
      type: "room_selected",
      timestamp: new Date().toISOString(),
      payload: {
        roomTypeId: "MOCK_STANDARD_ROOM",
        sessionId: "MOCK_SESSION_BATCH_1"
      }
    }
  ]
};

// Mock WebSocket event generators
export function generateMockBookingEvent(bookingId: string = "MOCK_BOOKING_DEFAULT"): any {
  return {
    _mock: true,
    _timestamp: new Date().toISOString(),
    _warning: MOCK_DATA_INDICATOR,
    id: `MOCK_BOOKING_EVENT_${Date.now()}`,
    type: "booking_status_changed",
    timestamp: new Date().toISOString(),
    payload: {
      bookingId: bookingId.startsWith('MOCK_') ? bookingId : `MOCK_${bookingId}`,
      previousStatus: "pending",
      newStatus: "confirmed",
      timestamp: new Date().toISOString()
    }
  };
}

export function generateMockUserEvent(userId: string = "MOCK_USER_DEFAULT", action: string = "page_view"): any {
  return {
    _mock: true,
    _timestamp: new Date().toISOString(),
    _warning: MOCK_DATA_INDICATOR,
    id: `MOCK_USER_EVENT_${Date.now()}`,
    type: "user_activity",
    timestamp: new Date().toISOString(),
    payload: {
      userId: userId.startsWith('MOCK_') ? userId : `MOCK_${userId}`,
      action: action.startsWith('MOCK_') ? action : `MOCK_${action}`,
      sessionId: `MOCK_SESSION_${Date.now()}`,
      properties: {
        userAgent: "MOCK_USER_AGENT",
        ipAddress: "MOCK_IP_192.168.1.1"
      }
    }
  };
}

// Utility functions for mock WebSocket data
export function stripMockIndicators(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(stripMockIndicators);
  }

  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip mock-related properties
      if (key.startsWith('_mock') || key.startsWith('_warning') || key.startsWith('_timestamp')) {
        continue;
      }
      cleaned[key] = stripMockIndicators(value);
    }
    return cleaned;
  }

  // Remove MOCK_ prefixes from strings
  if (typeof data === 'string' && data.startsWith('MOCK_')) {
    return data.replace(/^MOCK_/, '');
  }

  return data;
}

export function containsMockData(data: any): boolean {
  if (data === null || data === undefined) {
    return false;
  }

  if (Array.isArray(data)) {
    return data.some(containsMockData);
  }

  if (typeof data === 'object') {
    // Check for mock properties
    if ('_mock' in data || '_warning' in data) {
      return true;
    }
    
    return Object.values(data).some(containsMockData);
  }

  if (typeof data === 'string') {
    return data.includes('MOCK') || data.includes(MOCK_DATA_INDICATOR);
  }

  return false;
}

// Get mock WebSocket event by type
export function getMockWebSocketEvent(type: 'message' | 'connection' | 'analytics' | 'error' | 'heartbeat' | 'batch'): any {
  const mockEventMap = {
    message: mockWebSocketMessage,
    connection: mockConnectionEvent,
    analytics: mockAnalyticsEvent,
    error: mockErrorEvent,
    heartbeat: mockHeartbeatEvent,
    batch: mockBatchEvents
  };

  return mockEventMap[type] || null;
}

// Mock WebSocket server responses
export const mockWebSocketResponses = {
  _mock: true,
  _warning: MOCK_DATA_INDICATOR,
  connectionAck: {
    id: "MOCK_ACK_001",
    type: "connection_ack",
    timestamp: new Date().toISOString(),
    payload: {
      status: "connected",
      sessionId: "MOCK_SESSION_ACK_123"
    }
  },
  subscriptionAck: {
    id: "MOCK_SUB_ACK_001",
    type: "subscription_ack",
    timestamp: new Date().toISOString(),
    payload: {
      subscriptionId: "MOCK_SUB_123",
      topic: "MOCK_booking_updates"
    }
  },
  pong: {
    id: "MOCK_PONG_001",
    type: "pong",
    timestamp: new Date().toISOString(),
    payload: {}
  }
};
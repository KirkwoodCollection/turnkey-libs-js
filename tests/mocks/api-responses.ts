// ⚠️ MOCK_DATA - NOT FOR PRODUCTION ⚠️
// MARKED: MOCK_DATA

export const MOCK_DATA_INDICATOR = "⚠️ MOCK DATA - NOT FOR PRODUCTION ⚠️";

export const mockBookingResponse = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  data: {
    bookingId: "MOCK_BOOKING_12345",
    status: "confirmed",
    propertyId: "MOCK_PROPERTY_789",
    checkIn: "2024-12-15",
    checkOut: "2024-12-18",
    roomType: "MOCK_DELUXE_SUITE",
    guestCount: 2,
    totalAmount: 599.99,
    currency: "USD",
    customerInfo: {
      firstName: "MOCK_John",
      lastName: "MOCK_Doe",
      email: "mock.john.doe@example.com",
      phone: "+1-555-MOCK-123"
    }
  }
};

export const mockSearchResponse = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  data: {
    searchId: "MOCK_SEARCH_67890",
    results: [
      {
        propertyId: "MOCK_PROPERTY_001",
        propertyName: "MOCK Grand Hotel",
        location: "MOCK City Center",
        rating: 4.5,
        rooms: [
          {
            roomTypeId: "MOCK_STANDARD_ROOM",
            name: "MOCK Standard Room",
            price: 199.99,
            currency: "USD",
            availability: 5,
            maxOccupancy: 2
          },
          {
            roomTypeId: "MOCK_DELUXE_SUITE",
            name: "MOCK Deluxe Suite",
            price: 299.99,
            currency: "USD",
            availability: 2,
            maxOccupancy: 4
          }
        ]
      }
    ],
    totalResults: 1,
    searchCriteria: {
      checkIn: "2024-12-15",
      checkOut: "2024-12-18",
      guestCount: 2,
      location: "MOCK_DESTINATION"
    }
  }
};

export const mockAnalyticsResponse = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  data: {
    sessionId: "MOCK_SESSION_ABC123",
    events: [
      {
        eventId: "MOCK_EVENT_001",
        type: "page_view",
        timestamp: "2024-12-01T10:00:00Z",
        properties: {
          page: "/search",
          referrer: "MOCK_GOOGLE"
        }
      },
      {
        eventId: "MOCK_EVENT_002",
        type: "search_performed",
        timestamp: "2024-12-01T10:01:30Z",
        properties: {
          destination: "MOCK_DESTINATION",
          checkIn: "2024-12-15",
          checkOut: "2024-12-18"
        }
      }
    ],
    metrics: {
      conversionRate: 0.125,
      averageSessionDuration: 420,
      bounceRate: 0.65
    }
  }
};

export const mockErrorResponse = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  error: {
    code: "MOCK_ERROR_001",
    message: "MOCK: Simulated API error for testing",
    details: {
      field: "MOCK_FIELD",
      reason: "MOCK validation error"
    },
    timestamp: new Date().toISOString()
  }
};

export const mockPagingResponse = {
  _mock: true,
  _timestamp: new Date().toISOString(),
  _warning: MOCK_DATA_INDICATOR,
  data: {
    items: [
      {
        id: "MOCK_ITEM_001",
        name: "MOCK Item 1",
        value: "MOCK_VALUE_1"
      },
      {
        id: "MOCK_ITEM_002",
        name: "MOCK Item 2",
        value: "MOCK_VALUE_2"
      }
    ],
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 100,
      totalPages: 10,
      hasNext: true,
      hasPrevious: false
    }
  }
};

// Utility to strip all mock indicators for production
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

// Check if data contains mock indicators
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

// Get mock data by type
export function getMockData(type: 'booking' | 'search' | 'analytics' | 'error' | 'paging'): any {
  const mockDataMap = {
    booking: mockBookingResponse,
    search: mockSearchResponse,
    analytics: mockAnalyticsResponse,
    error: mockErrorResponse,
    paging: mockPagingResponse
  };

  return mockDataMap[type] || null;
}
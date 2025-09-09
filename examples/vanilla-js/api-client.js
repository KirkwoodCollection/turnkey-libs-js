// Example: Vanilla JavaScript API Client Usage
// This demonstrates using the core API client without any framework

import { BaseApiClient, BookingApiClient } from '@turnkey/libs-js/core';

// Create a custom API client
class CustomApiClient extends BaseApiClient {
  constructor() {
    super({
      baseUrl: 'https://api.example.com',
      timeout: 10000,
      retryAttempts: 3
    });

    // Add authentication interceptor
    this.addRequestInterceptor(async (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        return {
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${token}`
          }
        };
      }
      return config;
    });

    // Add response interceptor for error handling
    this.addResponseInterceptor(async (response) => {
      console.log(`API call to ${response.data.url} completed:`, response.status);
      return response;
    });
  }
}

// Usage example
async function exampleUsage() {
  console.log('🚀 Starting API Client Example');

  const client = new CustomApiClient();

  try {
    // Make API calls
    console.log('📡 Fetching user data...');
    const userResponse = await client.get('/users/me');
    console.log('User data:', userResponse.data);

    console.log('📡 Creating a booking...');
    const bookingResponse = await client.post('/bookings', {
      checkIn: '2024-12-15',
      checkOut: '2024-12-18',
      guests: 2,
      roomType: 'deluxe'
    });
    console.log('Booking created:', bookingResponse.data);

    console.log('📡 Updating booking...');
    const updateResponse = await client.put(`/bookings/${bookingResponse.data.id}`, {
      specialRequests: 'Late check-in please'
    });
    console.log('Booking updated:', updateResponse.data);

  } catch (error) {
    console.error('❌ API Error:', error);
    
    if (error.status === 401) {
      console.log('🔒 Authentication required');
      // Handle authentication
    } else if (error.status >= 500) {
      console.log('🚨 Server error, please try again later');
    }
  }
}

// Using the BookingApiClient
async function bookingClientExample() {
  console.log('🏨 Starting Booking Client Example');

  const bookingClient = new BookingApiClient({
    baseUrl: 'https://booking-api.example.com'
  });

  try {
    // Search for available rooms
    console.log('🔍 Searching for available rooms...');
    const searchResult = await bookingClient.searchAvailability({
      destination: 'Paris',
      checkIn: '2024-12-15',
      checkOut: '2024-12-18',
      guests: 2
    });
    console.log('Available rooms:', searchResult.data);

    if (searchResult.data.results.length > 0) {
      const room = searchResult.data.results[0];
      
      // Get room details
      console.log('🏠 Getting room details...');
      const roomDetails = await bookingClient.getRoomDetails(room.roomTypeId);
      console.log('Room details:', roomDetails.data);

      // Create booking
      console.log('📝 Creating booking...');
      const booking = await bookingClient.createBooking({
        roomTypeId: room.roomTypeId,
        checkIn: '2024-12-15',
        checkOut: '2024-12-18',
        guests: 2,
        customerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        }
      });
      console.log('Booking created:', booking.data);
    }

  } catch (error) {
    console.error('❌ Booking Error:', error);
  }
}

// Error handling example
function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.name === 'TurnkeyApiError') {
      console.error('Unhandled API Error:', event.reason);
      
      // You could show a user-friendly error message here
      showUserError('Something went wrong. Please try again.');
      
      event.preventDefault();
    }
  });
}

function showUserError(message) {
  // Example error display (you'd implement this based on your UI)
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 12px;
    border-radius: 4px;
    z-index: 1000;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    document.body.removeChild(errorDiv);
  }, 5000);
}

// Run examples
if (typeof window !== 'undefined') {
  // Browser environment
  setupGlobalErrorHandling();
  
  document.addEventListener('DOMContentLoaded', () => {
    exampleUsage();
    bookingClientExample();
  });
} else {
  // Node.js environment
  exampleUsage();
  bookingClientExample();
}
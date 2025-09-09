// Example: React Booking Widget Integration
// This demonstrates using the React hooks and providers in a booking widget

import React, { useState, useEffect } from 'react';
import {
  ApiProvider,
  useBookingClient,
  useWebSocket,
  useAuth,
  LoadingSpinner,
  ErrorBoundary,
  ConnectionStatus
} from '@turnkey/libs-js/react';

// Main App with providers
function App() {
  return (
    <ErrorBoundary>
      <ApiProvider config={{
        booking: { 
          baseUrl: 'https://booking-api.example.com',
          timeout: 15000
        },
        analytics: { 
          baseUrl: 'https://analytics-api.example.com' 
        }
      }}>
        <BookingWidget />
      </ApiProvider>
    </ErrorBoundary>
  );
}

// Booking Widget Component
function BookingWidget() {
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Hotel Booking</h1>
      
      {/* Connection Status */}
      <ConnectionBanner />
      
      {/* Search Form */}
      <SearchForm 
        params={searchParams} 
        onChange={setSearchParams} 
      />
      
      {/* Search Results */}
      <SearchResults params={searchParams} />
    </div>
  );
}

// Connection status banner
function ConnectionBanner() {
  const { isConnected, connectionState, lastMessage } = useWebSocket(
    'wss://booking-api.example.com/ws',
    { autoConnect: true }
  );

  return (
    <div style={{
      padding: '10px',
      marginBottom: '20px',
      borderRadius: '4px',
      backgroundColor: isConnected ? '#e8f5e8' : '#fff3cd'
    }}>
      <ConnectionStatus 
        connectionState={connectionState}
        showText={true}
        size="medium"
      />
      {lastMessage && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          Last update: {lastMessage.type}
        </div>
      )}
    </div>
  );
}

// Search form component
function SearchForm({ params, onChange }) {
  const handleInputChange = (field, value) => {
    onChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '20px',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <div>
        <label>Destination</label>
        <input
          type="text"
          value={params.destination}
          onChange={(e) => handleInputChange('destination', e.target.value)}
          placeholder="Where do you want to go?"
          style={{ width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>
      
      <div>
        <label>Check-in</label>
        <input
          type="date"
          value={params.checkIn}
          onChange={(e) => handleInputChange('checkIn', e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>
      
      <div>
        <label>Check-out</label>
        <input
          type="date"
          value={params.checkOut}
          onChange={(e) => handleInputChange('checkOut', e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>
      
      <div>
        <label>Guests</label>
        <select
          value={params.guests}
          onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
          style={{ width: '100%', padding: '8px', marginTop: '4px' }}
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
    </form>
  );
}

// Search results component
function SearchResults({ params }) {
  const bookingClient = useBookingClient();
  const { send } = useWebSocket('wss://booking-api.example.com/ws');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSearch = params.destination && params.checkIn && params.checkOut;

  const handleSearch = async () => {
    if (!canSearch) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Searching for rooms...');
      
      const response = await bookingClient.searchAvailability({
        destination: params.destination,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: params.guests
      });

      setResults(response.data.results || []);

      // Send search event via WebSocket for analytics
      await send({
        type: 'search_performed',
        payload: {
          destination: params.destination,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          guests: params.guests,
          timestamp: new Date().toISOString()
        }
      });

    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <LoadingSpinner size="large" label="Searching for rooms..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        color: '#c33'
      }}>
        ❌ Error: {error}
        <button 
          onClick={handleSearch}
          style={{ marginLeft: '10px', padding: '5px 10px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleSearch}
          disabled={!canSearch || loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: canSearch ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canSearch ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? 'Searching...' : 'Search Hotels'}
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <h3>Available Hotels ({results.length})</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {results.map((hotel, index) => (
              <HotelCard key={index} hotel={hotel} searchParams={params} />
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && canSearch && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No hotels found for your search criteria. Try different dates or location.
        </div>
      )}
    </div>
  );
}

// Hotel card component
function HotelCard({ hotel, searchParams }) {
  const bookingClient = useBookingClient();
  const { send } = useWebSocket('wss://booking-api.example.com/ws');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [booking, setBooking] = useState(false);

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);

    // Send room selection event
    await send({
      type: 'room_selected',
      payload: {
        hotelId: hotel.propertyId,
        roomTypeId: room.roomTypeId,
        price: room.price,
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleBookNow = async () => {
    if (!selectedRoom) return;

    setBooking(true);
    
    try {
      const response = await bookingClient.createBooking({
        propertyId: hotel.propertyId,
        roomTypeId: selectedRoom.roomTypeId,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        guests: searchParams.guests,
        customerInfo: {
          firstName: 'John', // In real app, get from auth or form
          lastName: 'Doe',
          email: 'john.doe@example.com'
        }
      });

      alert(`Booking created! Confirmation: ${response.data.confirmationNumber}`);
      
      // Send booking confirmation event
      await send({
        type: 'booking_created',
        payload: {
          bookingId: response.data.bookingId,
          confirmationNumber: response.data.confirmationNumber,
          timestamp: new Date().toISOString()
        }
      });

    } catch (err) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h4 style={{ margin: '0 0 8px 0' }}>{hotel.propertyName}</h4>
          <p style={{ margin: '0 0 8px 0', color: '#666' }}>📍 {hotel.location}</p>
          <p style={{ margin: '0 0 16px 0' }}>⭐ {hotel.rating}/5</p>
        </div>
        
        {selectedRoom && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              ${selectedRoom.price}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>per night</div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h5>Available Rooms:</h5>
        <div style={{ display: 'grid', gap: '8px' }}>
          {hotel.rooms.map((room, idx) => (
            <div
              key={idx}
              onClick={() => handleRoomSelect(room)}
              style={{
                padding: '12px',
                border: `2px solid ${selectedRoom?.roomTypeId === room.roomTypeId ? '#007bff' : '#eee'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: selectedRoom?.roomTypeId === room.roomTypeId ? '#f0f8ff' : 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{room.name}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Max {room.maxOccupancy} guests • {room.availability} rooms available
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>${room.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRoom && (
        <button
          onClick={handleBookNow}
          disabled={booking}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: booking ? 'not-allowed' : 'pointer',
            opacity: booking ? 0.7 : 1
          }}
        >
          {booking ? 'Booking...' : `Book Now - ${selectedRoom.name}`}
        </button>
      )}
    </div>
  );
}

export default App;
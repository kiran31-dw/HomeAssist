import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Chatbot from '../../components/Chatbot';
import { formatTime } from '../../utils/time';
import '../Dashboard.css';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/users/bookings');
      setBookings(response.data.bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <h1>User Dashboard</h1>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/user/services" className="btn btn-primary">Browse Services</Link>
              <Link to="/user/bookings" className="btn btn-secondary">My Bookings</Link>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>AI Assistant</h2>
            <Chatbot />
          </div>

          <div className="dashboard-card">
            <h2>Recent Bookings</h2>
            {loading ? (
              <p>Loading...</p>
            ) : bookings.length === 0 ? (
              <p>No bookings yet. <Link to="/user/services">Book a service</Link></p>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.booking_id} className="booking-item">
                    <div>
                      <strong>{booking.service_name}</strong>
                      <p>Provider: {booking.provider_first_name} {booking.provider_last_name}</p>
                      <p>Date: {new Date(booking.booking_date).toLocaleDateString()} at {formatTime(booking.booking_time)}</p>
                      <p>Status: <span className={`status status-${booking.status}`}>{booking.status}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

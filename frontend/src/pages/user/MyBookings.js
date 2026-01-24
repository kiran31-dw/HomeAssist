import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/currency';
import '../Dashboard.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/users/bookings');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status: newStatus });
      fetchBookings();
      alert('Booking status updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleReviewSubmit = async (e, bookingId) => {
    e.preventDefault();
    try {
      await axios.post(`/api/bookings/${bookingId}/review`, reviewForm);
      alert('Review submitted successfully');
      setSelectedBooking(null);
      setReviewForm({ rating: 5, review_text: '' });
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="container">
        <h1>My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="dashboard-card">
            <p>No bookings yet. <a href="/user/services">Browse services</a> to make a booking.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.booking_id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.service_name}</h3>
                  <span className={`status status-${booking.status}`}>{booking.status}</span>
                </div>
                <div className="booking-details">
                  <p><strong>Provider:</strong> {booking.provider_first_name} {booking.provider_last_name}</p>
                  {booking.business_name && <p><strong>Business:</strong> {booking.business_name}</p>}
                  <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {booking.booking_time}</p>
                  <p><strong>Address:</strong> {booking.service_address}</p>
                  {booking.service_description && <p><strong>Description:</strong> {booking.service_description}</p>}
                  {booking.total_cost && <p><strong>Cost:</strong> {formatCurrency(booking.total_cost)}</p>}
                  <p><strong>Urgency:</strong> {booking.urgency_level}</p>
                </div>
                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.booking_id, 'cancelled')}
                      className="btn btn-danger"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {booking.status === 'completed' && !selectedBooking && (
                    <button
                      onClick={() => setSelectedBooking(booking.booking_id)}
                      className="btn btn-primary"
                    >
                      Submit Review
                    </button>
                  )}
                </div>
                {selectedBooking === booking.booking_id && (
                  <form onSubmit={(e) => handleReviewSubmit(e, booking.booking_id)} className="review-form">
                    <div className="form-group">
                      <label>Rating (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Review</label>
                      <textarea
                        value={reviewForm.review_text}
                        onChange={(e) => setReviewForm({...reviewForm, review_text: e.target.value})}
                        placeholder="Share your experience..."
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">Submit Review</button>
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(null)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

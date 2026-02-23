import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/currency';
import '../Dashboard.css';

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#ff9800';
    case 'under_review':
      return '#2196f3';
    case 'resolved':
      return '#4caf50';
    case 'dismissed':
      return '#9e9e9e';
    default:
      return '#666';
  }
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedComplaintBooking, setSelectedComplaintBooking] = useState(null);
  const [selectedResponsesBooking, setSelectedResponsesBooking] = useState(null);
  const [complaintsByBooking, setComplaintsByBooking] = useState({});
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: '' });
  const [complaintForm, setComplaintForm] = useState({ complaint_type: 'service_quality', complaint_text: '' });
  const warningShownRef = useRef(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    // Check for admin responses and show warning (only once)
    const hasAdminResponses = Object.values(complaintsByBooking).some(complaints => 
      complaints.some(complaint => complaint.admin_response && complaint.admin_response.trim())
    );
    
    if (hasAdminResponses && !loading && !warningShownRef.current) {
      const unreadCount = Object.values(complaintsByBooking).reduce((count, complaints) => {
        return count + complaints.filter(c => c.admin_response && c.admin_response.trim()).length;
      }, 0);
      
      if (unreadCount > 0) {
        alert(`⚠️ You have ${unreadCount} admin response${unreadCount > 1 ? 's' : ''} to your complaint${unreadCount > 1 ? 's' : ''}. Please check the "View Responses" button next to your bookings.`);
        warningShownRef.current = true;
      }
    }
  }, [complaintsByBooking, loading]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/users/bookings');
      const bookingsData = response.data.bookings;
      setBookings(bookingsData);
      
      // Fetch complaints for each completed booking
      const complaintsMap = {};
      for (const booking of bookingsData) {
        if (booking.status === 'completed') {
          try {
            const complaintsResponse = await axios.get(`/api/complaints/booking/${booking.booking_id}`);
            complaintsMap[booking.booking_id] = complaintsResponse.data.complaints || [];
          } catch (error) {
            console.error(`Error fetching complaints for booking ${booking.booking_id}:`, error);
            complaintsMap[booking.booking_id] = [];
          }
        }
      }
      setComplaintsByBooking(complaintsMap);
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

  const handleComplaintSubmit = async (e, bookingId, providerId) => {
    e.preventDefault();
    
    // Validate complaint text
    if (!complaintForm.complaint_text.trim()) {
      alert('Please enter your complaint details.');
      return;
    }

    if (complaintForm.complaint_text.trim().length < 10) {
      alert('Please provide more details about your complaint (at least 10 characters).');
      return;
    }

    try {
      await axios.post('/api/complaints', {
        booking_id: bookingId,
        provider_id: providerId,
        complaint_type: complaintForm.complaint_type,
        complaint_text: complaintForm.complaint_text.trim()
      });
      alert('Complaint submitted successfully. We will review it shortly.');
      setSelectedComplaintBooking(null);
      setComplaintForm({ complaint_type: 'service_quality', complaint_text: '' });
      await fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit complaint. Please try again.');
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
                  {booking.status === 'completed' && !selectedBooking && !selectedComplaintBooking && !selectedResponsesBooking && (
                    <>
                      <button
                        onClick={() => setSelectedBooking(booking.booking_id)}
                        className="btn btn-primary"
                        style={{ marginRight: '10px' }}
                      >
                        Submit Review
                      </button>
                      <button
                        onClick={() => setSelectedComplaintBooking(booking.booking_id)}
                        className="btn btn-danger"
                        style={{ marginRight: '10px' }}
                      >
                        Complaint Box
                      </button>
                      {complaintsByBooking[booking.booking_id]?.some(c => c.admin_response && c.admin_response.trim()) && (
                        <button
                          onClick={() => setSelectedResponsesBooking(booking.booking_id)}
                          className="btn"
                          style={{ 
                            backgroundColor: '#ff9800', 
                            color: 'white',
                            border: 'none',
                            position: 'relative'
                          }}
                          title="View Admin Responses"
                        >
                          📬 View Responses
                          <span 
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}
                          >
                            !
                          </span>
                        </button>
                      )}
                    </>
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
                {selectedComplaintBooking === booking.booking_id && (
                  <form onSubmit={(e) => handleComplaintSubmit(e, booking.booking_id, booking.provider_id)} className="review-form">
                    <h4 style={{ marginBottom: '15px', color: '#d32f2f' }}>File a Complaint</h4>
                    <div className="form-group">
                      <label>Complaint Type</label>
                      <select
                        value={complaintForm.complaint_type}
                        onChange={(e) => setComplaintForm({...complaintForm, complaint_type: e.target.value})}
                        required
                      >
                        <option value="service_quality">Service Quality</option>
                        <option value="behavior">Provider Behavior</option>
                        <option value="pricing">Pricing Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Complaint Details</label>
                      <textarea
                        value={complaintForm.complaint_text}
                        onChange={(e) => setComplaintForm({...complaintForm, complaint_text: e.target.value})}
                        placeholder="Please describe your complaint in detail..."
                        rows="5"
                        required
                      />
                      <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                        Minimum 10 characters required
                      </small>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-danger">Submit Complaint</button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedComplaintBooking(null);
                          setComplaintForm({ complaint_type: 'service_quality', complaint_text: '' });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                {selectedResponsesBooking === booking.booking_id && (
                  <div className="review-form" style={{ marginTop: '20px' }}>
                    <h4 style={{ marginBottom: '15px', color: '#ff9800' }}>📬 Admin Responses to Your Complaints</h4>
                    {complaintsByBooking[booking.booking_id]?.length > 0 ? (
                      complaintsByBooking[booking.booking_id].map((complaint, index) => (
                        <div key={complaint.complaint_id} style={{ 
                          marginBottom: '20px', 
                          padding: '15px', 
                          backgroundColor: '#f5f5f5', 
                          borderRadius: '8px',
                          border: '1px solid #ddd'
                        }}>
                          <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#666' }}>Complaint #{index + 1}</strong>
                            <span style={{ 
                              marginLeft: '10px', 
                              padding: '4px 8px', 
                              backgroundColor: getStatusColor(complaint.status),
                              color: 'white',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              {complaint.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Type:</strong> {complaint.complaint_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Your Complaint:</strong>
                            <p style={{ marginTop: '5px', color: '#333' }}>{complaint.complaint_text}</p>
                          </div>
                          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                            Submitted: {new Date(complaint.created_at).toLocaleString()}
                          </div>
                          {complaint.admin_response && complaint.admin_response.trim() ? (
                            <div style={{ 
                              marginTop: '15px', 
                              padding: '12px', 
                              backgroundColor: '#e3f2fd', 
                              borderRadius: '6px',
                              borderLeft: '4px solid #2196f3'
                            }}>
                              <strong style={{ color: '#1976d2' }}>📋 Admin Response:</strong>
                              <p style={{ marginTop: '8px', color: '#333', whiteSpace: 'pre-wrap' }}>
                                {complaint.admin_response}
                              </p>
                              {complaint.updated_at && (
                                <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                                  Responded: {new Date(complaint.updated_at).toLocaleString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ 
                              marginTop: '15px', 
                              padding: '12px', 
                              backgroundColor: '#fff3cd', 
                              borderRadius: '6px',
                              borderLeft: '4px solid #ffc107'
                            }}>
                              <strong style={{ color: '#856404' }}>⏳ Pending Response</strong>
                              <p style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>
                                Your complaint is under review. Admin will respond shortly.
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#666' }}>No complaints found for this booking.</p>
                    )}
                    <div style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedResponsesBooking(null)}
                        className="btn btn-secondary"
                      >
                        Close
                      </button>
                    </div>
                  </div>
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

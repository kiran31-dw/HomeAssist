import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency, formatCurrencyShort } from '../../utils/currency';
import '../Dashboard.css';

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    booking_date: '',
    booking_time: '',
    service_address: '',
    service_description: '',
    urgency_level: 'medium'
  });
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProviderDetails();
    fetchServices();
  }, [id]);

  const fetchProviderDetails = async () => {
    try {
      const response = await axios.get(`/api/users/providers/${id}`);
      setProvider(response.data.provider);
      setReviews(response.data.reviews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching provider:', error);
      setError('Provider not found');
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/users/services', {
        params: { category: provider?.service_category }
      });
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedService) {
      setError('Please select a service');
      return;
    }

    // Check if provider is available
    if (provider.availability_status !== 'available') {
      setError('Provider is currently busy with another job. Please try another provider or book later.');
      return;
    }

    try {
      const response = await axios.post('/api/bookings', {
        provider_id: id,
        service_id: selectedService,
        ...bookingForm,
        total_cost: provider.hourly_rate || null
      });

      alert('Booking created successfully!');
      navigate('/user/bookings');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error && !provider) return <div className="container">{error}</div>;

  return (
    <div className="dashboard">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-secondary">← Back</button>
        <h1>{provider.business_name || `${provider.first_name} ${provider.last_name}`}</h1>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Provider Information</h2>
            <div className="provider-details">
              <p><strong>Name:</strong> {provider.first_name} {provider.last_name}</p>
              <p><strong>Service Category:</strong> {provider.service_category}</p>
              <p><strong>Rating:</strong> ⭐ {provider.rating || 'N/A'} ({provider.total_reviews || 0} reviews)</p>
              <p><strong>Hourly Rate:</strong> {formatCurrencyShort(provider.hourly_rate)}/hr</p>
              {provider.experience_years && (
                <p><strong>Experience:</strong> {provider.experience_years} years</p>
              )}
              <p><strong>Location:</strong> {provider.city}, {provider.state}</p>
              <p><strong>Status:</strong> <span className={`status status-${provider.availability_status}`}>
                {provider.availability_status === 'available' ? '✅ Available' : 
                 provider.availability_status === 'busy' ? '🔴 Busy (Working on a job)' : 
                 '⚫ Offline'}
              </span></p>
              {provider.availability_status !== 'available' && (
                <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '10px' }}>
                  ⚠️ This provider is currently unavailable. They will become available after completing their current job.
                </p>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <h2>Book Service</h2>
            {provider.availability_status !== 'available' && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                <strong>⚠️ Provider Unavailable:</strong> This provider is currently busy with another job. 
                Please select a different provider or try again later.
              </div>
            )}
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Service</label>
                <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} required>
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.service_name} - {formatCurrency(service.base_price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={bookingForm.booking_date}
                  onChange={(e) => setBookingForm({...bookingForm, booking_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={bookingForm.booking_time}
                  onChange={(e) => setBookingForm({...bookingForm, booking_time: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Service Address</label>
                <input
                  type="text"
                  value={bookingForm.service_address}
                  onChange={(e) => setBookingForm({...bookingForm, service_address: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={bookingForm.service_description}
                  onChange={(e) => setBookingForm({...bookingForm, service_description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Urgency</label>
                <select
                  value={bookingForm.urgency_level}
                  onChange={(e) => setBookingForm({...bookingForm, urgency_level: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={provider.availability_status !== 'available'}
              >
                {provider.availability_status === 'available' ? 'Book Now' : 'Provider Unavailable'}
              </button>
            </form>
          </div>

          <div className="dashboard-card">
            <h2>Reviews</h2>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.review_id} className="review-item">
                    <div className="review-header">
                      <strong>{review.first_name} {review.last_name}</strong>
                      <span>⭐ {review.rating}/5</span>
                    </div>
                    <p>{review.review_text || 'No comment'}</p>
                    <small>{new Date(review.created_at).toLocaleDateString()}</small>
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

export default ProviderProfile;

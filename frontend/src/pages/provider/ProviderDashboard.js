import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/currency';
import '../Dashboard.css';

const ProviderDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, jobsRes, perfRes] = await Promise.all([
        axios.get('/api/providers/profile'),
        axios.get('/api/providers/jobs'),
        axios.get('/api/providers/performance')
      ]);
      setProfile(profileRes.data.provider);
      setJobs(jobsRes.data.jobs);
      setPerformance(perfRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      const response = await axios.put(`/api/bookings/${jobId}/status`, { status: newStatus });
      fetchData();
      
      // Show appropriate message based on status
      if (newStatus === 'in_progress') {
        alert('Job started! Your availability status has been set to "Busy". You will be unavailable until you complete this job.');
      } else if (newStatus === 'completed') {
        alert('Job completed! Your availability status has been set back to "Available".');
      } else {
        alert('Job status updated successfully');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      await axios.put('/api/providers/profile', data);
      alert('Profile updated successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Provider Dashboard</h1>
        {profile?.verification_status === 'pending' && (
          <div className="alert alert-info">
            Your account is pending verification. You will be able to receive bookings once verified by an admin.
          </div>
        )}

        <div className="dashboard-tabs">
          <button
            className={activeTab === 'jobs' ? 'active' : ''}
            onClick={() => setActiveTab('jobs')}
          >
            My Jobs
          </button>
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={activeTab === 'performance' ? 'active' : ''}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
        </div>

        {activeTab === 'jobs' && (
          <div className="dashboard-card">
            <h2>Assigned Jobs</h2>
            {jobs.length === 0 ? (
              <p>No jobs assigned yet.</p>
            ) : (
              <div className="jobs-list">
                {jobs.map(job => (
                  <div key={job.booking_id} className="job-card">
                    <div className="job-header">
                      <h3>{job.service_name}</h3>
                      <span className={`status status-${job.status}`}>{job.status}</span>
                    </div>
                    <div className="job-details">
                      <p><strong>Customer:</strong> {job.user_first_name} {job.user_last_name}</p>
                      <p><strong>Contact:</strong> {job.user_phone} | {job.user_email}</p>
                      <p><strong>Date:</strong> {new Date(job.booking_date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {job.booking_time}</p>
                      <p><strong>Address:</strong> {job.service_address}</p>
                      {job.service_description && <p><strong>Description:</strong> {job.service_description}</p>}
                      {job.total_cost && <p><strong>Cost:</strong> {formatCurrency(job.total_cost)}</p>}
                    </div>
                    <div className="job-actions">
                      {job.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(job.booking_id, 'confirmed')}
                            className="btn btn-success"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(job.booking_id, 'cancelled')}
                            className="btn btn-danger"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {job.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(job.booking_id, 'in_progress')}
                          className="btn btn-primary"
                        >
                          Start Job
                        </button>
                      )}
                      {job.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(job.booking_id, 'completed')}
                          className="btn btn-success"
                        >
                          Complete Job
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="dashboard-card">
            <h2>Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" defaultValue={profile?.first_name} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" defaultValue={profile?.last_name} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" defaultValue={profile?.phone} required />
              </div>
              <div className="form-group">
                <label>Business Name</label>
                <input type="text" name="business_name" defaultValue={profile?.business_name} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" defaultValue={profile?.address} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" defaultValue={profile?.city} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" defaultValue={profile?.state} />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" name="zip_code" defaultValue={profile?.zip_code} />
              </div>
              <div className="form-group">
                <label>Experience (Years)</label>
                <input type="number" name="experience_years" defaultValue={profile?.experience_years} />
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" step="0.01" name="hourly_rate" defaultValue={profile?.hourly_rate} />
              </div>
              <div className="form-group">
                <label>Availability Status</label>
                <select name="availability_status" defaultValue={profile?.availability_status}>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Update Profile</button>
            </form>
            <div className="profile-stats">
              <p><strong>Rating:</strong> ⭐ {profile?.rating || 'N/A'} ({profile?.total_reviews || 0} reviews)</p>
              <p><strong>Verification Status:</strong> <span className={`status status-${profile?.verification_status}`}>
                {profile?.verification_status}
              </span></p>
            </div>
          </div>
        )}

        {activeTab === 'performance' && performance && (
          <div className="dashboard-card">
            <h2>Performance Statistics</h2>
            <div className="performance-stats">
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p className="stat-value">{performance.stats.total_bookings}</p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-value">{performance.stats.completed_bookings}</p>
              </div>
              <div className="stat-card">
                <h3>Cancelled</h3>
                <p className="stat-value">{performance.stats.cancelled_bookings}</p>
              </div>
              <div className="stat-card">
                <h3>Average Rating</h3>
                <p className="stat-value">⭐ {performance.stats.avg_rating || 'N/A'}</p>
              </div>
              <div className="stat-card">
                <h3>Total Reviews</h3>
                <p className="stat-value">{performance.stats.total_reviews}</p>
              </div>
            </div>
            {performance.recent_reviews && performance.recent_reviews.length > 0 && (
              <div className="reviews-section">
                <h3>Recent Reviews</h3>
                <div className="reviews-list">
                  {performance.recent_reviews.map(review => (
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;

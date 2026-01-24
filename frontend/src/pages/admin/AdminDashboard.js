import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency, formatCurrencyShort } from '../../utils/currency';
import '../Dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, [activeTab]);

  const fetchOverview = async () => {
    try {
      if (activeTab === 'overview') {
        const response = await axios.get('/api/admin/analytics');
        setAnalytics(response.data);
      } else if (activeTab === 'providers') {
        const response = await axios.get('/api/admin/providers');
        setProviders(response.data.providers);
      } else if (activeTab === 'bookings') {
        const response = await axios.get('/api/admin/bookings');
        setBookings(response.data.bookings);
      } else if (activeTab === 'complaints') {
        const response = await axios.get('/api/admin/complaints');
        setComplaints(response.data.complaints);
      } else if (activeTab === 'users') {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data.users);
      } else if (activeTab === 'services') {
        const response = await axios.get('/api/admin/services');
        setServices(response.data.services);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleVerifyProvider = async (providerId, status) => {
    try {
      await axios.put(`/api/admin/providers/${providerId}/verify`, { verification_status: status });
      alert(`Provider ${status} successfully`);
      fetchOverview();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update provider');
    }
  };

  const handleComplaintUpdate = async (complaintId, status, response) => {
    try {
      await axios.put(`/api/admin/complaints/${complaintId}`, {
        status,
        admin_response: response
      });
      alert('Complaint updated successfully');
      fetchOverview();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update complaint');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      await axios.post('/api/admin/services', data);
      alert('Service added successfully');
      e.target.reset();
      fetchOverview();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add service');
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="dashboard-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={activeTab === 'providers' ? 'active' : ''} onClick={() => setActiveTab('providers')}>
            Providers
          </button>
          <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
            Bookings
          </button>
          <button className={activeTab === 'complaints' ? 'active' : ''} onClick={() => setActiveTab('complaints')}>
            Complaints
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            Users
          </button>
          <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>
            Services
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {activeTab === 'overview' && analytics && (
              <div className="dashboard-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-value">{analytics.total_users}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Providers</h3>
                  <p className="stat-value">{analytics.total_providers}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Bookings</h3>
                  <p className="stat-value">{analytics.total_bookings}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">{formatCurrency(analytics.total_revenue)}</p>
                </div>
                <div className="dashboard-card">
                  <h3>Bookings by Status</h3>
                  {analytics.bookings_by_status.map(item => (
                    <p key={item.status}>{item.status}: {item.count}</p>
                  ))}
                </div>
                <div className="dashboard-card">
                  <h3>Bookings by Category</h3>
                  {analytics.bookings_by_category.map(item => (
                    <p key={item.service_category}>{item.service_category}: {item.count}</p>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'providers' && (
              <div className="dashboard-card">
                <h2>Service Providers</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providers.map(provider => (
                        <tr key={provider.provider_id}>
                          <td>{provider.first_name} {provider.last_name}</td>
                          <td>{provider.email}</td>
                          <td>{provider.service_category}</td>
                          <td><span className={`status status-${provider.verification_status}`}>
                            {provider.verification_status}
                          </span></td>
                          <td>
                            {provider.verification_status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerifyProvider(provider.provider_id, 'verified')}
                                  className="btn btn-success btn-sm"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleVerifyProvider(provider.provider_id, 'rejected')}
                                  className="btn btn-danger btn-sm"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="dashboard-card">
                <h2>All Bookings</h2>
                <div className="bookings-list">
                  {bookings.map(booking => (
                    <div key={booking.booking_id} className="booking-card">
                      <p><strong>Service:</strong> {booking.service_name}</p>
                      <p><strong>User:</strong> {booking.user_first_name} {booking.user_last_name}</p>
                      <p><strong>Provider:</strong> {booking.provider_first_name} {booking.provider_last_name}</p>
                      <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> <span className={`status status-${booking.status}`}>{booking.status}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'complaints' && (
              <div className="dashboard-card">
                <h2>Complaints</h2>
                <div className="complaints-list">
                  {complaints.map(complaint => (
                    <div key={complaint.complaint_id} className="complaint-card">
                      <div className="complaint-header">
                        <h4>{complaint.complaint_type}</h4>
                        <span className={`status status-${complaint.status}`}>{complaint.status}</span>
                      </div>
                      <p>{complaint.complaint_text}</p>
                      {complaint.admin_response && (
                        <p><strong>Admin Response:</strong> {complaint.admin_response}</p>
                      )}
                      <div className="complaint-actions">
                        <select
                          onChange={(e) => {
                            const response = prompt('Enter admin response (optional):');
                            handleComplaintUpdate(complaint.complaint_id, e.target.value, response);
                          }}
                          defaultValue={complaint.status}
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="dashboard-card">
                <h2>Users</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>City</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.user_id}>
                          <td>{user.first_name} {user.last_name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td>{user.city || 'N/A'}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="dashboard-card">
                <h2>Services Management</h2>
                <form onSubmit={handleAddService} className="service-form">
                  <h3>Add New Service</h3>
                  <div className="form-group">
                    <label>Service Name</label>
                    <input type="text" name="service_name" required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select name="service_category" required>
                      <option value="">Select Category</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Painting">Painting</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Appliance">Appliance</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" />
                  </div>
                  <div className="form-group">
                    <label>Base Price ($)</label>
                    <input type="number" step="0.01" name="base_price" />
                  </div>
                  <button type="submit" className="btn btn-primary">Add Service</button>
                </form>
                <div className="services-list">
                  <h3>Existing Services</h3>
                  {services.map(service => (
                    <div key={service.service_id} className="service-item">
                      <strong>{service.service_name}</strong> - {service.service_category} - {formatCurrencyShort(service.base_price)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency, formatCurrencyShort } from '../../utils/currency';
import { formatTime } from '../../utils/time';
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
  
  const [adminMessageForm, setAdminMessageForm] = useState({ bookingId: null, message: '' });

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
      } else if (activeTab === 'revenue') {
        const response = await axios.get('/api/admin/revenue');
        setAnalytics(prev => ({ ...prev, revenueData: response.data }));
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

  const handleAdminMessageSubmit = async (e, bookingId) => {
    e.preventDefault();
    if (!adminMessageForm.message.trim()) {
      alert('Please enter an apology or response message.');
      return;
    }
    
    try {
      await axios.put(`/api/admin/bookings/${bookingId}/message`, {
        admin_message: adminMessageForm.message.trim()
      });
      alert('Message sent to user successfully');
      setAdminMessageForm({ bookingId: null, message: '' });
      fetchOverview(); // Refresh bookings
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send message');
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
          <button className={activeTab === 'revenue' ? 'active' : ''} onClick={() => setActiveTab('revenue')}>
            Revenue
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
                      
                      {booking.status === 'cancelled' && (
                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #ddd' }}>
                          <p><strong>Provider Rejection Reason:</strong> {booking.rejection_reason || 'No reason provided'}</p>
                          
                          {booking.admin_message ? (
                            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f4f8', borderLeft: '4px solid #2196f3', borderRadius: '4px' }}>
                              <strong style={{ color: '#0c5460' }}>Your Response Sent:</strong>
                              <p style={{ margin: '5px 0 0 0', color: '#0c5460', fontSize: '0.95em' }}>{booking.admin_message}</p>
                            </div>
                          ) : (
                            <div style={{ marginTop: '10px' }}>
                              {adminMessageForm.bookingId === booking.booking_id ? (
                                <form onSubmit={(e) => handleAdminMessageSubmit(e, booking.booking_id)}>
                                  <textarea
                                    value={adminMessageForm.message}
                                    onChange={(e) => setAdminMessageForm({ ...adminMessageForm, message: e.target.value })}
                                    placeholder="Type an apology or explanation to the user..."
                                    rows="3"
                                    style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
                                  />
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="submit" className="btn btn-primary btn-sm">Send User Message</button>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAdminMessageForm({ bookingId: null, message: '' })}>Cancel</button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  onClick={() => setAdminMessageForm({ bookingId: booking.booking_id, message: '' })}
                                  className="btn btn-sm"
                                  style={{ backgroundColor: '#2196f3', color: 'white' }}
                                >
                                  ✉️ Send Apology Message
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
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
                        <h4>{complaint.complaint_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}</h4>
                        <span className={`status status-${complaint.status}`}>{complaint.status?.replace('_', ' ').toUpperCase() || 'PENDING'}</span>
                      </div>
                      
                      <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                        <h5 style={{ marginBottom: '10px', color: '#d32f2f' }}>📋 Complaint Details</h5>
                        <p style={{ marginBottom: '8px', lineHeight: '1.6' }}><strong>Description:</strong> {complaint.complaint_text}</p>
                        <p style={{ marginBottom: '0', fontSize: '12px', color: '#666' }}>
                          Submitted: {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>

                      <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
                        <h5 style={{ marginBottom: '10px', color: '#1976d2' }}>👤 Complainant (User)</h5>
                        <p style={{ marginBottom: '5px' }}>
                          <strong>Name:</strong> {complaint.user_first_name || 'N/A'} {complaint.user_last_name || ''}
                        </p>
                        <p style={{ marginBottom: '5px' }}>
                          <strong>Email:</strong> {complaint.user_email || 'N/A'}
                        </p>
                        <p style={{ marginBottom: '5px' }}>
                          <strong>Phone:</strong> {complaint.user_phone || 'N/A'}
                        </p>
                        {complaint.user_city && (
                          <p style={{ marginBottom: '0' }}>
                            <strong>Location:</strong> {complaint.user_city}
                          </p>
                        )}
                      </div>

                      <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#fff3e0', borderRadius: '6px' }}>
                        <h5 style={{ marginBottom: '10px', color: '#e65100' }}>🔧 Service Provider</h5>
                        <p style={{ marginBottom: '5px' }}>
                          <strong>Name:</strong> {complaint.provider_business_name || `${complaint.provider_first_name || ''} ${complaint.provider_last_name || ''}`.trim() || 'N/A'}
                        </p>
                        {complaint.provider_category && (
                          <p style={{ marginBottom: '5px' }}>
                            <strong>Category:</strong> {complaint.provider_category}
                          </p>
                        )}
                        {complaint.provider_email && (
                          <p style={{ marginBottom: '5px' }}>
                            <strong>Email:</strong> {complaint.provider_email}
                          </p>
                        )}
                        {complaint.provider_phone && (
                          <p style={{ marginBottom: '0' }}>
                            <strong>Phone:</strong> {complaint.provider_phone}
                          </p>
                        )}
                      </div>

                      {complaint.booking_id && (
                        <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#f1f8e9', borderRadius: '6px' }}>
                          <h5 style={{ marginBottom: '10px', color: '#558b2f' }}>📅 Booking Information</h5>
                          {complaint.service_name && (
                            <p style={{ marginBottom: '5px' }}>
                              <strong>Service:</strong> {complaint.service_name}
                              {complaint.service_category && ` (${complaint.service_category})`}
                            </p>
                          )}
                          {complaint.booking_date && (
                            <p style={{ marginBottom: '5px' }}>
                              <strong>Date:</strong> {new Date(complaint.booking_date).toLocaleDateString()}
                              {complaint.booking_time && ` at ${formatTime(complaint.booking_time)}`}
                            </p>
                          )}
                          {complaint.service_address && (
                            <p style={{ marginBottom: '5px' }}>
                              <strong>Address:</strong> {complaint.service_address}
                            </p>
                          )}
                          {complaint.total_cost && (
                            <p style={{ marginBottom: '0' }}>
                              <strong>Total Cost:</strong> {formatCurrencyShort(complaint.total_cost)}
                            </p>
                          )}
                        </div>
                      )}

                      {complaint.admin_response && (
                        <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#e8f5e9', borderRadius: '6px', borderLeft: '4px solid #4caf50' }}>
                          <p style={{ marginBottom: '5px' }}>
                            <strong style={{ color: '#2e7d32' }}>✅ Admin Response:</strong>
                          </p>
                          <p style={{ marginTop: '5px', color: '#333', whiteSpace: 'pre-wrap' }}>{complaint.admin_response}</p>
                          {complaint.updated_at && (
                            <p style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                              Updated: {new Date(complaint.updated_at).toLocaleString()}
                            </p>
                          )}
                        </div>
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

            {activeTab === 'revenue' && analytics?.revenueData && (
              <div className="dashboard-card">
                <h2>Revenue Dashboard</h2>
                <div className="dashboard-grid">
                  <div className="stat-card">
                    <h3>Total Platform Revenue</h3>
                    <p className="stat-value">{formatCurrency(analytics.revenueData.total_revenue)}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Paid Bookings</h3>
                    <p className="stat-value">{analytics.revenueData.total_paid_bookings}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Average Commission</h3>
                    <p className="stat-value">{formatCurrency(analytics.revenueData.average_commission)}</p>
                  </div>
                </div>

                <div className="dashboard-card" style={{ marginTop: '20px' }}>
                  <h3>Recent Transactions (Last 20)</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Transaction ID</th>
                          <th>User</th>
                          <th>Provider</th>
                          <th>Service</th>
                          <th>Amount Paid</th>
                          <th>Commission</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.revenueData.recent_transactions.map((txn, idx) => (
                          <tr key={idx} style={txn.txn_status === 'cancelled' ? { backgroundColor: '#fff5f5' } : {}}>
                            <td>{new Date(txn.paid_at).toLocaleDateString()}</td>
                            <td style={{ fontSize: '0.85em' }}>
                              {txn.txn_status === 'cancelled'
                                ? <span style={{ color: '#bbb' }}>N/A</span>
                                : txn.transaction_id}
                            </td>
                            <td>{txn.user_first_name} {txn.user_last_name}</td>
                            <td>{txn.provider_business_name || `${txn.provider_first_name} ${txn.provider_last_name}`}</td>
                            <td>{txn.service_name}</td>
                            <td>{txn.amount_paid ? formatCurrencyShort(txn.amount_paid) : <span style={{ color: '#bbb' }}>—</span>}</td>
                            <td>
                              {txn.txn_status === 'paid'
                                ? <span style={{ color: 'green', fontWeight: 'bold' }}>+{formatCurrencyShort(txn.platform_commission)}</span>
                                : <span style={{ color: '#bbb' }}>—</span>}
                            </td>
                            <td>
                              {txn.txn_status === 'paid' ? (
                                <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold' }}>✓ Paid</span>
                              ) : (
                                <>
                                  <span style={{ background: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold' }}>✕ Cancelled</span>
                                  {txn.rejection_reason && (
                                    <div style={{ fontSize: '0.75em', color: '#999', marginTop: '3px' }}>Reason: {txn.rejection_reason}</div>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

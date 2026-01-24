import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency, formatCurrencyShort } from '../../utils/currency';
import '../Dashboard.css';

const BrowseServices = () => {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchProviders();
  }, [selectedCategory]);

  const fetchServices = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await axios.get('/api/users/services', { params });
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await axios.get('/api/users/providers', { params });
      setProviders(response.data.providers || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setLoading(false);
    }
  };

  const categories = ['Electrical', 'Plumbing', 'Painting', 'Carpentry', 'HVAC', 'Appliance', 'Cleaning', 'General'];

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Browse Services & Providers</h1>

        <div className="filter-section">
          <label>Filter by Category: </label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="services-section">
          <h2>Available Services</h2>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.service_id} className="service-card">
                <h3>{service.service_name}</h3>
                <p className="category">{service.service_category}</p>
                <p>{service.description}</p>
                <p className="price">Base Price: {formatCurrency(service.base_price)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="providers-section">
          <h2>Service Providers</h2>
          {loading ? (
            <p>Loading providers...</p>
          ) : providers.length === 0 ? (
            <div className="alert alert-info" style={{ padding: '20px', borderRadius: '10px', background: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
              <p style={{ marginBottom: '10px' }}><strong>📍 No providers found in your city</strong></p>
              <p style={{ margin: 0, color: '#555' }}>
                We only show service providers from your city (just like Swiggy!). 
                {selectedCategory && ` No ${selectedCategory} providers available in your area.`}
                <br />
                <small>Please update your city in your profile if needed.</small>
              </p>
            </div>
          ) : (
            <div className="providers-grid">
              {providers.map(provider => (
                <div key={provider.provider_id} className="provider-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3>{provider.business_name || `${provider.first_name} ${provider.last_name}`}</h3>
                      <p className="category" style={{ marginTop: '4px' }}>{provider.service_category}</p>
                    </div>
                    {provider.rating && (
                      <div className="provider-rating">
                        <span className="rating-value">
                          {parseFloat(provider.rating).toFixed(1)} ⭐
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="provider-info">
                    <p>
                      <span style={{ color: '#686b78' }}>{(provider.total_reviews || 0)} reviews</span>
                    </p>
                    <p style={{ fontWeight: 600, color: '#282c3f', marginTop: '8px' }}>
                      {formatCurrencyShort(provider.hourly_rate)}/hr
                    </p>
                    <p className="provider-location">
                      📍 {provider.city || 'N/A'}
                    </p>
                    <p className={`status status-${provider.availability_status}`} style={{ marginTop: '12px' }}>
                      {provider.availability_status === 'available' ? '✅ Available' : 
                       provider.availability_status === 'busy' ? '🔴 Busy' : 
                       '⚫ Offline'}
                    </p>
                  </div>
                  <Link to={`/user/providers/${provider.provider_id}`} className="btn btn-primary">
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseServices;

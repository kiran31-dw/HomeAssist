import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const cities = [
    'Thiruvananthapuram',
    'Neyyattinkara',
    'Attingal',
    'Varkala',
    'Kollam',
    'Punalur',
    'Karunagappally',
    'Kottarakkara',
    'Paravur',
    'Pathanamthitta',
    'Thiruvalla',
    'Chengannur',
    'Adoor',
    'Ranni',
    'Kozhencherry',
    'Alappuzha',
    'Cherthala',
    'Mavelikkara',
    'Kayamkulam',
    'Haripad',
    'Kottayam',
    'Changanassery',
    'Pala',
    'Ettumanoor',
    'Vaikom',
    'Erattupetta',
    'Idukki',
    'Thodupuzha',
    'Munnar',
    'Devikulam',
    'Peermade',
    'Kochi',
    'Ernakulam',
    'Aluva',
    'Kalamassery',
    'Tripunithura',
    'Kothamangalam',
    'North Paravur',
    'Thrissur',
    'Guruvayur',
    'Kodungallur',
    'Chalakudy',
    'Palakkad',
    'Ottapalam',
    'Shoranur',
    'Pattambi',
    'Malappuram',
    'Manjeri',
    'Tirur',
    'Kottakkal',
    'Nilambur',
    'Kozhikode',
    'Vadakara',
    'Koyilandy',
    'Kalpetta',
    'Sulthan Bathery',
    'Mananthavady',
    'Kannur',
    'Thalassery',
    'Payyannur',
    'Taliparamba',
    'Kasaragod',
    'Kanhangad',
    'Bekal'
  ];

  const [formData, setFormData] = useState({
    role: 'user',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    // Provider specific
    business_name: '',
    license_number: '',
    service_category: '',
    experience_years: '',
    hourly_rate: ''
  });
  const [error, setError] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCitySearch = (e) => {
    const value = e.target.value;
    setCitySearch(value);
    setShowCityDropdown(true);
    if (!value) {
      setFormData({ ...formData, city: '' });
    } else {
      // Auto-select if exact match found
      const exactMatch = cities.find(city => city.toLowerCase() === value.toLowerCase());
      if (exactMatch) {
        setFormData({ ...formData, city: exactMatch });
      } else {
        setFormData({ ...formData, city: '' });
      }
    }
  };

  const handleCitySelect = (city) => {
    setFormData({ ...formData, city });
    setCitySearch(city);
    setShowCityDropdown(false);
  };

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const endpoint = formData.role === 'provider'
        ? '/api/auth/register/provider'
        : '/api/auth/register/user';

      const payload = formData.role === 'provider'
        ? {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            business_name: formData.business_name,
            license_number: formData.license_number,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            service_category: formData.service_category,
            experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
            hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null
          }
        : {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code
          };

      const response = await axios.post(endpoint, payload);

      const userData = formData.role === 'provider'
        ? { ...response.data.provider, role: 'provider' }
        : { ...response.data.user, role: 'user' };

      login(response.data.token, userData);

      if (formData.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>I want to register as</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="user">User (Homeowner)</option>
              <option value="provider">Service Provider</option>
            </select>
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required={formData.role === 'provider'}
            />
          </div>
          {formData.role === 'provider' && (
            <>
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Service Category</label>
                <select name="service_category" value={formData.service_category} onChange={handleChange} required>
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
                <label>Experience (Years)</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Hourly Rate (Rs)</label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <div className="city-search-container" ref={cityDropdownRef}>
              <input
                type="text"
                name="city"
                value={citySearch}
                onChange={handleCitySearch}
                onFocus={() => setShowCityDropdown(true)}
                placeholder="Search or select city..."
                className="city-search-input"
              />
              {showCityDropdown && filteredCities.length > 0 && (
                <div className="city-dropdown">
                  {filteredCities.map((city) => (
                    <div
                      key={city}
                      className="city-option"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
              {showCityDropdown && citySearch && filteredCities.length === 0 && (
                <div className="city-dropdown">
                  <div className="city-option no-results">No cities found</div>
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>
        <p className="auth-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

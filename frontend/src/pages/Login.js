import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = formData.role === 'admin' 
        ? '/api/auth/login/admin'
        : formData.role === 'provider'
        ? '/api/auth/login/provider'
        : '/api/auth/login/user';

      const response = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password
      });

      const userData = formData.role === 'admin'
        ? { ...response.data.admin, role: 'admin' }
        : formData.role === 'provider'
        ? { ...response.data.provider, role: 'provider' }
        : { ...response.data.user, role: 'user' };

      login(response.data.token, userData);

      // Redirect based on role
      if (formData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (formData.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="user">User</option>
              <option value="provider">Service Provider</option>
              <option value="admin">Admin</option>
            </select>
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
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Login</button>
        </form>
        <p className="auth-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

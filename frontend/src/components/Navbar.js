import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <h2>AI HomeAssist</h2>
        </Link>
        <div className="navbar-menu">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          ) : (
            <>
              {user.role === 'user' && (
                <>
                  <Link to="/user/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/user/services" className="nav-link">Services</Link>
                  <Link to="/user/bookings" className="nav-link">My Bookings</Link>
                </>
              )}
              {user.role === 'provider' && (
                <Link to="/provider/dashboard" className="nav-link">Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
              )}
              <span className="nav-user">Welcome, {user.first_name || user.username}</span>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

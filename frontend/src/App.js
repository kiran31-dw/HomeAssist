import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/user/UserDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import BrowseServices from './pages/user/BrowseServices';
import ProviderProfile from './pages/user/ProviderProfile';
import MyBookings from './pages/user/MyBookings';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Routes */}
            <Route path="/user/dashboard" element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/user/services" element={
              <ProtectedRoute role="user">
                <BrowseServices />
              </ProtectedRoute>
            } />
            <Route path="/user/providers/:id" element={
              <ProtectedRoute role="user">
                <ProviderProfile />
              </ProtectedRoute>
            } />
            <Route path="/user/bookings" element={
              <ProtectedRoute role="user">
                <MyBookings />
              </ProtectedRoute>
            } />
            
            {/* Provider Routes */}
            <Route path="/provider/dashboard" element={
              <ProtectedRoute role="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

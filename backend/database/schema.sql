-- AI HomeAssist Database Schema

CREATE DATABASE IF NOT EXISTS homeassist_db;
USE homeassist_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Providers Table
CREATE TABLE IF NOT EXISTS service_providers (
    provider_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_name VARCHAR(255),
    license_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    service_category VARCHAR(100) NOT NULL,
    experience_years INT,
    hourly_rate DECIMAL(10, 2),
    availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Provider Services (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS provider_services (
    provider_service_id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    service_id INT NOT NULL,
    price DECIMAL(10, 2),
    FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_service (provider_id, service_id)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    provider_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    service_address TEXT NOT NULL,
    service_description TEXT,
    urgency_level ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    total_cost DECIMAL(10, 2),
    estimated_duration INT, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

-- Ratings & Reviews Table
CREATE TABLE IF NOT EXISTS ratings_reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    provider_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE CASCADE
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    provider_id INT,
    booking_id INT,
    complaint_type ENUM('service_quality', 'behavior', 'pricing', 'other') NOT NULL,
    complaint_text TEXT NOT NULL,
    status ENUM('pending', 'under_review', 'resolved', 'dismissed') DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL
);

-- Insert default admin (password: admin123)
-- Note: Run backend/scripts/setup-admin.js to properly hash the password
-- Or manually hash 'admin123' using bcrypt and update this value
INSERT INTO admin (username, email, password) VALUES 
('admin', 'admin@homeassist.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Insert default services (Prices in Indian Rupees)
INSERT INTO services (service_name, service_category, description, base_price) VALUES
('Electrical Repair', 'Electrical', 'General electrical repairs and installations', 500.00),
('Plumbing Service', 'Plumbing', 'Plumbing repairs and installations', 600.00),
('Painting Service', 'Painting', 'Interior and exterior painting', 400.00),
('Carpentry Work', 'Carpentry', 'Custom carpentry and woodwork', 450.00),
('HVAC Service', 'HVAC', 'Heating, ventilation, and air conditioning', 800.00),
('Appliance Repair', 'Appliance', 'Home appliance repairs', 500.00),
('Cleaning Service', 'Cleaning', 'Professional cleaning services', 300.00),
('Handyman Service', 'General', 'General handyman services', 350.00);

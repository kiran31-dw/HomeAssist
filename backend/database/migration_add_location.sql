-- Migration: Add location fields for location-based matching
-- Run this after the main schema.sql

USE homeassist_db;

-- Add latitude and longitude to users table
ALTER TABLE users 
ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER zip_code,
ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude;

-- Add latitude and longitude to service_providers table
ALTER TABLE service_providers 
ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER zip_code,
ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude;

-- Update existing records with Thiruvalla coordinates (example)
-- Thiruvalla coordinates: 9.3816° N, 76.5744° E
UPDATE users SET latitude = 9.3816, longitude = 76.5744 WHERE city = 'Thiruvalla' OR city IS NULL;
UPDATE service_providers SET latitude = 9.3816, longitude = 76.5744 WHERE city = 'Thiruvalla' OR city IS NULL;

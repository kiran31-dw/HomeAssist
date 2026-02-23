-- Migration: Update provider coordinates for all Kerala cities
-- This ensures all service providers have latitude/longitude based on their city

USE homeassist_db;

-- Update service providers with coordinates based on their city
UPDATE service_providers 
SET latitude = 9.3816, longitude = 76.5744 
WHERE city = 'Thiruvalla' AND (latitude IS NULL OR longitude IS NULL);

UPDATE service_providers 
SET latitude = 9.2647, longitude = 76.7870 
WHERE city = 'Pathanamthitta' AND (latitude IS NULL OR longitude IS NULL);

UPDATE service_providers 
SET latitude = 9.9312, longitude = 76.2673 
WHERE city = 'Kochi' AND (latitude IS NULL OR longitude IS NULL);

UPDATE service_providers 
SET latitude = 8.5241, longitude = 76.9366 
WHERE city = 'Trivandrum' AND (latitude IS NULL OR longitude IS NULL);

UPDATE service_providers 
SET latitude = 9.5916, longitude = 76.5222 
WHERE city = 'Kottayam' AND (latitude IS NULL OR longitude IS NULL);

UPDATE service_providers 
SET latitude = 9.4981, longitude = 76.3388 
WHERE city = 'Alappuzha' AND (latitude IS NULL OR longitude IS NULL);

UPDATE service_providers 
SET latitude = 10.5276, longitude = 76.2144 
WHERE city = 'Thrissur' AND (latitude IS NULL OR longitude IS NULL);

UPDATE service_providers 
SET latitude = 11.2588, longitude = 75.7804 
WHERE city = 'Calicut' AND (latitude IS NULL OR longitude IS NULL);

UPDATE service_providers 
SET latitude = 11.8745, longitude = 75.3704 
WHERE city = 'Kannur' AND (latitude IS NULL OR longitude IS NULL);

UPDATE service_providers 
SET latitude = 10.7867, longitude = 76.6548 
WHERE city = 'Palakkad' AND (latitude IS NULL OR longitude IS NULL);

-- Also update users with coordinates based on their city
UPDATE users 
SET latitude = 9.3816, longitude = 76.5744 
WHERE city = 'Thiruvalla' AND (latitude IS NULL OR longitude IS NULL);

UPDATE users 
SET latitude = 9.2647, longitude = 76.7870 
WHERE city = 'Pathanamthitta' AND (latitude IS NULL OR longitude IS NULL);

UPDATE users 
SET latitude = 9.9312, longitude = 76.2673 
WHERE city = 'Kochi' AND (latitude IS NULL OR longitude IS NULL);

UPDATE users 
SET latitude = 8.5241, longitude = 76.9366 
WHERE city = 'Trivandrum' AND (latitude IS NULL OR longitude IS NULL);

UPDATE users 
SET latitude = 9.5916, longitude = 76.5222 
WHERE city = 'Kottayam' AND (latitude IS NULL OR longitude IS NULL);

UPDATE users 
SET latitude = 9.4981, longitude = 76.3388 
WHERE city = 'Alappuzha' AND (latitude IS NULL OR longitude IS NULL);

UPDATE users 
SET latitude = 10.5276, longitude = 76.2144 
WHERE city = 'Thrissur' AND (latitude IS NULL OR longitude IS NULL);

UPDATE users 
SET latitude = 11.2588, longitude = 75.7804 
WHERE city = 'Calicut' AND (latitude IS NULL OR longitude IS NULL);

UPDATE users 
SET latitude = 11.8745, longitude = 75.3704 
WHERE city = 'Kannur' AND (latitude IS NULL OR longitude IS NULL);

UPDATE users 
SET latitude = 10.7867, longitude = 76.6548 
WHERE city = 'Palakkad' AND (latitude IS NULL OR longitude IS NULL);


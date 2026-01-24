// Debug route to check provider and user data
const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Debug endpoint to check providers
router.get('/providers-check', async (req, res) => {
    try {
        const { city } = req.query;
        
        // Get all providers
        const [allProviders] = await pool.execute(
            'SELECT provider_id, first_name, last_name, business_name, city, verification_status, service_category FROM service_providers'
        );
        
        // Get verified providers
        const [verifiedProviders] = await pool.execute(
            'SELECT provider_id, first_name, last_name, business_name, city, verification_status, service_category FROM service_providers WHERE verification_status = ?',
            ['verified']
        );
        
        // Get providers by city
        let cityProviders = [];
        if (city) {
            const [cityProv] = await pool.execute(
                'SELECT provider_id, first_name, last_name, business_name, city, verification_status, service_category FROM service_providers WHERE city = ?',
                [city]
            );
            cityProviders = cityProv;
        }
        
        // Get verified providers by city
        let verifiedCityProviders = [];
        if (city) {
            const [verifiedCity] = await pool.execute(
                'SELECT provider_id, first_name, last_name, business_name, city, verification_status, service_category FROM service_providers WHERE city = ? AND verification_status = ?',
                [city, 'verified']
            );
            verifiedCityProviders = verifiedCity;
        }
        
        res.json({
            allProviders: allProviders.length,
            verifiedProviders: verifiedProviders.length,
            cityProviders: cityProviders.length,
            verifiedCityProviders: verifiedCityProviders.length,
            city: city || 'not specified',
            details: {
                all: allProviders,
                verified: verifiedProviders,
                city: cityProviders,
                verifiedCity: verifiedCityProviders
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to check users
router.get('/users-check', async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT user_id, first_name, last_name, email, city FROM users'
        );
        
        res.json({
            totalUsers: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

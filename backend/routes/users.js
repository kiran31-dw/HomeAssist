const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [users] = await pool.execute(
            'SELECT user_id, first_name, last_name, email, phone, address, city, state, zip_code, created_at FROM users WHERE user_id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { first_name, last_name, phone, address, city, state, zip_code } = req.body;

        await pool.execute(
            `UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ? 
             WHERE user_id = ?`,
            [first_name, last_name, phone, address, city, state, zip_code, req.user.id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Browse services
router.get('/services', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT * FROM services WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND service_category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (service_name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const [services] = await pool.execute(query, params);
        res.json({ services });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get service providers (no location filtering)
router.get('/providers', async (req, res) => {
    try {
        const { category, city, min_rating } = req.query;

        let query = `SELECT provider_id, first_name, last_name, business_name, service_category, 
                            rating, total_reviews, hourly_rate, city, state, availability_status
                   FROM service_providers 
                   WHERE verification_status = 'verified' 
                   AND availability_status = 'available'`; // Only show available providers
        const params = [];

        if (category) {
            query += ' AND service_category = ?';
            params.push(category);
        }

        if (city) {
            query += ' AND city = ?';
            params.push(city);
        }

        if (min_rating) {
            query += ' AND rating >= ?';
            params.push(parseFloat(min_rating));
        }

        // Sort by: availability → rating → reviews
        query += ` ORDER BY 
            availability_status = 'available' DESC,
            rating DESC,
            total_reviews DESC`;

        const [providers] = await pool.execute(query, params);

        res.json({ providers });
    } catch (error) {
        console.error('Get providers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get provider details
router.get('/providers/:id', async (req, res) => {
    try {
        const [providers] = await pool.execute(
            `SELECT provider_id, first_name, last_name, business_name, service_category, 
                    rating, total_reviews, hourly_rate, city, state, experience_years, 
                    availability_status, created_at
             FROM service_providers 
             WHERE provider_id = ? AND verification_status = 'verified'`,
            [req.params.id]
        );

        if (providers.length === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Get reviews
        const [reviews] = await pool.execute(
            `SELECT r.review_id, r.rating, r.review_text, r.created_at, 
                    u.first_name, u.last_name
             FROM ratings_reviews r
             JOIN users u ON r.user_id = u.user_id
             WHERE r.provider_id = ?
             ORDER BY r.created_at DESC
             LIMIT 10`,
            [req.params.id]
        );

        res.json({ provider: providers[0], reviews });
    } catch (error) {
        console.error('Get provider details error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user bookings
router.get('/bookings', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [bookings] = await pool.execute(
            `SELECT b.*, s.service_name, s.service_category,
                    p.first_name as provider_first_name, p.last_name as provider_last_name,
                    p.business_name, p.phone as provider_phone
             FROM bookings b
             JOIN services s ON b.service_id = s.service_id
             JOIN service_providers p ON b.provider_id = p.provider_id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [req.user.id]
        );

        res.json({ bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

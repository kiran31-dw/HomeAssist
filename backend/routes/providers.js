const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticate, isProvider } = require('../middleware/auth');
const router = express.Router();

// Get provider profile
router.get('/profile', authenticate, isProvider, async (req, res) => {
    try {
        const [providers] = await pool.execute(
            `SELECT provider_id, first_name, last_name, email, phone, business_name, 
                    license_number, address, city, state, zip_code, service_category, 
                    experience_years, hourly_rate, availability_status, verification_status, 
                    rating, total_reviews, created_at
             FROM service_providers 
             WHERE provider_id = ?`,
            [req.user.id]
        );

        if (providers.length === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        res.json({ provider: providers[0] });
    } catch (error) {
        console.error('Get provider profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update provider profile
router.put('/profile', authenticate, isProvider, async (req, res) => {
    try {
        const { first_name, last_name, phone, business_name, address, city, state, 
                zip_code, experience_years, hourly_rate, availability_status } = req.body;

        await pool.execute(
            `UPDATE service_providers 
             SET first_name = ?, last_name = ?, phone = ?, business_name = ?, 
                 address = ?, city = ?, state = ?, zip_code = ?, experience_years = ?, 
                 hourly_rate = ?, availability_status = ?
             WHERE provider_id = ?`,
            [first_name, last_name, phone, business_name, address, city, state, 
             zip_code, experience_years, hourly_rate, availability_status, req.user.id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update provider profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get assigned jobs
router.get('/jobs', authenticate, isProvider, async (req, res) => {
    try {
        const { status } = req.query;
        let query = `SELECT b.*, s.service_name, s.service_category,
                            u.first_name as user_first_name, u.last_name as user_last_name,
                            u.phone as user_phone, u.email as user_email
                     FROM bookings b
                     JOIN services s ON b.service_id = s.service_id
                     JOIN users u ON b.user_id = u.user_id
                     WHERE b.provider_id = ?`;
        const params = [req.user.id];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

        const [jobs] = await pool.execute(query, params);
        res.json({ jobs });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get provider performance stats
router.get('/performance', authenticate, isProvider, async (req, res) => {
    try {
        const [stats] = await pool.execute(
            `SELECT 
                COUNT(*) as total_bookings,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
                AVG(rating) as avg_rating,
                COUNT(DISTINCT r.review_id) as total_reviews
             FROM bookings b
             LEFT JOIN ratings_reviews r ON b.booking_id = r.booking_id
             WHERE b.provider_id = ?`,
            [req.user.id]
        );

        const [recentReviews] = await pool.execute(
            `SELECT r.rating, r.review_text, r.created_at, u.first_name, u.last_name
             FROM ratings_reviews r
             JOIN users u ON r.user_id = u.user_id
             WHERE r.provider_id = ?
             ORDER BY r.created_at DESC
             LIMIT 5`,
            [req.user.id]
        );

        res.json({ 
            stats: stats[0], 
            recent_reviews: recentReviews 
        });
    } catch (error) {
        console.error('Get performance error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

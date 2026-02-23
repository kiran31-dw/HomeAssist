const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Submit complaint
router.post('/', authenticate, [
    body('complaint_type').isIn(['service_quality', 'behavior', 'pricing', 'other']),
    body('complaint_text').notEmpty().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { provider_id, booking_id, complaint_type, complaint_text } = req.body;

        // Verify booking belongs to user if provided
        if (booking_id) {
            const [bookings] = await pool.execute(
                'SELECT user_id FROM bookings WHERE booking_id = ?',
                [booking_id]
            );

            if (bookings.length === 0) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            if (req.user.role === 'user' && bookings[0].user_id !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const userId = req.user.role === 'user' ? req.user.id : null;

        await pool.execute(
            'INSERT INTO complaints (user_id, provider_id, booking_id, complaint_type, complaint_text) VALUES (?, ?, ?, ?, ?)',
            [userId, provider_id || null, booking_id || null, complaint_type, complaint_text]
        );

        res.status(201).json({ message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error('Submit complaint error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user complaints
router.get('/my-complaints', authenticate, async (req, res) => {
    try {
        let query = 'SELECT * FROM complaints WHERE 1=1';
        const params = [];

        if (req.user.role === 'user') {
            query += ' AND user_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'provider') {
            query += ' AND provider_id = ?';
            params.push(req.user.id);
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Filter by booking_id if provided
        if (req.query.booking_id) {
            query += ' AND booking_id = ?';
            params.push(req.query.booking_id);
        }

        query += ' ORDER BY created_at DESC';

        const [complaints] = await pool.execute(query, params);
        res.json({ complaints });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get complaints by booking ID
router.get('/booking/:bookingId', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Verify booking belongs to user
        const [bookings] = await pool.execute(
            'SELECT user_id FROM bookings WHERE booking_id = ?',
            [req.params.bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (bookings[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [complaints] = await pool.execute(
            'SELECT * FROM complaints WHERE booking_id = ? AND user_id = ? ORDER BY created_at DESC',
            [req.params.bookingId, req.user.id]
        );

        res.json({ complaints });
    } catch (error) {
        console.error('Get complaints by booking error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

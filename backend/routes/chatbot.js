const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { processChatbotMessage } = require('../utils/aiChatbot');
const router = express.Router();

// Chatbot endpoint
router.post('/message', authenticate, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Message is required' });
        }

        const userId = req.user.role === 'user' ? req.user.id : null;
        const response = await processChatbotMessage(message, userId);

        res.json(response);
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create booking from chatbot suggestion
router.post('/book', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only users can create bookings' });
        }

        const { provider_id, service_id, booking_date, booking_time, service_address, 
                service_description, urgency_level, total_cost } = req.body;

        // Verify provider exists, is verified, and is available
        const [providers] = await pool.execute(
            'SELECT provider_id, verification_status, availability_status FROM service_providers WHERE provider_id = ?',
            [provider_id]
        );

        if (providers.length === 0 || providers[0].verification_status !== 'verified') {
            return res.status(400).json({ message: 'Invalid or unverified provider' });
        }

        // Check if provider is available
        if (providers[0].availability_status !== 'available') {
            return res.status(400).json({ 
                message: 'Provider is currently busy with another job. Please try another provider.' 
            });
        }

        // Check if provider has any active jobs
        const [activeJobs] = await pool.execute(
            `SELECT booking_id FROM bookings 
             WHERE provider_id = ? 
             AND status = 'in_progress' 
             AND booking_date >= CURDATE()`,
            [provider_id]
        );

        if (activeJobs.length > 0) {
            return res.status(400).json({ 
                message: 'Provider is currently working on another job. Please select a different provider.' 
            });
        }

        // Check for overlapping bookings
        if (booking_date && booking_time) {
            const [overlapping] = await pool.execute(
                `SELECT booking_id FROM bookings 
                 WHERE provider_id = ? 
                 AND booking_date = ? 
                 AND booking_time = ? 
                 AND status IN ('pending', 'confirmed', 'in_progress')`,
                [provider_id, booking_date, booking_time]
            );

            if (overlapping.length > 0) {
                return res.status(400).json({ 
                    message: 'Provider already has a booking at this time. Please select a different time.' 
                });
            }
        }

        // Create booking
        const [result] = await pool.execute(
            `INSERT INTO bookings 
             (user_id, provider_id, service_id, booking_date, booking_time, service_address, 
              service_description, urgency_level, total_cost, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [req.user.id, provider_id, service_id, booking_date, booking_time, service_address,
             service_description || null, urgency_level || 'medium', total_cost || null]
        );

        const [booking] = await pool.execute(
            `SELECT b.*, s.service_name, p.first_name as provider_first_name, 
                    p.last_name as provider_last_name, p.business_name
             FROM bookings b
             JOIN services s ON b.service_id = s.service_id
             JOIN service_providers p ON b.provider_id = p.provider_id
             WHERE b.booking_id = ?`,
            [result.insertId]
        );

        res.status(201).json({ 
            message: 'Booking created successfully via chatbot', 
            booking: booking[0] 
        });
    } catch (error) {
        console.error('Chatbot booking error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

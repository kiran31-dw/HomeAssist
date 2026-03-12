const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Create booking
router.post('/', authenticate, [
    body('provider_id').isInt(),
    body('service_id').isInt(),
    body('booking_date').isISO8601().toDate(),
    body('booking_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    body('service_address').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only users can create bookings' });
        }

        const { provider_id, service_id, booking_date, booking_time, service_address, 
                service_description, urgency_level, total_cost, estimated_duration } = req.body;

        // Validate booking_time format
        if (!booking_time || !booking_time.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)) {
            return res.status(400).json({ message: 'Invalid booking time format. Please use HH:MM format.' });
        }

        // Log the booking time being stored (for debugging)
        console.log('Storing booking with time:', booking_time, 'for date:', booking_date);

        // Verify provider exists, is verified, and is available
        const [providers] = await pool.execute(
            'SELECT provider_id, verification_status, availability_status FROM service_providers WHERE provider_id = ?',
            [provider_id]
        );

        if (providers.length === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        if (providers[0].verification_status !== 'verified') {
            return res.status(400).json({ message: 'Provider is not verified' });
        }

        // Check if provider is available
        if (providers[0].availability_status !== 'available') {
            return res.status(400).json({ 
                message: 'Provider is currently busy with another job. Please try another provider or book later.' 
            });
        }

        // Check if provider has any active jobs (in_progress) - prevent double booking
        const [activeJobs] = await pool.execute(
            `SELECT booking_id FROM bookings 
             WHERE provider_id = ? 
             AND status = 'in_progress' 
             AND booking_date >= CURDATE()`,
            [provider_id]
        );

        if (activeJobs.length > 0) {
            return res.status(400).json({ 
                message: 'Provider is currently working on another job. Please select a different time or provider.' 
            });
        }

        // Check for overlapping bookings (same date and time)
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
                message: 'Provider already has a booking at this time. Please select a different time slot.' 
            });
        }

        // Create booking
        const [result] = await pool.execute(
            `INSERT INTO bookings 
             (user_id, provider_id, service_id, booking_date, booking_time, service_address, 
              service_description, urgency_level, total_cost, estimated_duration, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [req.user.id, provider_id, service_id, booking_date, booking_time, service_address,
             service_description || null, urgency_level || 'medium', total_cost || null, estimated_duration || null]
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

        res.status(201).json({ message: 'Booking created successfully', booking: booking[0] });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update booking status
router.put('/:id/status', authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Check if user has permission
        const [bookings] = await pool.execute(
            'SELECT user_id, provider_id FROM bookings WHERE booking_id = ?',
            [req.params.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookings[0];
        const canUpdate = (req.user.role === 'user' && booking.user_id === req.user.id) ||
                         (req.user.role === 'provider' && booking.provider_id === req.user.id);

        if (!canUpdate) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Update booking status
        await pool.execute(
            'UPDATE bookings SET status = ? WHERE booking_id = ?',
            [status, req.params.id]
        );

        // Automatically manage provider availability based on job status
        if (status === 'in_progress') {
            // Set provider to busy when they start a job
            await pool.execute(
                'UPDATE service_providers SET availability_status = ? WHERE provider_id = ?',
                ['busy', booking.provider_id]
            );
        } else if (status === 'completed' || status === 'cancelled') {
            // Check if provider has any other active jobs
            const [activeJobs] = await pool.execute(
                `SELECT COUNT(*) as count FROM bookings 
                 WHERE provider_id = ? 
                 AND status = 'in_progress' 
                 AND booking_id != ?`,
                [booking.provider_id, req.params.id]
            );

            // If no other active jobs, set provider back to available
            if (activeJobs[0].count === 0) {
                await pool.execute(
                    'UPDATE service_providers SET availability_status = ? WHERE provider_id = ?',
                    ['available', booking.provider_id]
                );
            }
        }

        res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get booking details
router.get('/:id', authenticate, async (req, res) => {
    try {
        const [bookings] = await pool.execute(
            `SELECT b.*, s.service_name, s.service_category,
                    p.first_name as provider_first_name, p.last_name as provider_last_name,
                    p.business_name, p.phone as provider_phone, p.email as provider_email,
                    u.first_name as user_first_name, u.last_name as user_last_name,
                    u.phone as user_phone, u.email as user_email
             FROM bookings b
             JOIN services s ON b.service_id = s.service_id
             JOIN service_providers p ON b.provider_id = p.provider_id
             JOIN users u ON b.user_id = u.user_id
             WHERE b.booking_id = ?`,
            [req.params.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookings[0];

        // Check access permission
        const hasAccess = (req.user.role === 'user' && booking.user_id === req.user.id) ||
                         (req.user.role === 'provider' && booking.provider_id === req.user.id) ||
                         req.user.role === 'admin';

        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ booking });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Submit review
router.post('/:id/review', authenticate, [
    body('rating').isInt({ min: 1, max: 5 }),
    body('review_text').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only users can submit reviews' });
        }

        const { rating, review_text } = req.body;

        // Check if booking exists and belongs to user
        const [bookings] = await pool.execute(
            'SELECT user_id, provider_id, status FROM bookings WHERE booking_id = ?',
            [req.params.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookings[0];

        if (booking.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        // Check if review already exists
        const [existing] = await pool.execute(
            'SELECT review_id FROM ratings_reviews WHERE booking_id = ?',
            [req.params.id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Review already submitted for this booking' });
        }

        // Create review
        await pool.execute(
            'INSERT INTO ratings_reviews (booking_id, user_id, provider_id, rating, review_text) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, req.user.id, booking.provider_id, rating, review_text || null]
        );

        // Update provider rating
        const [stats] = await pool.execute(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews 
             FROM ratings_reviews WHERE provider_id = ?`,
            [booking.provider_id]
        );

        await pool.execute(
            'UPDATE service_providers SET rating = ?, total_reviews = ? WHERE provider_id = ?',
            [parseFloat(stats[0].avg_rating).toFixed(2), stats[0].total_reviews, booking.provider_id]
        );

        res.json({ message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

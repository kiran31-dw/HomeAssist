const express = require('express');
const pool = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all providers (pending verification)
router.get('/providers', authenticate, isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let query = `SELECT provider_id, first_name, last_name, email, phone, business_name, 
                            service_category, verification_status, created_at
                     FROM service_providers`;
        const params = [];

        if (status) {
            query += ' WHERE verification_status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [providers] = await pool.execute(query, params);
        res.json({ providers });
    } catch (error) {
        console.error('Get providers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify provider
router.put('/providers/:id/verify', authenticate, isAdmin, async (req, res) => {
    try {
        const { verification_status } = req.body;

        if (!['verified', 'rejected'].includes(verification_status)) {
            return res.status(400).json({ message: 'Invalid verification status' });
        }

        await pool.execute(
            'UPDATE service_providers SET verification_status = ? WHERE provider_id = ?',
            [verification_status, req.params.id]
        );

        res.json({ message: `Provider ${verification_status} successfully` });
    } catch (error) {
        console.error('Verify provider error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all bookings
router.get('/bookings', authenticate, isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let query = `SELECT b.*, s.service_name, 
                            u.first_name as user_first_name, u.last_name as user_last_name,
                            p.first_name as provider_first_name, p.last_name as provider_last_name,
                            p.business_name
                     FROM bookings b
                     JOIN services s ON b.service_id = s.service_id
                     JOIN users u ON b.user_id = u.user_id
                     JOIN service_providers p ON b.provider_id = p.provider_id`;
        const params = [];

        if (status) {
            query += ' WHERE b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.created_at DESC';

        const [bookings] = await pool.execute(query, params);
        res.json({ bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all complaints
router.get('/complaints', authenticate, isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let query = `SELECT c.*, 
                            u.first_name as user_first_name, u.last_name as user_last_name,
                            p.first_name as provider_first_name, p.last_name as provider_last_name
                     FROM complaints c
                     LEFT JOIN users u ON c.user_id = u.user_id
                     LEFT JOIN service_providers p ON c.provider_id = p.provider_id`;
        const params = [];

        if (status) {
            query += ' WHERE c.status = ?';
            params.push(status);
        }

        query += ' ORDER BY c.created_at DESC';

        const [complaints] = await pool.execute(query, params);
        res.json({ complaints });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update complaint status
router.put('/complaints/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { status, admin_response } = req.body;

        if (!['pending', 'under_review', 'resolved', 'dismissed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await pool.execute(
            'UPDATE complaints SET status = ?, admin_response = ? WHERE complaint_id = ?',
            [status, admin_response || null, req.params.id]
        );

        res.json({ message: 'Complaint updated successfully' });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get analytics
router.get('/analytics', authenticate, isAdmin, async (req, res) => {
    try {
        // Total users
        const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
        
        // Total providers
        const [providerCount] = await pool.execute('SELECT COUNT(*) as count FROM service_providers');
        
        // Total bookings
        const [bookingCount] = await pool.execute('SELECT COUNT(*) as count FROM bookings');
        
        // Bookings by status
        const [bookingsByStatus] = await pool.execute(
            'SELECT status, COUNT(*) as count FROM bookings GROUP BY status'
        );
        
        // Bookings by service category
        const [bookingsByCategory] = await pool.execute(
            `SELECT s.service_category, COUNT(*) as count 
             FROM bookings b
             JOIN services s ON b.service_id = s.service_id
             GROUP BY s.service_category`
        );
        
        // Revenue (completed bookings)
        const [revenue] = await pool.execute(
            `SELECT SUM(total_cost) as total_revenue 
             FROM bookings 
             WHERE status = 'completed' AND total_cost IS NOT NULL`
        );

        res.json({
            total_users: userCount[0].count,
            total_providers: providerCount[0].count,
            total_bookings: bookingCount[0].count,
            bookings_by_status: bookingsByStatus,
            bookings_by_category: bookingsByCategory,
            total_revenue: revenue[0].total_revenue || 0
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT user_id, first_name, last_name, email, phone, city, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Manage services
router.get('/services', authenticate, isAdmin, async (req, res) => {
    try {
        const [services] = await pool.execute('SELECT * FROM services ORDER BY service_category');
        res.json({ services });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/services', authenticate, isAdmin, async (req, res) => {
    try {
        const { service_name, service_category, description, base_price } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO services (service_name, service_category, description, base_price) VALUES (?, ?, ?, ?)',
            [service_name, service_category, description, base_price]
        );

        res.status(201).json({ message: 'Service created successfully', service_id: result.insertId });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

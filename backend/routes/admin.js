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

// Update booking admin message
router.put('/bookings/:id/message', authenticate, isAdmin, async (req, res) => {
    try {
        const { admin_message } = req.body;

        if (!admin_message) {
            return res.status(400).json({ message: 'Admin message is required' });
        }

        // Check if booking exists
        const [bookings] = await pool.execute(
            'SELECT booking_id FROM bookings WHERE booking_id = ?',
            [req.params.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await pool.execute(
            'UPDATE bookings SET admin_message = ? WHERE booking_id = ?',
            [admin_message, req.params.id]
        );

        res.json({ message: 'Admin message added successfully' });
    } catch (error) {
        console.error('Update admin message error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all complaints
router.get('/complaints', authenticate, isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let query = `SELECT c.*, 
                            u.first_name as user_first_name, u.last_name as user_last_name,
                            u.email as user_email, u.phone as user_phone, u.city as user_city,
                            p.first_name as provider_first_name, p.last_name as provider_last_name,
                            p.business_name as provider_business_name, p.email as provider_email,
                            p.phone as provider_phone, p.service_category as provider_category,
                            b.booking_date, b.booking_time, b.service_address, b.total_cost,
                            s.service_name, s.service_category as service_category
                     FROM complaints c
                     LEFT JOIN users u ON c.user_id = u.user_id
                     LEFT JOIN service_providers p ON c.provider_id = p.provider_id
                     LEFT JOIN bookings b ON c.booking_id = b.booking_id
                     LEFT JOIN services s ON b.service_id = s.service_id`;
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

// Get admin revenue
router.get('/revenue', authenticate, isAdmin, async (req, res) => {
    try {
        // Total platform revenue
        const [totalRevenue] = await pool.execute('SELECT SUM(amount) as total FROM admin_revenue');
        
        // Total paid bookings
        const [totalPaidBookings] = await pool.execute(`SELECT COUNT(*) as count FROM bookings WHERE payment_status = 'paid'`);

        // Average commission
        const [avgCommission] = await pool.execute('SELECT AVG(amount) as average FROM admin_revenue');

        // Recent transactions: paid + cancelled bookings
        const [recentTransactions] = await pool.execute(
            `(SELECT p.transaction_id, p.amount_paid, p.platform_commission, p.created_at as paid_at,
                    u.first_name as user_first_name, u.last_name as user_last_name,
                    sp.first_name as provider_first_name, sp.last_name as provider_last_name, sp.business_name as provider_business_name,
                    s.service_name, 'paid' as txn_status, b.rejection_reason
             FROM payments p
             JOIN users u ON p.user_id = u.user_id
             JOIN service_providers sp ON p.provider_id = sp.provider_id
             JOIN bookings b ON p.booking_id = b.booking_id
             JOIN services s ON b.service_id = s.service_id)
            UNION ALL
            (SELECT NULL as transaction_id, b.total_cost as amount_paid, NULL as platform_commission, b.updated_at as paid_at,
                    u.first_name as user_first_name, u.last_name as user_last_name,
                    sp.first_name as provider_first_name, sp.last_name as provider_last_name, sp.business_name as provider_business_name,
                    s.service_name, 'cancelled' as txn_status, b.rejection_reason
             FROM bookings b
             JOIN users u ON b.user_id = u.user_id
             JOIN service_providers sp ON b.provider_id = sp.provider_id
             JOIN services s ON b.service_id = s.service_id
             WHERE b.status = 'cancelled')
            ORDER BY paid_at DESC LIMIT 20`
        );

        // Monthly revenue
        const [monthlyRevenue] = await pool.execute(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as total
             FROM admin_revenue
             GROUP BY month
             ORDER BY month DESC LIMIT 12`
        );

        res.json({
            total_revenue: totalRevenue[0].total || 0,
            total_paid_bookings: totalPaidBookings[0].count || 0,
            average_commission: avgCommission[0].average || 0,
            recent_transactions: recentTransactions,
            monthly_revenue: monthlyRevenue
        });

    } catch (error) {
        console.error('Get revenue error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

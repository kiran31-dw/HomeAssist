const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Initiate payment setup
router.post('/initiate', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only users can make payments' });
        }

        const { booking_id, card_number, card_expiry, card_cvv, card_holder_name } = req.body;

        if (!booking_id || !card_number || !card_expiry || !card_cvv || !card_holder_name) {
            return res.status(400).json({ message: 'Missing required payment details' });
        }

        // Validate basic card formats
        const cleanCard = card_number.replace(/\s+/g, '');
        if (!/^\d{16}$/.test(cleanCard)) {
            return res.status(400).json({ message: 'Invalid card number format' });
        }
        if (!/^\d{3}$/.test(card_cvv)) {
            return res.status(400).json({ message: 'Invalid CVV format' });
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card_expiry)) {
            return res.status(400).json({ message: 'Invalid expiry date format' });
        }

        const card_type = cleanCard.startsWith('4') ? 'Visa' : (cleanCard.startsWith('5') ? 'Mastercard' : 'Other');
        const card_last4 = cleanCard.slice(-4);

        // Verify booking exists and belongs to user
        const [bookings] = await pool.execute(
            `SELECT b.*, p.hourly_rate 
             FROM bookings b
             JOIN service_providers p ON b.provider_id = p.provider_id
             WHERE b.booking_id = ? AND b.user_id = ? AND b.status = 'pending_payment'`,
            [booking_id, req.user.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Pending booking not found or unauthorized' });
        }

        const booking = bookings[0];
        
        // Calculate amounts (1 hour based on price_per_hour/hourly_rate)
        const amount = parseFloat(booking.hourly_rate);
        if (isNaN(amount) || amount <= 0) {
             return res.status(400).json({ message: 'Invalid provider rate' });
        }

        const commission_rate = 10.00;
        const commission = amount * (commission_rate / 100);
        const provider_earning = amount - commission;

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate transaction ID
        const transaction_id = 'TXN' + Date.now() + Math.floor(1000 + Math.random() * 9000);

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert into payments
            const [paymentResult] = await connection.execute(
                `INSERT INTO payments 
                 (booking_id, user_id, provider_id, amount_paid, platform_commission, provider_earning, 
                  commission_rate, payment_status, card_last4, card_type, transaction_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)`,
                [booking_id, req.user.id, booking.provider_id, amount, commission, provider_earning, 
                 commission_rate, card_last4, card_type, transaction_id]
            );

            const payment_id = paymentResult.insertId;

            // Insert into admin_revenue
            await connection.execute(
                `INSERT INTO admin_revenue (payment_id, booking_id, amount) VALUES (?, ?, ?)`,
                [payment_id, booking_id, commission]
            );

            // Update booking status
            await connection.execute(
                `UPDATE bookings 
                 SET status = 'pending', payment_status = 'paid', payment_id = ? 
                 WHERE booking_id = ?`,
                [payment_id, booking_id]
            );

            await connection.commit();

            res.json({
                success: true,
                transaction_id,
                amount_paid: amount,
                commission,
                message: 'Payment processed successfully'
            });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ message: 'Server error during payment processing', error: error.message });
    }
});

// Get payment details
router.get('/booking/:booking_id', authenticate, async (req, res) => {
    try {
        const [payments] = await pool.execute(
            `SELECT p.*, b.status as booking_status
             FROM payments p
             JOIN bookings b ON p.booking_id = b.booking_id
             WHERE p.booking_id = ?`,
            [req.params.booking_id]
        );

        if (payments.length === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        
        const payment = payments[0];
        
        // Check access permission
        const hasAccess = (req.user.role === 'user' && payment.user_id === req.user.id) ||
                          (req.user.role === 'provider' && payment.provider_id === req.user.id) ||
                          req.user.role === 'admin';

        if (!hasAccess) {
             return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ payment });
    } catch (error) {
        console.error('Get payment details error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const router = express.Router();

// User Registration
router.post('/register/user', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('first_name').notEmpty().trim(),
    body('last_name').notEmpty().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { first_name, last_name, email, password, phone, address, city, state, zip_code } = req.body;

        // Check if user exists
        const [existing] = await pool.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.execute(
            `INSERT INTO users (first_name, last_name, email, password, phone, address, city, state, zip_code) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword, phone || null, address || null, city || null, state || null, zip_code || null]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, role: 'user', email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: result.insertId, email, first_name, last_name }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Provider Registration
router.post('/register/provider', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('first_name').notEmpty().trim(),
    body('last_name').notEmpty().trim(),
    body('phone').notEmpty(),
    body('service_category').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { first_name, last_name, email, password, phone, business_name, 
                license_number, address, city, state, zip_code, service_category, 
                experience_years, hourly_rate } = req.body;

        // Check if provider exists
        const [existing] = await pool.execute(
            'SELECT provider_id FROM service_providers WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Provider already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert provider
        const [result] = await pool.execute(
            `INSERT INTO service_providers 
             (first_name, last_name, email, password, phone, business_name, license_number, 
              address, city, state, zip_code, service_category, experience_years, hourly_rate) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword, phone, business_name || null, 
             license_number || null, address || null, city || null, state || null, 
             zip_code || null, service_category, experience_years || null, hourly_rate || null]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, role: 'provider', email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            message: 'Provider registered successfully. Awaiting verification.',
            token,
            provider: { id: result.insertId, email, first_name, last_name }
        });
    } catch (error) {
        console.error('Provider registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User Login
router.post('/login/user', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const [users] = await pool.execute(
            'SELECT user_id, email, password, first_name, last_name FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.user_id, role: 'user', email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.user_id, email, first_name: user.first_name, last_name: user.last_name }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Provider Login
router.post('/login/provider', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const [providers] = await pool.execute(
            'SELECT provider_id, email, password, first_name, last_name, verification_status FROM service_providers WHERE email = ?',
            [email]
        );

        if (providers.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const provider = providers[0];
        const isMatch = await bcrypt.compare(password, provider.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: provider.provider_id, role: 'provider', email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            provider: {
                id: provider.provider_id,
                email,
                first_name: provider.first_name,
                last_name: provider.last_name,
                verification_status: provider.verification_status
            }
        });
    } catch (error) {
        console.error('Provider login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin Login
router.post('/login/admin', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const [admins] = await pool.execute(
            'SELECT admin_id, email, password, username FROM admin WHERE email = ?',
            [email]
        );

        if (admins.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.admin_id, role: 'admin', email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            message: 'Admin login successful',
            token,
            admin: { id: admin.admin_id, email, username: admin.username }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

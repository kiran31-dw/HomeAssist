const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Global error handlers to prevent silent crashes and log root causes
process.on('uncaughtException', (err) => {
    console.error('FATAL: Uncaught Exception:', err);
    // process.exit(1); // Optional: keep process alive or exit after logging
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL: Unhandled Promise Rejection at:', promise, 'reason:', reason);
});


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/payments', require('./routes/payments')); // Dummy payment integration
app.use('/api/debug', require('./routes/debug')); // Debug routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'AI HomeAssist API is running', status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDB() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'homeassist_db'
    });

    try {
        console.log("Fixing payments table ENUM...");
        await pool.execute("ALTER TABLE payments MODIFY COLUMN payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending'");
        console.log("Payments ENUM fixed!");
        
        console.log("Fixing bookings table ENUM...");
        await pool.execute("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'pending_payment') DEFAULT 'pending'");
        console.log("Bookings ENUM fixed!");
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await pool.end();
    }
}
fixDB();

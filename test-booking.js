const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/Main Project Kiran/HomeAssist Final/HomeAssist/backend/.env' });

async function checkDB() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'homeassist_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("Checking bookings table...");
        const [bookings] = await pool.execute('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5');
        console.log("Recent Bookings:", bookings);
        
        const [users] = await pool.execute('SELECT user_id, first_name FROM users LIMIT 1');
        const [providers] = await pool.execute('SELECT provider_id, service_category FROM service_providers WHERE verification_status = "verified" LIMIT 1');
        const [services] = await pool.execute('SELECT service_id FROM services LIMIT 1');
        
        if (users.length && providers.length && services.length) {
            const userId = users[0].user_id;
            const providerId = providers[0].provider_id;
            const serviceId = services[0].service_id;
            
            console.log("\nSimulating Chatbot Booking...");
            try {
                const [result] = await pool.execute(
                    `INSERT INTO bookings 
                     (user_id, provider_id, service_id, booking_date, booking_time, service_address, 
                      service_description, urgency_level, total_cost, status, payment_status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', 'unpaid')`,
                    [userId, providerId, serviceId, '2026-03-24', '10:00:00', 'Test Address', null, 'medium', 500]
                );
                console.log("Insert success! ID:", result.insertId);
            } catch (err) {
                console.error("Insert failed:", err);
            }
        }
        
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await pool.end();
    }
}
checkDB();

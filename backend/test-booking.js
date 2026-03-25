const mysql = require('mysql2/promise');
require('dotenv').config();

async function testPayment(booking_id, user_id, provider_id, hourly_rate) {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'homeassist_db'
    });

    try {
        const amount = parseFloat(hourly_rate || 500);
        const commission_rate = 10.00;
        const commission = amount * (commission_rate / 100);
        const provider_earning = amount - commission;
        const transaction_id = 'TXN' + Date.now();

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            console.log("Inserting payment...");
            const [paymentResult] = await connection.execute(
                `INSERT INTO payments 
                 (booking_id, user_id, provider_id, amount_paid, platform_commission, provider_earning, 
                  commission_rate, payment_status, card_last4, card_type, transaction_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)`,
                [booking_id, user_id, provider_id, amount, commission, provider_earning, 
                 commission_rate, '1234', 'Visa', transaction_id]
            );

            const payment_id = paymentResult.insertId;
            console.log("Payment ID:", payment_id);

            console.log("Inserting admin_revenue...");
            await connection.execute(
                `INSERT INTO admin_revenue (payment_id, booking_id, amount) VALUES (?, ?, ?)`,
                [payment_id, booking_id, commission]
            );

            console.log("Updating bookings...");
            await connection.execute(
                `UPDATE bookings 
                 SET status = 'pending', payment_status = 'paid', payment_id = ? 
                 WHERE booking_id = ?`,
                [payment_id, booking_id]
            );

            await connection.commit();
            console.log("Transaction Committed!");
            
            const [finalBooking] = await connection.execute('SELECT * FROM bookings WHERE booking_id = ?', [booking_id]);
            console.log("Final Booking State:", finalBooking[0]);
        } catch (err) {
            await connection.rollback();
            console.error("Transaction rolled back:", err.message);
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await pool.end();
    }
}
testPayment(40, 15, 12, 500); // Using the IDs from previous step run results. Wait, I didn't see the User/Provider IDs, I'll just query them.

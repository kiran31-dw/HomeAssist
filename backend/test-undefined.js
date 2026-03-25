const mysql = require('mysql2/promise');
require('dotenv').config();

async function testUndefined() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'homeassist_db'
    });

    try {
        await pool.execute('SELECT ? AS test', [undefined]);
        console.log("Success with undefined!");
    } catch (err) {
        console.error("Error with undefined:", err.message);
    } finally {
        await pool.end();
    }
}
testUndefined();

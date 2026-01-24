const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAdmin() {
    try {
        // Hash the default admin password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Connect to database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'homeassist_db'
        });

        // Check if admin exists
        const [existing] = await connection.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            ['admin@homeassist.com']
        );

        if (existing.length > 0) {
            // Update existing admin
            await connection.execute(
                'UPDATE admin SET password = ? WHERE email = ?',
                [hashedPassword, 'admin@homeassist.com']
            );
            console.log('Admin password updated successfully');
        } else {
            // Insert new admin
            await connection.execute(
                'INSERT INTO admin (username, email, password) VALUES (?, ?, ?)',
                ['admin', 'admin@homeassist.com', hashedPassword]
            );
            console.log('Admin created successfully');
        }

        await connection.end();
        console.log('Setup complete!');
        console.log('Admin credentials:');
        console.log('Email: admin@homeassist.com');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Setup error:', error);
        process.exit(1);
    }
}

setupAdmin();

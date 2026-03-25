const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'homeassist_db',
        multipleStatements: true
    });

    try {
        console.log('Connected to database. Running migration...');
        
        const sqlPath = path.join(__dirname, '..', '..', 'backend', 'database', 'migration_payment.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split statements by semicolon and filter out empty ones
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

        for (const statement of statements) {
            console.log('Executing:', statement.trim().substring(0, 50) + '...');
            await connection.query(statement);
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Error running migration:', error);
    } finally {
        await connection.end();
    }
}

runMigration();

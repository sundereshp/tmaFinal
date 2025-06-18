const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to MySQL database');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error connecting to MySQL database:', error);
        return false;
    }
}



module.exports = {
    pool,
    testConnection,
};

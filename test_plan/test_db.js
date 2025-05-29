console.log('Starting DB connection test...');
const pool = require('../lib/db.js');

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('Database connected! Test query result:', rows[0].solution);
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

testConnection();

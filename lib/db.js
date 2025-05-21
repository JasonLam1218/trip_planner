// lib/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',           // or your DB host
  user: 'root',     // your MySQL username
  password: 'Lam@1218', // your MySQL password
  database: 'trip_planner',   // e.g., 'trip_planner'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

// api/users.js

const bcrypt = require('bcryptjs');
const pool = require('../lib/db');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    console.log('[DEBUG] Method not allowed:', req.method);
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    // Parse JSON body
    const { username, email, password } = req.body;
    console.log('[DEBUG] Received data:', { username, email, password: password ? '***' : undefined });

    // Basic validation
    if (!username || !email || !password) {
      console.log('[DEBUG] Missing required fields');
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      console.log('[DEBUG] Invalid email format:', email);
      res.status(400).json({ message: 'Invalid email address.' });
      return;
    }

    if (password.length < 8) {
      console.log('[DEBUG] Password too short');
      res.status(400).json({ message: 'Password must be at least 8 characters.' });
      return;
    }

    // Check for existing user (by username or email)
    const [users] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    console.log('[DEBUG] Existing users found:', users.length);

    if (users.length > 0) {
      // Distinguish between username and email for a more specific message if you want:
      const duplicateEmail = users.some(user => user.email === email);
      const duplicateUsername = users.some(user => user.username === username);
      let message = 'Username or email already exists.';
      if (duplicateEmail && !duplicateUsername) message = 'Email already exists.';
      if (duplicateUsername && !duplicateEmail) message = 'Username already exists.';
      if (duplicateUsername && duplicateEmail) message = 'Username and email already exist.';
      console.log('[DEBUG] Duplicate:', message);
      res.status(400).json({ message });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[DEBUG] Password hashed');

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    console.log('[DEBUG] User inserted with ID:', result.insertId);

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('[ERROR] Exception in /api/users.js:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

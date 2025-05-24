// api/signup.js

const bcrypt = require('bcryptjs');
const pool = require('../lib/db');

module.exports = async function (req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({ message: 'All fields are required.' });
            return;
        }

        // Check if username or email already exists
        const [users] = await pool.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (users.length > 0) {
            res.status(409).json({ message: 'Username or email already exists.' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await pool.query(
            'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'Signup successful.' });
    } catch (err) {
        console.error('[ERROR] Exception in /api/signup.js:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

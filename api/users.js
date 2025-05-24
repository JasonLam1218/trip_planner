// api/users.js

const bcrypt = require('bcryptjs');
const pool = require('../lib/db');

module.exports = async function (req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    try {
        // Parse JSON body
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required.' });
            return;
        }

        // Find user by username from the database
        const [users] = await pool.query(
            'SELECT id, username, password FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            res.status(404).json({ message: 'user has not registered yet' });
            return;
        }

        const user = users[0];

        // Compare password with hash in database
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            res.status(401).json({ message: 'Username or password is incorrect.' });
            return;
        }

        // Success
        res.status(200).json({ message: 'Login successful.' });
    } catch (err) {
        console.error('[ERROR] Exception in /api/users.js:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

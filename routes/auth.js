const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const util = require('util');

const query = util.promisify(db.query).bind(db); // Promisify DB

// GET Register
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

// POST Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existing = await query('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            return res.render('auth/register', { error: 'User already exists. Try logging in.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        console.log('User registered, redirecting...');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('auth/register', { error: 'Registration failed' });
    }
});

// GET Login
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

// POST Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const results = await query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.render('auth/login', { error: 'User not found' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render('auth/login', { error: 'Incorrect password' });
        }

        req.session.user = user;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('auth/login', { error: 'Login failed' });
    }
});
// POST Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('DB Error:', err);
                return res.render('auth/register', { error: 'Server error' });
            }

            if (results.length > 0) {
                console.log('User already exists');
                return res.render('auth/register', { error: 'User already exists. Try logging in.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
            [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Insert Error:', err);
                    return res.render('auth/register', { error: 'Failed to register user' });
                }

                console.log('✅ Registered successfully');
                // ✅ Redirect to login page after successful registration
                res.redirect('/login');
            });
        });
    } catch (err) {
        console.error('Unexpected Error:', err);
        res.render('auth/register', { error: 'Something went wrong' });
    }
});


module.exports = router;


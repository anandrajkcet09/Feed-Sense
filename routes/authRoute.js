const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Lightweight in-memory rate limiter for login ──────────────────────────────
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;
const loginAttempts = new Map();

const loginRateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const record = loginAttempts.get(ip);

    if (record) {
        if (now - record.firstAttempt > WINDOW_MS) {
            loginAttempts.delete(ip);
        } else if (record.count >= MAX_ATTEMPTS) {
            const retryAfter = Math.ceil((WINDOW_MS - (now - record.firstAttempt)) / 1000 / 60);
            return res.status(429).json({
                message: `Too many login attempts. Please try again in ${retryAfter} minute(s).`
            });
        }
    }

    if (loginAttempts.has(ip)) {
        loginAttempts.get(ip).count++;
    } else {
        loginAttempts.set(ip, { count: 1, firstAttempt: now });
    }

    next();
};

setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of loginAttempts.entries()) {
        if (now - record.firstAttempt > WINDOW_MS) {
            loginAttempts.delete(ip);
        }
    }
}, WINDOW_MS);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Register ───────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
            return res.status(400).json({ message: 'Full name must be at least 2 characters.' });
        }
        if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// ── Login ──────────────────────────────────────────────────────────────────────
router.post('/login', loginRateLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email is required.' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required.' });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const ip = req.ip || req.connection.remoteAddress;
        loginAttempts.delete(ip);

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// ── Verify Token ───────────────────────────────────────────────────────────────
router.get('/verify', (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, user: verified });
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
});

module.exports = router;

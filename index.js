const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// ── Fail fast on missing critical env vars ────────────────────────────────────
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set. Server will not start.');
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI is not set. Server will not start.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Restrict CORS to the frontend origin only
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(url => url.trim());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman) in dev
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// ── Database Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('FATAL: MongoDB connection failed:', err.message);
        process.exit(1);
    });

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'FeedSense Backend', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/feedback', require('./routes/feedbackRoute'));

// ── Error Handling ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});

// ── Start Server ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || process.env.RUN_LOCAL === 'true') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

module.exports = app;

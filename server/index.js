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

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());

// Restrict CORS to the frontend origin only
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5000').split(',');
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman) in dev
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// ── Database Connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('FATAL: MongoDB connection failed:', err.message);
        process.exit(1);  // Don't let the server run with no DB
    });

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/feedback', require('./routes/feedbackRoute'));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

if (process.env.NODE_ENV !== 'production' || process.env.RUN_LOCAL === 'true') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel Serverless Functions
module.exports = app;

const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const ML_SERVICE_URL = 'http://localhost:5001/predict';

// Analyze Sentiment (Preview - No Save)
router.post('/analyze-preview', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;

        // Call Python ML Service
        try {
            const mlResponse = await axios.post(ML_SERVICE_URL, { text });
            res.json(mlResponse.data);
        } catch (mlError) {
            console.error("ML Service Error (Preview):", mlError.message);
            res.status(503).json({ message: 'Sentiment Analysis Service Unavailable' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create Feedback
router.post('/', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;

        // Call Python ML Service
        let sentimentData = {
            sentiment: 'Neutral',
            confidenceScore: 0,
            detectedKeywords: []
        };

        try {
            const mlResponse = await axios.post(ML_SERVICE_URL, { text });
            sentimentData = {
                sentiment: mlResponse.data.sentiment,
                confidenceScore: mlResponse.data.confidenceScore,
                detectedKeywords: mlResponse.data.detectedKeywords
            };
        } catch (mlError) {
            console.error("ML Service Error (Create):", mlError.message);
            return res.status(503).json({ message: 'Sentiment Analysis Service Unavailable' });
        }

        const feedback = await Feedback.create({
            user: req.user.id,
            text,
            ...sentimentData
        });

        res.status(201).json(feedback);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get User's Feedback
router.get('/my-feedback', verifyToken, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get All Feedback (Admin)
router.get('/all', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });

        const feedbacks = await Feedback.find().populate('user', 'fullName email').sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete Feedback
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Not Found' });

        if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access Denied' });
        }

        await feedback.deleteOne();
        res.json({ message: 'Feedback Removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

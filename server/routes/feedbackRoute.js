const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const jwt = require('jsonwebtoken');

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

// Mock Sentiment Analysis Function
const analyzeSentiment = (text) => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'happy', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'worst', 'hate', 'sad', 'angry', 'poor'];

    let score = 0;
    const words = text.toLowerCase().split(/\s+/);
    const detectedKeywords = [];

    words.forEach(word => {
        if (positiveWords.includes(word)) {
            score++;
            detectedKeywords.push(word);
        }
        else if (negativeWords.includes(word)) {
            score--;
            detectedKeywords.push(word);
        }
    });

    let sentiment = 'Neutral';
    if (score > 0) sentiment = 'Positive';
    if (score < 0) sentiment = 'Negative';

    // Mock confidence (random between 70-99 for realism)
    const confidenceScore = Math.floor(Math.random() * (99 - 70 + 1)) + 70;

    return { sentiment, confidenceScore, detectedKeywords: [...new Set(detectedKeywords)] };
};

// Create Feedback
router.post('/', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        const analysis = analyzeSentiment(text);

        const feedback = await Feedback.create({
            user: req.user.id,
            text,
            ...analysis
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

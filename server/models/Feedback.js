const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    sentiment: {
        type: String, // Positive, Negative, Neutral
        required: true
    },
    confidenceScore: {
        type: Number,
        required: true
    },
    detectedKeywords: [String]
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);

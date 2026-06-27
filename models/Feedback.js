const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    sentiment: {
        type: String,
        enum: ['Positive', 'Negative', 'Neutral'],
        required: true
    },
    confidenceScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    detectedKeywords: [{
        type: String,
        lowercase: true
    }]
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Routes (Placeholders)
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/feedback', require('./routes/feedbackRoute'));

app.get('/', (req, res) => {
    res.send('FeedSense API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

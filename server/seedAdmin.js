const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const seedAdmin = async () => {
    try {
        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit();
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            fullName: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();

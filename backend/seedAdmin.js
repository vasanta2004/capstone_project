const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ridex');
        console.log('MongoDB Connected');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@ridex.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists! You can log in with:');
            console.log('Email: admin@ridex.com');
            console.log('Password: The password you originally set (default was admin123)');
            
            // If they want to reset it, we can force reset here, but we will just exit.
            process.exit(0);
        }

        // Create a new admin
        const adminUser = new User({
            name: 'System Admin',
            email: 'admin@ridex.com',
            password: 'admin', // The User model has a pre-save hook that will hash this
            phone: '0000000000',
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user successfully created!');
        console.log('--- CREDENTIALS ---');
        console.log('Email: admin@ridex.com');
        console.log('Password: admin');
        console.log('-------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();

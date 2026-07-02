const mongoose = require('mongoose');
const User = require('../models/User');
const Driver = require('../models/Driver');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed Admin Account
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            console.log('Seeding default Admin User in MongoDB...');
            await User.create({
                name: 'Administrator',
                email: 'admin@ridex.com',
                password: 'password123',
                phone: '+1 555 019 2831',
                role: 'admin'
            });
            console.log('Admin seeded: admin@ridex.com / password123');
        }

        // Seed Drivers
        const driversCount = await Driver.countDocuments();
        if (driversCount === 0) {
            console.log('Seeding demonstration drivers in MongoDB...');
            await Driver.create([
                {
                    driverName: 'Alexander Sterling',
                    email: 'alexander@ridex-vip.com',
                    password: 'password123',
                    phone: '+1 555 382 9102',
                    vehicleDetails: { make: 'Tesla', model: 'Model S Plaid', year: '2024', licensePlate: 'RDX-998P', color: 'Midnight Black' },
                    isApproved: false
                },
                {
                    driverName: 'Seraphina Vance',
                    email: 'seraphina@ridex-vip.com',
                    password: 'password123',
                    phone: '+1 555 981 2289',
                    vehicleDetails: { make: 'Mercedes-Benz', model: 'EQS SUV', year: '2023', licensePlate: 'LUX-777E', color: 'Obsidian Black' },
                    isApproved: true
                },
                {
                    driverName: 'Viktor Thorne',
                    email: 'viktor@ridex-vip.com',
                    password: 'password123',
                    phone: '+1 555 204 8831',
                    vehicleDetails: { make: 'Lucid', model: 'Air Sapphire', year: '2024', licensePlate: 'SPD-001X', color: 'Sapphire Blue' },
                    isApproved: false
                }
            ]);
            console.log('Demonstration drivers seeded successfully.');
        }

    } catch (error) {
        console.error('========================================================');
        console.error(`WARNING: Local MongoDB Offline (${error.message})`);
        console.error('RideX Server is running in robust Developer Demo mode with memory fallback.');
        console.error('========================================================');
    }
};

module.exports = connectDB;

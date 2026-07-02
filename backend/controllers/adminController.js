const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'rider' });
        const totalDrivers = await Driver.countDocuments();
        const totalRides = await Ride.countDocuments();
        
        // Calculate total revenue
        const payments = await Payment.find({ status: 'completed' });
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            totalUsers,
            totalDrivers,
            totalRides,
            totalRevenue
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'rider' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all drivers
// @route   GET /api/admin/drivers
// @access  Private (Admin)
const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().select('-password');
        res.json(drivers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Approve driver
// @route   PUT /api/admin/drivers/:id/approve
// @access  Private (Admin)
const approveDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        driver.isApproved = true;
        await driver.save();

        res.json({ message: 'Driver approved successfully', driver });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    getDrivers,
    approveDriver
};

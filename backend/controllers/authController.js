const User = require('../models/User');
const Driver = require('../models/Driver');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (rider)
// @route   POST /api/auth/register/user
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'rider'
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Register a new driver
// @route   POST /api/auth/register/driver
// @access  Public
const registerDriver = async (req, res) => {
    const { driverName, email, password, phone, vehicleDetails } = req.body;

    const driverExists = await Driver.findOne({ email });

    if (driverExists) {
        return res.status(400).json({ message: 'Driver already exists' });
    }

    const driver = await Driver.create({
        driverName,
        email,
        password,
        phone,
        vehicleDetails
    });

    if (driver) {
        res.status(201).json({
            _id: driver._id,
            driverName: driver.driverName,
            email: driver.email,
            phone: driver.phone,
            role: 'driver',
            token: generateToken(driver._id, 'driver')
        });
    } else {
        res.status(400).json({ message: 'Invalid driver data' });
    }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password, type } = req.body; // type can be 'user' or 'driver'

    if (type === 'driver') {
        const driver = await Driver.findOne({ email });

        if (driver && (await driver.matchPassword(password))) {
            res.json({
                _id: driver._id,
                driverName: driver.driverName,
                email: driver.email,
                phone: driver.phone,
                role: 'driver',
                token: generateToken(driver._id, 'driver')
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } else {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
};

// @desc    Update user profile (rider or driver)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, driverName, email, phone } = req.body;
        const role = req.userRole;

        if (role === 'driver') {
            const driver = await Driver.findById(req.user._id);
            if (!driver) {
                return res.status(404).json({ message: 'Driver not found' });
            }

            // Check if email is being changed and is already taken
            if (email && email !== driver.email) {
                const emailExists = await Driver.findOne({ email });
                const userEmailExists = await User.findOne({ email });
                if (emailExists || userEmailExists) {
                    return res.status(400).json({ message: 'Email already taken' });
                }
                driver.email = email;
            }

            if (driverName) driver.driverName = driverName;
            if (phone) driver.phone = phone;

            await driver.save();

            res.json({
                _id: driver._id,
                driverName: driver.driverName,
                email: driver.email,
                phone: driver.phone,
                role: 'driver',
                token: generateToken(driver._id, 'driver')
            });
        } else {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if email is being changed and is already taken
            if (email && email !== user.email) {
                const emailExists = await User.findOne({ email });
                const driverEmailExists = await Driver.findOne({ email });
                if (emailExists || driverEmailExists) {
                    return res.status(400).json({ message: 'Email already taken' });
                }
                user.email = email;
            }

            if (name) user.name = name;
            if (phone) user.phone = phone;

            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    registerDriver,
    login,
    updateProfile
};

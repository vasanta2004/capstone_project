const Ride = require('../models/Ride');
const User = require('../models/User');

// @desc    Create a new ride request
// @route   POST /api/rides/book
// @access  Private (Rider)
const bookRide = async (req, res) => {
    try {
        const { pickupLocation, dropLocation, distance, fare } = req.body;

        const ride = await Ride.create({
            riderId: req.user._id,
            pickupLocation,
            dropLocation,
            distance,
            fare,
            status: 'pending'
        });

        // Here we would also emit a socket event to nearby drivers
        // io.emit('new-ride-request', ride);

        res.status(201).json(ride);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Accept a ride request
// @route   PUT /api/rides/:id/accept
// @access  Private (Driver)
const acceptRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.status !== 'pending') {
            return res.status(400).json({ message: 'Ride is no longer available' });
        }

        ride.driverId = req.user._id;
        ride.status = 'accepted';
        
        await ride.save();

        res.json(ride);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update ride status (arriving, started, completed, cancelled)
// @route   PUT /api/rides/:id/status
// @access  Private (Driver/Rider)
const updateRideStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        ride.status = status;
        await ride.save();

        res.json(ride);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get user's ride history
// @route   GET /api/rides/history
// @access  Private (Rider/Driver)
const getRideHistory = async (req, res) => {
    try {
        let query = {};
        if (req.userRole === 'driver') {
            query.driverId = req.user._id;
        } else {
            query.riderId = req.user._id;
        }

        const rides = await Ride.find(query).sort({ createdAt: -1 });
        res.json(rides);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    bookRide,
    acceptRide,
    updateRideStatus,
    getRideHistory
};

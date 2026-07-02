const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver'
    },
    pickupLocation: {
        address: { type: String, required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    dropLocation: {
        address: { type: String, required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    distance: {
        type: Number, // in km
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'arriving', 'started', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Ride = mongoose.model('Ride', rideSchema);
module.exports = Ride;

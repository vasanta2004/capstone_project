const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const driverSchema = new mongoose.Schema({
    driverName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    vehicleDetails: {
        make: String,
        model: String,
        year: String,
        licensePlate: String,
        color: String
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    availabilityStatus: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

driverSchema.index({ currentLocation: '2dsphere' });

driverSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

driverSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;

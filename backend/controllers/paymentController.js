const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const sendEmail = require('../utils/sendEmail');

// @desc    Process a mock payment for a ride
// @route   POST /api/payments/process
// @access  Private (Rider)
const processPayment = async (req, res) => {
    try {
        const { rideId, amount, paymentMethod } = req.body;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Create a mock successful payment
        const payment = await Payment.create({
            rideId,
            userId: req.user._id,
            amount,
            status: 'completed',
            transactionId: `mock_txn_${Date.now()}`,
            paymentMethod
        });

        // Update ride payment status
        ride.paymentStatus = 'completed';
        await ride.save();

        // Send Email Receipt
        try {
            await sendEmail({
                email: req.user.email,
                subject: 'RideX Payment Receipt',
                message: `Thank you for riding with RideX. Your payment of $${amount} has been processed successfully. Transaction ID: ${payment.transactionId}`
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // We don't fail the payment if email fails
        }

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    processPayment
};

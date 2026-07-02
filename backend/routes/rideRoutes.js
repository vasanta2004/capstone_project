const express = require('express');
const { bookRide, acceptRide, updateRideStatus, getRideHistory } = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/book', protect, bookRide);
router.put('/:id/accept', protect, acceptRide);
router.put('/:id/status', protect, updateRideStatus);
router.get('/history', protect, getRideHistory);

module.exports = router;

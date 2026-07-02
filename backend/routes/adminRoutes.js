const express = require('express');
const { getDashboardStats, getUsers, getDrivers, approveDriver } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes must be protected and check for admin role
router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/drivers', getDrivers);
router.put('/drivers/:id/approve', approveDriver);

module.exports = router;

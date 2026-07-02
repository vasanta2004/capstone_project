const express = require('express');
const { registerUser, registerDriver, login, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register/user', registerUser);
router.post('/register/driver', registerDriver);
router.post('/login', login);
router.put('/profile', protect, updateProfile);

module.exports = router;

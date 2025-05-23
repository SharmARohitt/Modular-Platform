const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Registration and login routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route to get current user
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;

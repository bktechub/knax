const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getAllUsers,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');

// Public Routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected Routes (authentication required)
router.use(authMiddleware.protect);

// User routes
router.get('/profile', getUserProfile);
router.patch('/profile', updateUserProfile);
router.patch('/change-password', changePassword);

// Admin-only routes
router.get('/users', authMiddleware.restrictTo('ADMIN'), getAllUsers);

module.exports = router;
const express = require('express');
const {
  getStreak,
  getRewards,
  getDashboard,
  getStats,
  updatePaymentInfo,
  getPaymentInfo
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// User data routes
router.get('/streak', getStreak);
router.get('/rewards', getRewards);
router.get('/dashboard', getDashboard);
router.get('/stats', getStats);

// Payment information routes
router.get('/payment-info', getPaymentInfo);
router.put('/payment-info', updatePaymentInfo);

module.exports = router;


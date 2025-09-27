const express = require('express');
const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/adminAuth');
const {
  createPayment,
  getAllPayments,
  updatePaymentStatus,
  getPaymentStats,
  getEligibleUsers,
  createPaymentForUser
} = require('../controllers/paymentController');

const router = express.Router();

// Public routes (if any)

// Protected routes (require user authentication)
router.use(protect);

// User payment routes
router.post('/create', createPayment);
router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);
router.get('/eligible-users', getEligibleUsers);
router.put('/:id/status', updatePaymentStatus);

// Admin routes (require admin authentication)
router.use(adminProtect);
router.post('/admin/create', createPaymentForUser);

module.exports = router;

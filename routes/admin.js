const express = require('express');
const { adminProtect } = require('../middleware/adminAuth');
const { adminLogin, getAdminProfile, updateAdminProfile, changePassword } = require('../controllers/adminAuthController');
const { 
  getOverview, 
  getAllVideos, 
  updateVideoStatus, 
  deleteVideo, 
  getAllUsers, 
  getUserDetails,
  getAllPayments,
  getPaymentStats,
  getEligibleUsers,
  createPaymentForUser,
  updatePaymentStatus
} = require('../controllers/adminDashboardController');

const router = express.Router();

// Public admin routes
router.post('/auth/login', adminLogin);

// Protected admin routes
router.use(adminProtect);

// Admin auth routes
router.get('/auth/me', getAdminProfile);
router.put('/auth/profile', updateAdminProfile);
router.put('/auth/password', changePassword);

// Dashboard routes
router.get('/dashboard/overview', getOverview);
router.get('/dashboard/videos', getAllVideos);
router.put('/dashboard/videos/:id/status', updateVideoStatus);
router.delete('/dashboard/videos/:id', deleteVideo);
router.get('/dashboard/users', getAllUsers);
router.get('/dashboard/users/:id', getUserDetails);
router.get('/dashboard/payments', getAllPayments);
router.get('/dashboard/payment-stats', getPaymentStats);
router.get('/dashboard/eligible-users', getEligibleUsers);
router.post('/dashboard/create-payment', createPaymentForUser);
router.put('/dashboard/payments/:id/status', updatePaymentStatus);

module.exports = router;

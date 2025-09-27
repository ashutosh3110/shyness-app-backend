const Payment = require('../models/Payment');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create payment for eligible user
// @route   POST /api/payments/create
// @access  Private
exports.createPayment = asyncHandler(async (req, res) => {
  const { userId, amount, paymentMethod, adminNotes } = req.body;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user is eligible (10+ day streak)
  if (user.currentStreak < 10) {
    return res.status(400).json({
      success: false,
      message: 'User is not eligible for payment. Minimum 10-day streak required.'
    });
  }

  // Check if payment already exists for this user
  const existingPayment = await Payment.findOne({
    user: userId,
    status: { $in: ['pending', 'completed'] },
    paymentReason: 'streak_reward'
  });

  if (existingPayment) {
    return res.status(400).json({
      success: false,
      message: 'Payment already exists for this user'
    });
  }

  // Calculate due date (7 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  // Create payment
  const payment = await Payment.create({
    user: userId,
    amount: amount || 100, // Default $100 for 10+ day streak
    paymentMethod,
    streakDays: user.currentStreak,
    eligibleForPayment: true,
    paymentReason: 'streak_reward',
    adminNotes,
    dueDate
  });

  // Populate user data
  await payment.populate('user', 'name email currentStreak');

  res.status(201).json({
    success: true,
    data: payment,
    message: 'Payment created successfully'
  });
});

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, userId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let filter = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;

  const payments = await Payment.find(filter)
    .populate('user', 'name email currentStreak')
    .populate('processedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Payment.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  const paymentId = req.params.id;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  payment.status = status;
  if (adminNotes) payment.adminNotes = adminNotes;
  if (status === 'completed') {
    payment.processedAt = new Date();
    payment.processedBy = req.user?.id || req.admin?.id;
  }

  await payment.save();

  res.status(200).json({
    success: true,
    data: payment,
    message: 'Payment status updated successfully'
  });
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private
exports.getPaymentStats = asyncHandler(async (req, res) => {
  const totalPayments = await Payment.countDocuments();
  const pendingPayments = await Payment.countDocuments({ status: 'pending' });
  const completedPayments = await Payment.countDocuments({ status: 'completed' });
  const failedPayments = await Payment.countDocuments({ status: 'failed' });
  
  const totalAmount = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const overduePayments = await Payment.countDocuments({
    status: 'pending',
    dueDate: { $lt: new Date() }
  });

  res.status(200).json({
    success: true,
    data: {
      totalPayments,
      pendingPayments,
      completedPayments,
      failedPayments,
      totalAmount: totalAmount[0]?.total || 0,
      overduePayments
    }
  });
});

// @desc    Get eligible users for payment
// @route   GET /api/payments/eligible-users
// @access  Private
exports.getEligibleUsers = asyncHandler(async (req, res) => {
  // Find users with 10+ day streak who don't have pending payments
  const eligibleUsers = await User.find({
    currentStreak: { $gte: 10 },
    'paymentInfo.isPaymentInfoComplete': true,
    _id: {
      $nin: await Payment.distinct('user', {
        status: { $in: ['pending', 'completed'] },
        paymentReason: 'streak_reward'
      })
    }
  }).select('name email currentStreak longestStreak paymentInfo createdAt');

  // Add payment display info for each user
  const usersWithPaymentInfo = eligibleUsers.map(user => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    createdAt: user.createdAt,
    paymentDisplayInfo: user.getPaymentDisplayInfo()
  }));

  res.status(200).json({
    success: true,
    data: usersWithPaymentInfo
  });
});

// @desc    Create payment for eligible user (Admin)
// @route   POST /api/payments/admin/create
// @access  Private/Admin
exports.createPaymentForUser = asyncHandler(async (req, res) => {
  const { userId, amount, paymentMethod, adminNotes } = req.body;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user is eligible (10+ day streak)
  if (user.currentStreak < 10) {
    return res.status(400).json({
      success: false,
      message: 'User is not eligible for payment. Minimum 10-day streak required.'
    });
  }

  // Check if user has complete payment information
  if (!user.paymentInfo.isPaymentInfoComplete) {
    return res.status(400).json({
      success: false,
      message: 'User has not completed payment information setup.'
    });
  }

  // Check if payment already exists for this user
  const existingPayment = await Payment.findOne({
    user: userId,
    status: { $in: ['pending', 'completed'] },
    paymentReason: 'streak_reward'
  });

  if (existingPayment) {
    return res.status(400).json({
      success: false,
      message: 'Payment already exists for this user'
    });
  }

  // Calculate due date (7 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  // Create payment
  const payment = await Payment.create({
    user: userId,
    amount: amount || 100, // Default $100 for 10+ day streak
    paymentMethod,
    streakDays: user.currentStreak,
    eligibleForPayment: true,
    paymentReason: 'streak_reward',
    adminNotes,
    dueDate,
    processedBy: req.admin.id
  });

  // Populate user data
  await payment.populate('user', 'name email currentStreak paymentInfo');

  // Get payment display info
  const paymentDisplayInfo = user.getPaymentDisplayInfo();

  res.status(201).json({
    success: true,
    data: {
      payment,
      paymentDisplayInfo
    },
    message: 'Payment created successfully for user'
  });
});

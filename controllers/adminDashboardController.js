const User = require('../models/User');
const Video = require('../models/Video');
const Topic = require('../models/Topic');
const Reward = require('../models/Reward');
const Payment = require('../models/Payment');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard/overview
// @access  Private/Admin
exports.getOverview = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalVideos = await Video.countDocuments();
  const totalTopics = await Topic.countDocuments();
  const totalRewards = await Reward.countDocuments();
  
  const pendingVideos = await Video.countDocuments({ validationStatus: 'pending' });
  const validVideos = await Video.countDocuments({ validationStatus: 'valid' });
  const invalidVideos = await Video.countDocuments({ validationStatus: 'invalid' });
  
  const recentVideos = await Video.find()
    .sort({ uploadDate: -1 })
    .limit(5)
    .populate('user', 'name email')
    .populate('topic', 'title');
  
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email role createdAt');
  
  const userGrowth = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalVideos,
        totalTopics,
        totalRewards,
        pendingVideos,
        validVideos,
        invalidVideos
      },
      recentVideos,
      recentUsers,
      userGrowth
    }
  });
});

// @desc    Get all videos for admin
// @route   GET /api/admin/dashboard/videos
// @access  Private/Admin
exports.getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, user, topic } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let filter = {};
  if (status) filter.validationStatus = status;
  if (user) filter.user = user;
  if (topic) filter.topic = topic;
  
  const videos = await Video.find(filter)
    .populate('user', 'name email')
    .populate('topic', 'title category')
    .sort({ uploadDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Video.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: {
      videos,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// @desc    Update video status
// @route   PUT /api/admin/dashboard/videos/:id/status
// @access  Private/Admin
exports.updateVideoStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }
  
  video.validationStatus = status;
  await video.save();
  
  res.status(200).json({
    success: true,
    data: video
  });
});

// @desc    Delete video
// @route   DELETE /api/admin/dashboard/videos/:id
// @access  Private/Admin
exports.deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }
  
  await video.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Video deleted successfully'
  });
});

// @desc    Get all users for admin with their activities
// @route   GET /api/admin/dashboard/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get detailed user data with videos and activities
  const usersWithActivities = await Promise.all(
    users.map(async (user) => {
      // Get user's videos
      const userVideos = await Video.find({ user: user._id })
        .populate('topic', 'title category')
        .sort({ uploadDate: -1 });
      
      // Get user's video statistics
      const videoStats = {
        totalVideos: userVideos.length,
        validVideos: userVideos.filter(v => v.validationStatus === 'valid').length,
        pendingVideos: userVideos.filter(v => v.validationStatus === 'pending').length,
        invalidVideos: userVideos.filter(v => v.validationStatus === 'invalid').length,
        lastVideoDate: userVideos.length > 0 ? userVideos[0].uploadDate : null
      };
      
      // Get user's streak information
      const streakInfo = {
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        totalDaysActive: user.totalDaysActive || 0,
        lastActiveDate: user.lastActiveDate || user.createdAt
      };
      
      // Get user's recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentVideos = userVideos.filter(video => 
        new Date(video.uploadDate) >= sevenDaysAgo
      );
      
      return {
        ...user.toObject(),
        videoStats,
        streakInfo,
        recentVideos: recentVideos.slice(0, 5), // Last 5 recent videos
        totalVideos: userVideos.length
      };
    })
  );
  
  const total = await User.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: {
      users: usersWithActivities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// @desc    Get user details
// @route   GET /api/admin/dashboard/users/:id
// @access  Private/Admin
exports.getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  const userVideos = await Video.find({ user: req.params.id })
    .populate('topic', 'title category')
    .sort({ uploadDate: -1 });
  
  res.status(200).json({
    success: true,
    data: {
      user,
      videos: userVideos
    }
  });
});

// @desc    Get all payments
// @route   GET /api/admin/dashboard/payments
// @access  Private/Admin
exports.getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let filter = {};
  if (status) filter.status = status;
  
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

// @desc    Get payment statistics
// @route   GET /api/admin/dashboard/payment-stats
// @access  Private/Admin
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
// @route   GET /api/admin/dashboard/eligible-users
// @access  Private/Admin
exports.getEligibleUsers = asyncHandler(async (req, res) => {
  // Find users with 10+ day streak who don't have pending payments
  const eligibleUsers = await User.find({
    currentStreak: { $gte: 10 },
    _id: {
      $nin: await Payment.distinct('user', {
        status: { $in: ['pending', 'completed'] },
        paymentReason: 'streak_reward'
      })
    }
  }).select('name email currentStreak longestStreak createdAt');

  res.status(200).json({
    success: true,
    data: eligibleUsers
  });
});

// @desc    Create payment for eligible user
// @route   POST /api/admin/dashboard/create-payment
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
  await payment.populate('user', 'name email currentStreak');

  res.status(201).json({
    success: true,
    data: payment,
    message: 'Payment created successfully for user'
  });
});

// @desc    Update payment status
// @route   PUT /api/admin/dashboard/payments/:id/status
// @access  Private/Admin
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
    payment.processedBy = req.admin.id;
  }

  await payment.save();

  res.status(200).json({
    success: true,
    data: payment,
    message: 'Payment status updated successfully'
  });
});


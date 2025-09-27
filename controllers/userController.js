const User = require('../models/User');
const Video = require('../models/Video');
const Reward = require('../models/Reward');

// @desc    Get user streak information
// @route   GET /api/user/streak
// @access  Private
exports.getStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Calculate days since last upload
    const today = new Date();
    const lastUpload = user.lastUploadDate;
    let daysSinceLastUpload = 0;
    
    if (lastUpload) {
      const diffTime = Math.abs(today - lastUpload);
      daysSinceLastUpload = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Get recent uploads for streak visualization
    const recentVideos = await Video.find({ user: req.user.id })
      .sort({ uploadDate: -1 })
      .limit(30)
      .select('uploadDate');

    // Calculate streak status
    const streakStatus = {
      current: user.currentStreak,
      longest: user.longestStreak,
      daysSinceLastUpload,
      isActive: daysSinceLastUpload <= 1,
      nextGoal: 8 - (user.currentStreak % 8),
      totalVideos: user.totalVideos
    };

    res.status(200).json({
      success: true,
      data: streakStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching streak information',
      error: error.message
    });
  }
};

// @desc    Get user rewards
// @route   GET /api/user/rewards
// @access  Private
exports.getRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('rewards');
    
    // Get all available rewards for comparison
    const allRewards = await Reward.find({ isActive: true }).sort({ 'requirement.value': 1 });
    
    // Check which rewards user has earned
    const earnedRewards = user.rewards;
    const availableRewards = allRewards.filter(reward => 
      !earnedRewards.some(earned => earned._id.toString() === reward._id.toString())
    );

    res.status(200).json({
      success: true,
      data: {
        earned: earnedRewards,
        available: availableRewards,
        totalEarned: earnedRewards.length,
        totalAvailable: allRewards.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rewards',
      error: error.message
    });
  }
};

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('rewards');
    
    // Get recent videos
    const recentVideos = await Video.find({ user: req.user.id })
      .populate('topic', 'title category')
      .sort({ uploadDate: -1 })
      .limit(5);

    // Get video statistics
    const videoStats = await Video.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    // Get monthly uploads for chart
    const monthlyUploads = await Video.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$uploadDate' },
            month: { $month: '$uploadDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Calculate streak status
    const today = new Date();
    const lastUpload = user.lastUploadDate;
    let daysSinceLastUpload = 0;
    
    if (lastUpload) {
      const diffTime = Math.abs(today - lastUpload);
      daysSinceLastUpload = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalVideos: user.totalVideos,
        rewards: user.rewards
      },
      streak: {
        current: user.currentStreak,
        longest: user.longestStreak,
        daysSinceLastUpload,
        isActive: daysSinceLastUpload <= 1,
        nextGoal: 8 - (user.currentStreak % 8)
      },
      recentVideos,
      statistics: videoStats[0] || {
        totalVideos: 0,
        totalDuration: 0,
        avgDuration: 0,
        totalViews: 0
      },
      monthlyUploads
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get detailed statistics
    const stats = await Video.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          videosWithAudio: { $sum: { $cond: ['$hasAudio', 1, 0] } },
          videosWithFace: { $sum: { $cond: ['$hasFace', 1, 0] } }
        }
      }
    ]);

    // Get topic distribution
    const topicStats = await Video.aggregate([
      { $match: { user: user._id } },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topicInfo'
        }
      },
      { $unwind: '$topicInfo' },
      {
        $group: {
          _id: '$topicInfo.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get weekly upload pattern
    const weeklyPattern = await Video.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: { $dayOfWeek: '$uploadDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const result = {
      overview: stats[0] || {
        totalVideos: 0,
        totalDuration: 0,
        avgDuration: 0,
        totalViews: 0,
        totalLikes: 0,
        videosWithAudio: 0,
        videosWithFace: 0
      },
      topicDistribution: topicStats,
      weeklyPattern,
      streak: {
        current: user.currentStreak,
        longest: user.longestStreak
      }
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Update user payment information
// @route   PUT /api/user/payment-info
// @access  Private
exports.updatePaymentInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update payment information
    await user.updatePaymentInfo(req.body);

    // Get updated user data
    const updatedUser = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Payment information updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment information',
      error: error.message
    });
  }
};

// @desc    Get user payment information
// @route   GET /api/user/payment-info
// @access  Private
exports.getPaymentInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('paymentInfo');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentInfo: user.paymentInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment information',
      error: error.message
    });
  }
};


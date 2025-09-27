const Script = require('../models/Script');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all script categories
// @route   GET /api/scripts/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Business and workplace related topics',
      icon: 'briefcase',
      color: 'blue'
    },
    {
      id: 'personal',
      name: 'Personal',
      description: 'Personal development and life skills',
      icon: 'user',
      color: 'green'
    },
    {
      id: 'educational',
      name: 'Educational',
      description: 'Learning and academic topics',
      icon: 'book',
      color: 'purple'
    },
    {
      id: 'social',
      name: 'Social',
      description: 'Social interactions and relationships',
      icon: 'users',
      color: 'pink'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Creative and artistic expressions',
      icon: 'palette',
      color: 'orange'
    },
    {
      id: 'motivational',
      name: 'Motivational',
      description: 'Inspirational and motivational content',
      icon: 'trending-up',
      color: 'red'
    }
  ];

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get scripts by category
// @route   GET /api/scripts/category/:category
// @access  Public
exports.getScriptsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10, difficulty, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let filter = { category, isActive: true };
  
  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const scripts = await Script.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Script.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      scripts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// @desc    Get single script
// @route   GET /api/scripts/:id
// @access  Public
exports.getScript = asyncHandler(async (req, res) => {
  const script = await Script.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!script) {
    return res.status(404).json({
      success: false,
      message: 'Script not found'
    });
  }

  if (!script.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Script is not available'
    });
  }

  res.status(200).json({
    success: true,
    data: script
  });
});

// @desc    Search scripts
// @route   GET /api/scripts/search
// @access  Public
exports.searchScripts = asyncHandler(async (req, res) => {
  const { q, category, difficulty } = req.query;
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let filter = { isActive: true };

  if (category) {
    filter.category = category;
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { topic: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ];
  }

  const scripts = await Script.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Script.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      scripts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// @desc    Download script (increment download count)
// @route   POST /api/scripts/:id/download
// @access  Private
exports.downloadScript = asyncHandler(async (req, res) => {
  const script = await Script.findById(req.params.id);

  if (!script) {
    return res.status(404).json({
      success: false,
      message: 'Script not found'
    });
  }

  if (!script.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Script is not available'
    });
  }

  // Increment download count
  await script.incrementDownload();

  res.status(200).json({
    success: true,
    data: script,
    message: 'Download count updated'
  });
});

// @desc    Get script statistics
// @route   GET /api/scripts/stats
// @access  Public
exports.getScriptStats = asyncHandler(async (req, res) => {
  const totalScripts = await Script.countDocuments({ isActive: true });
  
  const categoryStats = await Script.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const difficultyStats = await Script.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const totalDownloads = await Script.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$downloadCount' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalScripts,
      totalDownloads: totalDownloads[0]?.total || 0,
      categoryStats,
      difficultyStats
    }
  });
});

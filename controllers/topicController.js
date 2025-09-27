const Topic = require('../models/Topic');

// @desc    Get all topics
// @route   GET /api/topics
// @access  Public
exports.getTopics = async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const topics = await Topic.find(filter)
      .sort({ usageCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Topic.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: topics.length,
      total,
      data: topics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message
    });
  }
};

// @desc    Get single topic
// @route   GET /api/topics/:id
// @access  Public
exports.getTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.status(200).json({
      success: true,
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching topic',
      error: error.message
    });
  }
};

// @desc    Create new topic
// @route   POST /api/topics
// @access  Private (Admin only)
exports.createTopic = async (req, res) => {
  try {
    const topic = await Topic.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating topic',
      error: error.message
    });
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private (Admin only)
exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating topic',
      error: error.message
    });
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private (Admin only)
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting topic',
      error: error.message
    });
  }
};

// @desc    Get random topic for daily challenge
// @route   GET /api/topics/random
// @access  Private
exports.getRandomTopic = async (req, res) => {
  try {
    const { difficulty } = req.query;
    
    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;

    const count = await Topic.countDocuments(filter);
    const random = Math.floor(Math.random() * count);
    
    const topic = await Topic.findOne(filter).skip(random);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'No topics available'
      });
    }

    res.status(200).json({
      success: true,
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching random topic',
      error: error.message
    });
  }
};


const express = require('express');
const {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getRandomTopic
} = require('../controllers/topicController');
const { protect, authorize } = require('../middleware/auth');
const { validateTopic } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getTopics);
router.get('/random', getRandomTopic);
router.get('/:id', getTopic);

// Admin routes
router.post('/', protect, authorize('admin'), validateTopic, createTopic);
router.put('/:id', protect, authorize('admin'), validateTopic, updateTopic);
router.delete('/:id', protect, authorize('admin'), deleteTopic);

module.exports = router;


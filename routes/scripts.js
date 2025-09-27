const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getCategories,
  getScriptsByCategory,
  getScript,
  searchScripts,
  downloadScript,
  getScriptStats
} = require('../controllers/scriptController');

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/category/:category', getScriptsByCategory);
router.get('/search', searchScripts);
router.get('/stats', getScriptStats);
router.get('/:id', getScript);

// Protected routes
router.use(protect);
router.post('/:id/download', downloadScript);

module.exports = router;

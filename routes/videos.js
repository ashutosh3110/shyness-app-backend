const express = require('express');
const {
  uploadVideo,
  getMyVideos,
  getVideo,
  updateVideo,
  deleteVideo
} = require('../controllers/videoController');
const { protect } = require('../middleware/auth');
const { validateVideoUpload } = require('../middleware/validation');
const { uploadVideo: upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

// Video upload route
router.post('/upload', upload, handleUploadError, validateVideoUpload, uploadVideo);

// Video management routes
router.get('/my-videos', getMyVideos);
router.get('/:id', getVideo);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

module.exports = router;


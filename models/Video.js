const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a video title'],
    trim: true,
    maxlength: [100, 'Video title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Video description cannot be more than 500 characters']
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  format: {
    type: String,
    required: true
  },
  resolution: {
    width: Number,
    height: Number
  },
  hasAudio: {
    type: Boolean,
    default: false
  },
  hasFace: {
    type: Boolean,
    default: false
  },
  validationStatus: {
    type: String,
    enum: ['pending', 'valid', 'invalid'],
    default: 'pending'
  },
  validationErrors: [{
    type: String
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
videoSchema.index({ user: 1, uploadDate: -1 });
videoSchema.index({ topic: 1 });
videoSchema.index({ validationStatus: 1 });

module.exports = mongoose.model('Video', videoSchema);


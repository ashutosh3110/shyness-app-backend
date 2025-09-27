const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a script title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['professional', 'personal', 'educational', 'social', 'creative', 'motivational'],
    lowercase: true
  },
  topic: {
    type: String,
    required: [true, 'Please provide a topic'],
    trim: true,
    maxlength: [200, 'Topic cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide script content'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in minutes'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [60, 'Duration cannot be more than 60 minutes']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
scriptSchema.index({ category: 1, isActive: 1 });
scriptSchema.index({ topic: 1, isActive: 1 });
scriptSchema.index({ tags: 1 });
scriptSchema.index({ difficulty: 1 });

// Virtual for formatted duration
scriptSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Method to increment download count
scriptSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Static method to get scripts by category
scriptSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Static method to search scripts
scriptSchema.statics.searchScripts = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { topic: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Script', scriptSchema);

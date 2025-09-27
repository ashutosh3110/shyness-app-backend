const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a topic title'],
    trim: true,
    maxlength: [100, 'Topic title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a topic description'],
    trim: true,
    maxlength: [500, 'Topic description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['personal', 'professional', 'creative', 'educational', 'social'],
    default: 'personal'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 2
  },
  tips: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Increment usage count when topic is selected
topicSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

module.exports = mongoose.model('Topic', topicSchema);


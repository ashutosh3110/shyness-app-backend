const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a reward name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a reward description'],
    trim: true
  },
  type: {
    type: String,
    enum: ['badge', 'achievement', 'milestone'],
    required: true
  },
  category: {
    type: String,
    enum: ['streak', 'total_videos', 'consistency', 'improvement'],
    required: true
  },
  requirement: {
    type: {
      type: String,
      enum: ['streak_days', 'total_videos', 'consecutive_weeks'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  icon: {
    type: String, // URL or icon name
    required: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Static method to check if user qualifies for a reward
rewardSchema.statics.checkRewards = async function(user) {
  const rewards = await this.find({ isActive: true });
  const earnedRewards = [];
  
  for (const reward of rewards) {
    let qualifies = false;
    
    switch (reward.requirement.type) {
      case 'streak_days':
        qualifies = user.currentStreak >= reward.requirement.value;
        break;
      case 'total_videos':
        qualifies = user.totalVideos >= reward.requirement.value;
        break;
      case 'consecutive_weeks':
        // Check if user has uploaded at least 5 days in the last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        // This would need to be implemented with actual video count logic
        break;
    }
    
    if (qualifies && !user.rewards.includes(reward._id)) {
      earnedRewards.push(reward);
    }
  }
  
  return earnedRewards;
};

module.exports = mongoose.model('Reward', rewardSchema);


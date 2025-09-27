const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Reward = require('../models/Reward');
require('dotenv').config();

const topics = [
  {
    title: "Introduce Yourself",
    description: "Tell us about yourself - your name, where you're from, and what you do for a living.",
    category: "personal",
    difficulty: "beginner",
    estimatedDuration: 2,
    tips: [
      "Start with your name and smile",
      "Mention your location or hometown",
      "Share your profession or studies",
      "End with something you're passionate about"
    ]
  },
  {
    title: "Your Favorite Hobby",
    description: "Share about a hobby or activity you enjoy doing in your free time.",
    category: "personal",
    difficulty: "beginner",
    estimatedDuration: 2,
    tips: [
      "Explain why you enjoy this hobby",
      "Share when you started doing it",
      "Mention any achievements or milestones",
      "Invite others to try it"
    ]
  },
  {
    title: "A Book That Changed Your Life",
    description: "Talk about a book that had a significant impact on your perspective or life.",
    category: "educational",
    difficulty: "intermediate",
    estimatedDuration: 3,
    tips: [
      "Briefly summarize the book",
      "Explain the key lessons you learned",
      "Share how it changed your thinking",
      "Recommend it to others"
    ]
  },
  {
    title: "Your Dream Vacation",
    description: "Describe your ideal vacation destination and what you would do there.",
    category: "personal",
    difficulty: "beginner",
    estimatedDuration: 2,
    tips: [
      "Describe the location in detail",
      "Explain why you chose this place",
      "List the activities you'd do",
      "Share what makes it special"
    ]
  },
  {
    title: "Overcoming a Challenge",
    description: "Share a personal challenge you faced and how you overcame it.",
    category: "personal",
    difficulty: "intermediate",
    estimatedDuration: 3,
    tips: [
      "Describe the challenge clearly",
      "Explain your initial feelings",
      "Share the steps you took to overcome it",
      "Reflect on what you learned"
    ]
  },
  {
    title: "Your Career Goals",
    description: "Talk about your professional aspirations and where you see yourself in 5 years.",
    category: "professional",
    difficulty: "intermediate",
    estimatedDuration: 3,
    tips: [
      "Be specific about your goals",
      "Explain why these goals matter to you",
      "Share your plan to achieve them",
      "Mention any obstacles you anticipate"
    ]
  },
  {
    title: "A Skill You Want to Learn",
    description: "Discuss a new skill you'd like to acquire and why it interests you.",
    category: "educational",
    difficulty: "beginner",
    estimatedDuration: 2,
    tips: [
      "Explain what the skill is",
      "Share why you want to learn it",
      "Mention how it would benefit you",
      "Describe your learning plan"
    ]
  },
  {
    title: "Your Favorite Childhood Memory",
    description: "Share a cherished memory from your childhood and why it's special to you.",
    category: "personal",
    difficulty: "beginner",
    estimatedDuration: 2,
    tips: [
      "Set the scene with details",
      "Explain who was involved",
      "Share what made it memorable",
      "Reflect on why it's important"
    ]
  },
  {
    title: "Technology and Society",
    description: "Discuss how technology has changed the way we communicate and interact.",
    category: "professional",
    difficulty: "advanced",
    estimatedDuration: 4,
    tips: [
      "Compare past and present communication",
      "Discuss both positive and negative impacts",
      "Share personal experiences",
      "Predict future trends"
    ]
  },
  {
    title: "Your Role Model",
    description: "Talk about someone you admire and what qualities make them special to you.",
    category: "personal",
    difficulty: "intermediate",
    estimatedDuration: 3,
    tips: [
      "Introduce the person",
      "Explain how you know them",
      "List their admirable qualities",
      "Share how they've influenced you"
    ]
  }
];

const rewards = [
  {
    name: "First Steps",
    description: "Upload your first video",
    type: "achievement",
    category: "total_videos",
    requirement: {
      type: "total_videos",
      value: 1
    },
    icon: "🎬",
    color: "#10B981",
    rarity: "common",
    points: 10
  },
  {
    name: "Getting Started",
    description: "Upload 3 videos",
    type: "achievement",
    category: "total_videos",
    requirement: {
      type: "total_videos",
      value: 3
    },
    icon: "🌟",
    color: "#3B82F6",
    rarity: "common",
    points: 25
  },
  {
    name: "Consistent Creator",
    description: "Upload 10 videos",
    type: "achievement",
    category: "total_videos",
    requirement: {
      type: "total_videos",
      value: 10
    },
    icon: "🎯",
    color: "#8B5CF6",
    rarity: "uncommon",
    points: 50
  },
  {
    name: "Dedicated Speaker",
    description: "Upload 25 videos",
    type: "achievement",
    category: "total_videos",
    requirement: {
      type: "total_videos",
      value: 25
    },
    icon: "🏆",
    color: "#F59E0B",
    rarity: "rare",
    points: 100
  },
  {
    name: "Master Communicator",
    description: "Upload 50 videos",
    type: "achievement",
    category: "total_videos",
    requirement: {
      type: "total_videos",
      value: 50
    },
    icon: "👑",
    color: "#EF4444",
    rarity: "epic",
    points: 200
  },
  {
    name: "Daily Dedication",
    description: "Maintain a 3-day streak",
    type: "badge",
    category: "streak",
    requirement: {
      type: "streak_days",
      value: 3
    },
    icon: "🔥",
    color: "#F97316",
    rarity: "common",
    points: 15
  },
  {
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    type: "badge",
    category: "streak",
    requirement: {
      type: "streak_days",
      value: 7
    },
    icon: "⚡",
    color: "#EAB308",
    rarity: "uncommon",
    points: 35
  },
  {
    name: "Streak Master",
    description: "Maintain a 14-day streak",
    type: "badge",
    category: "streak",
    requirement: {
      type: "streak_days",
      value: 14
    },
    icon: "💎",
    color: "#06B6D4",
    rarity: "rare",
    points: 75
  },
  {
    name: "Unstoppable",
    description: "Maintain a 30-day streak",
    type: "badge",
    category: "streak",
    requirement: {
      type: "streak_days",
      value: 30
    },
    icon: "🚀",
    color: "#8B5CF6",
    rarity: "epic",
    points: 150
  },
  {
    name: "Legendary Streak",
    description: "Maintain a 60-day streak",
    type: "badge",
    category: "streak",
    requirement: {
      type: "streak_days",
      value: 60
    },
    icon: "⭐",
    color: "#F59E0B",
    rarity: "legendary",
    points: 300
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shyness-app');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Topic.deleteMany({});
    await Reward.deleteMany({});
    console.log('Cleared existing data');

    // Insert topics
    await Topic.insertMany(topics);
    console.log(`✅ Inserted ${topics.length} topics`);

    // Insert rewards
    await Reward.insertMany(rewards);
    console.log(`✅ Inserted ${rewards.length} rewards`);

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();


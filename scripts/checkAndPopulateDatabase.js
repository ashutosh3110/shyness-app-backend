const mongoose = require('mongoose');
const User = require('../models/User');
const Video = require('../models/Video');
const Topic = require('../models/Topic');
const Reward = require('../models/Reward');

const connectDB = async () => {
  try {
    const mongoUri = 'mongodb+srv://ashutoshbankey21306_db_user:w2YNILqab5xL3mje@cluster0.puchwaz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkAndPopulateDatabase = async () => {
  await connectDB();
  
  try {
    console.log('🔍 Checking database data...');
    
    // Check current data
    const userCount = await User.countDocuments();
    const videoCount = await Video.countDocuments();
    const topicCount = await Topic.countDocuments();
    const rewardCount = await Reward.countDocuments();
    
    console.log('📊 Current database counts:');
    console.log('Users:', userCount);
    console.log('Videos:', videoCount);
    console.log('Topics:', topicCount);
    console.log('Rewards:', rewardCount);
    
    // If no users, create a test user
    if (userCount === 0) {
      console.log('👤 Creating test user...');
      const testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        currentStreak: 5,
        totalVideos: 3,
        longestStreak: 7
      });
      console.log('✅ Test user created:', testUser.email);
    }
    
    // If no topics, create some test topics
    if (topicCount === 0) {
      console.log('📝 Creating test topics...');
      const testTopics = [
        {
          title: 'Your Favorite Childhood Memory',
          description: "Share a cherished memory from your childhood and why it's special to you.",
          category: 'personal',
          difficulty: 'beginner',
          estimatedDuration: 2,
          tips: ['Be specific about details', 'Explain why it was meaningful'],
          isActive: true
        },
        {
          title: 'Overcoming a Challenge',
          description: 'Describe a difficult situation you faced and how you overcame it.',
          category: 'personal',
          difficulty: 'intermediate',
          estimatedDuration: 3,
          tips: ['Focus on the learning process', 'Be honest about struggles'],
          isActive: true
        }
      ];
      
      for (const topicData of testTopics) {
        const topic = await Topic.create(topicData);
        console.log('✅ Topic created:', topic.title);
      }
    }
    
    // If no videos, create some test videos
    if (videoCount === 0) {
      console.log('🎥 Creating test videos...');
      const users = await User.find().limit(1);
      const topics = await Topic.find().limit(2);
      
      if (users.length > 0 && topics.length > 0) {
        const testVideos = [
          {
            title: 'My Childhood Memory',
            description: 'A video about my favorite childhood memory',
            user: users[0]._id,
            topic: topics[0]._id,
            duration: 120,
            views: 10,
            validationStatus: 'valid',
            uploadDate: new Date(),
            format: 'mp4',
            fileSize: 5000000,
            videoUrl: 'https://example.com/video1.mp4',
            cloudinaryId: 'test-video-1',
            thumbnailUrl: 'https://example.com/thumb1.jpg'
          },
          {
            title: 'Overcoming Challenges',
            description: 'How I overcame a difficult situation',
            user: users[0]._id,
            topic: topics[1]._id,
            duration: 180,
            views: 5,
            validationStatus: 'pending',
            uploadDate: new Date(),
            format: 'mp4',
            fileSize: 7500000,
            videoUrl: 'https://example.com/video2.mp4',
            cloudinaryId: 'test-video-2',
            thumbnailUrl: 'https://example.com/thumb2.jpg'
          }
        ];
        
        for (const videoData of testVideos) {
          const video = await Video.create(videoData);
          console.log('✅ Video created:', video.title);
        }
      }
    }
    
    // Final counts
    const finalUserCount = await User.countDocuments();
    const finalVideoCount = await Video.countDocuments();
    const finalTopicCount = await Topic.countDocuments();
    
    console.log('📊 Final database counts:');
    console.log('Users:', finalUserCount);
    console.log('Videos:', finalVideoCount);
    console.log('Topics:', finalTopicCount);
    
    console.log('✅ Database check and population completed!');
    
  } catch (error) {
    console.error('❌ Error checking/populating database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

checkAndPopulateDatabase();

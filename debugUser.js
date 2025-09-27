const mongoose = require('mongoose');
const Video = require('./models/Video');
const User = require('./models/User');

async function debugUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shyness-app');
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`\n👥 All Users in Database:`);
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('---');
    });
    
    // Get all videos with user info
    const videos = await Video.find({})
      .populate('user', 'name email')
      .populate('topic', 'title');
    
    console.log(`\n📹 All Videos in Database:`);
    videos.forEach((video, index) => {
      console.log(`Video ${index + 1}:`);
      console.log(`  ID: ${video._id}`);
      console.log(`  Title: ${video.title}`);
      console.log(`  User ID: ${video.user?._id}`);
      console.log(`  User Name: ${video.user?.name}`);
      console.log(`  User Email: ${video.user?.email}`);
      console.log(`  Topic: ${video.topic?.title || 'Unknown'}`);
      console.log(`  Upload Date: ${video.uploadDate}`);
      console.log('---');
    });
    
    // Check if test user has videos
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      console.log(`\n🔍 Test User Details:`);
      console.log(`  ID: ${testUser._id}`);
      console.log(`  Name: ${testUser.name}`);
      console.log(`  Email: ${testUser.email}`);
      
      const testUserVideos = await Video.find({ user: testUser._id });
      console.log(`\n📹 Test User Videos: ${testUserVideos.length}`);
      testUserVideos.forEach((video, index) => {
        console.log(`  Video ${index + 1}: ${video.title}`);
      });
    } else {
      console.log('\n❌ Test user not found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

debugUser();


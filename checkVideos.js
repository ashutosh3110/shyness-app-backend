const mongoose = require('mongoose');
const Video = require('./models/Video');
const User = require('./models/User');
const Topic = require('./models/Topic');

async function checkVideos() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shyness-app');
    console.log('✅ Connected to MongoDB');
    
    const videos = await Video.find({})
      .populate('user', 'name email')
      .populate('topic', 'title');
    
    console.log(`📊 Total videos in database: ${videos.length}`);
    
    if (videos.length === 0) {
      console.log('❌ No videos found in database');
    } else {
      videos.forEach((video, index) => {
        console.log(`\n📹 Video ${index + 1}:`);
        console.log(`  ID: ${video._id}`);
        console.log(`  Title: ${video.title}`);
        console.log(`  User: ${video.user?.name || 'Unknown'}`);
        console.log(`  Topic: ${video.topic?.title || 'Unknown'}`);
        console.log(`  Upload Date: ${video.uploadDate}`);
        console.log(`  Video URL: ${video.videoUrl}`);
        console.log(`  Duration: ${video.duration} seconds`);
        console.log(`  File Size: ${video.fileSize} bytes`);
      });
    }
    
    // Check users
    const users = await User.find({});
    console.log(`\n👥 Total users in database: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`User ${index + 1}: ${user.name} (${user.email})`);
    });
    
    // Check topics
    const topics = await Topic.find({});
    console.log(`\n📚 Total topics in database: ${topics.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkVideos();


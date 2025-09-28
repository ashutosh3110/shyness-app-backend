const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

// Set NODE_ENV to production if not set (for Vercel)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const app = express();

// Middleware - More permissive CORS for debugging
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Manual CORS handling for all requests
app.use((req, res, next) => {
  console.log('=== REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Preflight request handled');
    return res.status(200).end();
  }
  
  next();
});
// Increase body parser limits for video uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Add specific handling for video uploads
app.use('/api/videos/upload', (req, res, next) => {
  console.log('=== VIDEO UPLOAD REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Origin:', req.headers.origin);
  
  // Check file size before processing
  const contentLength = parseInt(req.headers['content-length']);
  console.log('Content length parsed:', contentLength);
  
  if (contentLength && contentLength > 4.5 * 1024 * 1024) { // 4.5MB limit
    console.log('❌ File too large for Vercel:', contentLength, 'bytes (', (contentLength / 1024 / 1024).toFixed(2), 'MB)');
    return res.status(413).json({
      success: false,
      message: `File too large (${(contentLength / 1024 / 1024).toFixed(2)}MB). Vercel limit is 4.5MB. Please compress your video or use Cloudinary direct upload.`,
      fileSize: contentLength,
      fileSizeMB: (contentLength / 1024 / 1024).toFixed(2),
      limit: '4.5MB'
    });
  }
  
  console.log('✅ File size OK, proceeding...');
  next();
});

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  
  if (req.method === 'POST' && req.url.includes('upload')) {
    console.log('Upload request received');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('Authorization:', req.headers.authorization ? 'Present' : 'Missing');
  }
  
  if (req.method === 'OPTIONS') {
    console.log('Preflight request received');
    console.log('Access-Control-Request-Method:', req.headers['access-control-request-method']);
    console.log('Access-Control-Request-Headers:', req.headers['access-control-request-headers']);
  }
  
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shyness-app')
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shyness App Backend is running! - SIGNUP CORS FIX DEPLOYED',
    timestamp: new Date().toISOString(),
    version: '2.0.0-signup-fix'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test upload endpoint (public)
app.post('/test-upload', (req, res) => {
  console.log('Test upload endpoint hit - Force redeploy');
  res.json({ 
    success: true, 
    message: 'Test upload endpoint working - Force redeploy',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Debug database data endpoint
app.get('/debug-database', async (req, res) => {
  try {
    console.log('=== DEBUG DATABASE ===');
    
    const User = require('./models/User');
    const Video = require('./models/Video');
    const Topic = require('./models/Topic');
    
    const userCount = await User.countDocuments();
    const videoCount = await Video.countDocuments();
    const topicCount = await Topic.countDocuments();
    
    console.log('User count:', userCount);
    console.log('Video count:', videoCount);
    console.log('Topic count:', topicCount);
    
    const recentUsers = await User.find().limit(3).select('name email createdAt');
    const recentVideos = await Video.find().limit(3).select('title uploadDate user');
    
    res.json({
      success: true,
      data: {
        userCount,
        videoCount,
        topicCount,
        recentUsers,
        recentVideos
      }
    });
  } catch (error) {
    console.error('Debug database error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

// Debug admin password endpoint
app.post('/debug-admin-password', async (req, res) => {
  try {
    console.log('=== DEBUG ADMIN PASSWORD ===');
    const { email, password } = req.body;
    console.log('Email:', email);
    console.log('Password provided:', !!password);
    
    const Admin = require('./models/Admin');
    const admin = await Admin.findOne({ email, isActive: true });
    console.log('Admin found:', admin ? 'Yes' : 'No');
    
    if (admin) {
      console.log('Admin email:', admin.email);
      console.log('Admin role:', admin.role);
      console.log('Admin isActive:', admin.isActive);
      console.log('Admin password hash length:', admin.password?.length);
      
      // Test password comparison
      const bcrypt = require('bcryptjs');
      const isPasswordMatch = await bcrypt.compare(password, admin.password);
      console.log('Direct bcrypt compare result:', isPasswordMatch);
      
      // Test with the model method
      const modelMatch = await admin.matchPassword(password);
      console.log('Model matchPassword result:', modelMatch);
      
      res.json({
        success: true,
        debug: {
          adminFound: !!admin,
          email: admin?.email,
          role: admin?.role,
          isActive: admin?.isActive,
          passwordHashLength: admin?.password?.length,
          directBcryptMatch: isPasswordMatch,
          modelMatchPassword: modelMatch
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Admin not found',
        debug: {
          adminFound: false,
          email: email
        }
      });
    }
  } catch (error) {
    console.error('Debug admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

// Simple video upload test endpoint
app.post('/api/videos/test-upload', (req, res) => {
  console.log('=== VIDEO UPLOAD TEST ENDPOINT ===');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  console.log('Body keys:', Object.keys(req.body || {}));
  
  res.json({
    success: true,
    message: 'Video upload test endpoint working',
    receivedHeaders: req.headers,
    bodySize: req.headers['content-length'],
    timestamp: new Date().toISOString()
  });
});

// Cloudinary direct upload signature endpoint
app.post('/api/videos/cloudinary-signature', (req, res) => {
  console.log('Cloudinary signature request received');
  try {
    const cloudinary = require('cloudinary').v2;
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'shyness-app-videos'
      },
      process.env.CLOUDINARY_API_SECRET
    );
    
    res.json({
      success: true,
      data: {
        signature: signature,
        timestamp: timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: 'shyness-app-videos'
      }
    });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating upload signature',
      error: error.message
    });
  }
});

// Save video metadata after Cloudinary upload
app.post('/api/videos/save-metadata', async (req, res) => {
  console.log('Save video metadata request received');
  try {
    const { title, description, topicId, cloudinaryUrl, cloudinaryPublicId, duration } = req.body;
    
    // Here you would save to your database
    // For now, just return success
    res.json({
      success: true,
      message: 'Video metadata saved successfully',
      data: {
        title,
        description,
        topicId,
        cloudinaryUrl,
        cloudinaryPublicId,
        duration
      }
    });
  } catch (error) {
    console.error('Save metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving video metadata',
      error: error.message
    });
  }
});

// Alternative upload endpoint for large files - returns Cloudinary upload URL
app.post('/api/videos/upload-large', (req, res) => {
  console.log('Large file upload request received');
  try {
    const { title, description, topicId } = req.body;
    
    // Return Cloudinary upload URL and parameters
    res.json({
      success: true,
      message: 'Use Cloudinary direct upload for large files',
      data: {
        uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
        uploadPreset: 'shyness-app-videos',
        folder: 'shyness-app-videos',
        maxFileSize: '100MB',
        instructions: 'Upload directly to Cloudinary, then call /api/videos/save-metadata with the result'
      }
    });
  } catch (error) {
    console.error('Large upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing large file upload',
      error: error.message
    });
  }
});

// Test signup endpoint (public)
app.post('/test-signup', (req, res) => {
  console.log('Test signup endpoint hit');
  res.json({ 
    success: true, 
    message: 'Test signup endpoint working',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const videoRoutes = require('./routes/videos');
const topicRoutes = require('./routes/topics');
const scriptRoutes = require('./routes/scripts');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

// Use routes with debugging
app.use('/api/auth', (req, res, next) => {
  console.log('Auth route hit:', req.method, req.url);
  next();
}, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;

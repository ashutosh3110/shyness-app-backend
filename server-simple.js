const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ashutoshbankey21306_db_user:w2YNILqab5xL3mje@cluster0.puchwaz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Script Schema
const scriptSchema = new mongoose.Schema({
  title: String,
  category: String,
  topic: String,
  description: String,
  content: String,
  duration: Number,
  difficulty: String,
  tags: [String],
  isActive: Boolean,
  downloadCount: Number,
  createdBy: mongoose.Schema.Types.ObjectId,
  lastModified: Date,
  createdAt: Date,
  updatedAt: Date
});

const Script = mongoose.model('Script', scriptSchema);

// CORS configuration - More permissive for debugging
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
  console.log('Headers:', req.headers);
  
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

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shyness App Backend is running! - SIMPLE VERSION FOR DEPLOYMENT',
    timestamp: new Date().toISOString(),
    version: '3.0.0-simple'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test signup endpoint
app.post('/test-signup', (req, res) => {
  console.log('Test signup endpoint hit');
  res.json({ 
    success: true, 
    message: 'Test signup endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Simple signup endpoint
app.post('/api/auth/signup', (req, res) => {
  console.log('=== SIGNUP REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Origin:', req.headers.origin);
  console.log('Body:', req.body);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  res.json({
    success: true,
    message: 'User registered successfully',
    data: {
      token: 'test-token-123',
      user: {
        id: 'test-user-id',
        name: req.body.name,
        email: req.body.email,
        role: 'user',
        currentStreak: 0,
        totalVideos: 0
      }
    }
  });
});

// Simple login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login endpoint hit:', req.body);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token: 'test-token-123',
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: req.body.email,
        role: 'user',
        currentStreak: 0,
        totalVideos: 0
      }
    }
  });
});

// Dashboard endpoint
app.get('/api/users/dashboard', (req, res) => {
  console.log('Dashboard endpoint hit');
  res.json({
    success: true,
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        currentStreak: 5,
        totalVideos: 3,
        paymentInfo: {
          preferredMethod: 'upi',
          isPaymentInfoComplete: false,
          isVerified: false
        }
      },
      stats: {
        totalVideos: 3,
        currentStreak: 5,
        longestStreak: 10,
        totalMinutes: 45
      }
    }
  });
});

// User profile endpoint
app.get('/api/auth/me', (req, res) => {
  console.log('Get me endpoint hit');
  res.json({
    success: true,
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        currentStreak: 5,
        totalVideos: 3,
        paymentInfo: {
          preferredMethod: 'upi',
          isPaymentInfoComplete: false,
          isVerified: false
        }
      }
    }
  });
});

// User stats endpoint
app.get('/api/users/stats', (req, res) => {
  console.log('Stats endpoint hit');
  res.json({
    success: true,
    data: {
      totalVideos: 3,
      currentStreak: 5,
      longestStreak: 10,
      totalMinutes: 45
    }
  });
});

// User streak endpoint
app.get('/api/users/streak', (req, res) => {
  console.log('Streak endpoint hit');
  res.json({
    success: true,
    data: {
      currentStreak: 5,
      longestStreak: 10
    }
  });
});

// User rewards endpoint
app.get('/api/users/rewards', (req, res) => {
  console.log('Rewards endpoint hit');
  res.json({
    success: true,
    data: {
      rewards: [
        { id: 1, name: 'First Video', earned: true },
        { id: 2, name: 'Week Streak', earned: false }
      ]
    }
  });
});

// Script categories endpoint
app.get('/api/scripts/categories', async (req, res) => {
  console.log('Script categories endpoint hit');
  try {
    // Get unique categories from MongoDB
    const categories = await Script.aggregate([
      { $match: { isActive: true } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        name: { $first: '$category' }
      }},
      { $sort: { name: 1 } }
    ]);
    
    // Map categories to frontend format
    const categoryMap = {
      'professional': { name: 'Professional', icon: '💼', description: 'Professional development scripts' },
      'personal': { name: 'Personal Growth', icon: '🌱', description: 'Personal development scripts' },
      'educational': { name: 'Educational', icon: '📚', description: 'Educational and learning scripts' },
      'social': { name: 'Social Skills', icon: '👥', description: 'Social interaction scripts' },
      'creative': { name: 'Creative', icon: '🎨', description: 'Creative expression scripts' },
      'motivational': { name: 'Motivational', icon: '💪', description: 'Motivational and inspirational scripts' }
    };
    
    const formattedCategories = categories.map(cat => ({
      _id: cat._id,
      name: categoryMap[cat._id]?.name || cat._id,
      description: categoryMap[cat._id]?.description || `Scripts for ${cat._id}`,
      icon: categoryMap[cat._id]?.icon || '📝',
      scriptCount: cat.count
    }));
    
    console.log('Returning categories:', formattedCategories.length);
    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.json({
      success: false,
      message: 'Error fetching categories',
      data: []
    });
  }
});

// Scripts by category endpoint
app.get('/api/scripts/category/:categoryId', async (req, res) => {
  console.log('Scripts by category endpoint hit:', req.params.categoryId);
  const categoryId = req.params.categoryId;
  
  try {
    let scripts;
    
    // Handle undefined categoryId by returning all scripts
    if (categoryId === 'undefined' || !categoryId) {
      console.log('Undefined categoryId, returning all scripts from MongoDB');
      scripts = await Script.find({ isActive: true }).select('title description duration difficulty category topic').limit(20);
    } else {
      console.log('Fetching scripts for category:', categoryId);
      scripts = await Script.find({ category: categoryId, isActive: true }).select('title description duration difficulty category topic').limit(20);
    }
    
    // Format scripts for frontend
    const formattedScripts = scripts.map(script => ({
      _id: script._id.toString(),
      title: script.title,
      description: script.description,
      duration: `${script.duration} minutes`,
      difficulty: script.difficulty,
      category: script.category,
      topic: script.topic
    }));
    
    console.log('Returning scripts:', formattedScripts.length, 'scripts');
    res.json({
      success: true,
      data: formattedScripts
    });
  } catch (error) {
    console.error('Error fetching scripts:', error);
    res.json({
      success: false,
      message: 'Error fetching scripts',
      data: []
    });
});

// Individual script endpoint
app.get('/api/scripts/:scriptId', async (req, res) => {
  console.log('Individual script endpoint hit:', req.params.scriptId);
  try {
    const script = await Script.findById(req.params.scriptId);
    if (!script) {
      return res.json({
        success: false,
        message: 'Script not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      data: {
        _id: script._id.toString(),
        title: script.title,
        content: script.content,
        description: script.description,
        duration: `${script.duration} minutes`,
        difficulty: script.difficulty,
        category: script.category,
        topic: script.topic,
        tags: script.tags
      }
    });
  } catch (error) {
    console.error('Error fetching script:', error);
    res.json({
      success: false,
      message: 'Error fetching script',
      data: null
    });
  }
});

// Search scripts endpoint
app.get('/api/scripts/search', (req, res) => {
  console.log('Search scripts endpoint hit:', req.query);
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'Introduction Speech',
        description: 'Practice introducing yourself confidently',
        category: 'Public Speaking'
      }
    ]
  });
});

// Catch-all for any script requests
app.get('/api/scripts/*', (req, res) => {
  console.log('Catch-all script endpoint hit:', req.url);
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'Introduction Speech',
        description: 'Practice introducing yourself confidently',
        duration: '2-3 minutes',
        difficulty: 'Beginner',
        category: 'Public Speaking'
      },
      {
        _id: '2',
        title: 'Thank You Speech',
        description: 'Practice giving thank you speeches',
        duration: '1-2 minutes',
        difficulty: 'Beginner',
        category: 'Public Speaking'
      }
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
});

module.exports = app;

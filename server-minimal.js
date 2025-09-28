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
  console.log('Video upload request received');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  console.log('User-Agent:', req.headers['user-agent']);
  
  // Check file size before processing
  const contentLength = parseInt(req.headers['content-length']);
  if (contentLength && contentLength > 4.5 * 1024 * 1024) { // 4.5MB limit
    console.log('File too large for Vercel:', contentLength, 'bytes');
    return res.status(413).json({
      success: false,
      message: 'File too large. Please use a file smaller than 4.5MB or use direct upload to Cloudinary.'
    });
  }
  
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

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
});

module.exports = app;

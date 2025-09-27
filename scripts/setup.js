const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create necessary directories (only in development)
const createDirectories = () => {
  // Skip directory creation in production (Vercel)
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ Skipping directory creation in production environment');
    return;
  }

  const dirs = [
    path.join(__dirname, '../temp'),
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../logs')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (error) {
        console.warn(`⚠️ Could not create directory ${dir}:`, error.message);
      }
    }
  });
};

// Check environment variables
const checkEnvironment = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env file');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
};

// Test database connection
const testDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connection successful');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Main setup function
const setup = async () => {
  console.log('🚀 Setting up Shyness App backend...\n');
  
  createDirectories();
  checkEnvironment();
  await testDatabase();
  
  console.log('\n✅ Setup completed successfully!');
  console.log('You can now run: npm run dev');
};

setup().catch(console.error);


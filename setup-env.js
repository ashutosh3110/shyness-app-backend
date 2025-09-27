const fs = require('fs');
const path = require('path');

const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shyness-app
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration (replace with your actual credentials)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# File Upload Limits
MAX_FILE_SIZE=104857600
ALLOWED_VIDEO_TYPES=mp4,webm,mov

# Video Validation
MIN_VIDEO_DURATION=30`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
  console.log('⚠️  Please update the Cloudinary credentials in backend/.env');
} else {
  console.log('✅ .env file already exists');
}


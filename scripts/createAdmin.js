const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shyness-app');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createAdmin = async () => {
  await connectDB();

  try {
    const adminEmail = 'admin@shynessapp.com';
    const adminPassword = 'admin123456';

    let admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      console.log('Admin already exists.');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
    } else {
      admin = await Admin.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'super-admin',
        permissions: {
          canManageUsers: true,
          canManageVideos: true,
          canManagePayments: true,
          canViewAnalytics: true
        }
      });
      console.log('✅ Admin created successfully!');
      console.log('Email:', admin.email);
      console.log('Password:', adminPassword);
      console.log('Role:', admin.role);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createAdmin();


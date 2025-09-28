const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Use the Atlas connection string
    const mongoUri = 'mongodb+srv://ashutoshbankey21306_db_user:w2YNILqab5xL3mje@cluster0.puchwaz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
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


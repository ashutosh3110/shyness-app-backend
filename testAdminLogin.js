const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = 'mongodb+srv://ashutoshbankey21306_db_user:w2YNILqab5xL3mje@cluster0.puchwaz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testAdminLogin = async () => {
  await connectDB();

  try {
    const adminEmail = 'admin@shynessapp.com';
    const adminPassword = 'admin123456';

    console.log('🔍 Testing admin login...');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

    // Find admin
    const admin = await Admin.findOne({ email: adminEmail, isActive: true });
    console.log('Admin found:', admin ? 'Yes' : 'No');
    
    if (admin) {
      console.log('Admin details:');
      console.log('- Email:', admin.email);
      console.log('- Role:', admin.role);
      console.log('- IsActive:', admin.isActive);
      console.log('- Has password:', !!admin.password);
      
      // Test password
      const isPasswordMatch = await admin.matchPassword(adminPassword);
      console.log('Password match:', isPasswordMatch);
      
      if (isPasswordMatch) {
        console.log('✅ Admin login test PASSED');
      } else {
        console.log('❌ Admin login test FAILED - Password mismatch');
      }
    } else {
      console.log('❌ Admin not found');
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

testAdminLogin();
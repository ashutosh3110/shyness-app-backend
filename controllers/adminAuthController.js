const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
exports.adminLogin = asyncHandler(async (req, res) => {
  console.log('=== ADMIN LOGIN REQUEST ===');
  console.log('Email:', req.body.email);
  console.log('Password provided:', !!req.body.password);
  
  const { email, password } = req.body;

  // Check if admin exists
  const admin = await Admin.findOne({ email, isActive: true });
  console.log('Admin found:', admin ? 'Yes' : 'No');
  console.log('Admin email:', admin?.email);
  console.log('Admin role:', admin?.role);
  console.log('Admin isActive:', admin?.isActive);
  
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }

  // Check password
  const isPasswordMatch = await admin.matchPassword(password);
  console.log('Password match:', isPasswordMatch);
  
  if (!isPasswordMatch) {
    console.log('❌ Password mismatch');
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }
  
  console.log('✅ Admin login successful');

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: admin._id,
      email: admin.email,
      role: admin.role,
      type: 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );

  res.status(200).json({
    success: true,
    data: {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    }
  });
});

// @desc    Get admin profile
// @route   GET /api/admin/auth/me
// @access  Private/Admin
exports.getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-password');
  
  res.status(200).json({
    success: true,
    data: admin
  });
});

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private/Admin
exports.updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  
  const admin = await Admin.findById(req.admin.id);
  
  if (name) admin.name = name;
  if (email) admin.email = email;
  
  await admin.save();
  
  res.status(200).json({
    success: true,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    }
  });
});

// @desc    Change admin password
// @route   PUT /api/admin/auth/password
// @access  Private/Admin
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const admin = await Admin.findById(req.admin.id);
  
  // Check current password
  const isCurrentPasswordValid = await admin.matchPassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }
  
  // Update password
  admin.password = newPassword;
  await admin.save();
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});


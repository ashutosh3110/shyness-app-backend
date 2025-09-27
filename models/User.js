const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalVideos: {
    type: Number,
    default: 0
  },
  rewards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward'
  }],
  lastUploadDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  },
  // Payment Information
  paymentInfo: {
    type: {
      // Bank Account Details
      bankAccount: {
        type: {
          accountHolderName: {
            type: String,
            trim: true,
            default: ''
          },
          accountNumber: {
            type: String,
            trim: true,
            default: ''
          },
          bankName: {
            type: String,
            trim: true,
            default: ''
          },
          ifscCode: {
            type: String,
            trim: true,
            default: ''
          },
          branchName: {
            type: String,
            trim: true,
            default: ''
          }
        },
        default: {}
      },
      // UPI Details
      upi: {
        type: {
          upiId: {
            type: String,
            trim: true,
            default: ''
          },
          upiName: {
            type: String,
            trim: true,
            default: ''
          }
        },
        default: {}
      },
      // PayPal Details
      paypal: {
        type: {
          paypalEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: ''
          },
          paypalName: {
            type: String,
            trim: true,
            default: ''
          }
        },
        default: {}
      },
      // Digital Wallet Details
      wallet: {
        type: {
          walletType: {
            type: String,
            enum: ['phonepe', 'googlepay', 'paytm', 'amazonpay', 'other', ''],
            trim: true,
            default: ''
          },
          walletNumber: {
            type: String,
            trim: true,
            default: ''
          },
          walletName: {
            type: String,
            trim: true,
            default: ''
          }
        },
        default: {}
      },
      // Preferred Payment Method
      preferredMethod: {
        type: String,
        enum: ['bank_account', 'upi', 'paypal', 'wallet'],
        default: 'upi'
      },
      // Payment Information Status
      isPaymentInfoComplete: {
        type: Boolean,
        default: false
      },
      // Verification Status
      isVerified: {
        type: Boolean,
        default: false
      },
      // Last Updated
      lastUpdated: {
        type: Date,
        default: () => new Date()
      }
    },
    default: {
      preferredMethod: 'upi',
      isPaymentInfoComplete: false,
      isVerified: false,
      lastUpdated: new Date(),
      bankAccount: {},
      upi: {},
      paypal: {},
      wallet: {}
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak method
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (!this.lastUploadDate) {
    this.currentStreak = 1;
  } else {
    const lastUpload = new Date(this.lastUploadDate);
    const daysDiff = Math.floor((today - lastUpload) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.currentStreak += 1;
    } else if (daysDiff > 1) {
      this.currentStreak = 1;
    }
  }
  
  this.lastUploadDate = today;
  this.totalVideos += 1;
  
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  return this.save();
};

// Method to update payment information
userSchema.methods.updatePaymentInfo = function(paymentData) {
  this.paymentInfo = { ...this.paymentInfo, ...paymentData };
  this.paymentInfo.lastUpdated = new Date();
  
  // Check if payment info is complete
  this.paymentInfo.isPaymentInfoComplete = this.checkPaymentInfoComplete();
  
  return this.save();
};

// Method to check if payment information is complete
userSchema.methods.checkPaymentInfoComplete = function() {
  const { preferredMethod, bankAccount, upi, paypal, wallet } = this.paymentInfo;
  
  switch (preferredMethod) {
    case 'bank_account':
      return !!(bankAccount.accountHolderName && bankAccount.accountNumber && 
                bankAccount.bankName && bankAccount.ifscCode);
    case 'upi':
      return !!(upi.upiId && upi.upiName);
    case 'paypal':
      return !!(paypal.paypalEmail && paypal.paypalName);
    case 'wallet':
      return !!(wallet.walletType && wallet.walletNumber && wallet.walletName);
    default:
      return false;
  }
};

// Method to get payment display info (masked)
userSchema.methods.getPaymentDisplayInfo = function() {
  const { preferredMethod, bankAccount, upi, paypal, wallet } = this.paymentInfo;
  
  switch (preferredMethod) {
    case 'bank_account':
      return {
        method: 'Bank Account',
        display: `${bankAccount.bankName} - ****${bankAccount.accountNumber.slice(-4)}`,
        accountHolder: bankAccount.accountHolderName
      };
    case 'upi':
      return {
        method: 'UPI',
        display: upi.upiId,
        name: upi.upiName
      };
    case 'paypal':
      return {
        method: 'PayPal',
        display: paypal.paypalEmail,
        name: paypal.paypalName
      };
    case 'wallet':
      return {
        method: wallet.walletType.charAt(0).toUpperCase() + wallet.walletType.slice(1),
        display: `****${wallet.walletNumber.slice(-4)}`,
        name: wallet.walletName
      };
    default:
      return null;
  }
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);


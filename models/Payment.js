const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'upi', 'wallet'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'manual'],
    default: 'manual'
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  streakDays: {
    type: Number,
    required: true,
    min: 10
  },
  eligibleForPayment: {
    type: Boolean,
    default: true
  },
  paymentReason: {
    type: String,
    enum: ['streak_reward', 'premium_upgrade', 'subscription', 'bonus'],
    default: 'streak_reward'
  },
  adminNotes: {
    type: String,
    maxlength: 500
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  processedAt: {
    type: Date
  },
  dueDate: {
    type: Date,
    required: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ dueDate: 1, status: 1 });

// Virtual for payment status display
paymentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Payment',
    'completed': 'Payment Completed',
    'failed': 'Payment Failed',
    'cancelled': 'Payment Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Method to check if payment is overdue
paymentSchema.methods.isOverdue = function() {
  return this.status === 'pending' && new Date() > this.dueDate;
};

// Method to get days until due
paymentSchema.methods.getDaysUntilDue = function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

module.exports = mongoose.model('Payment', paymentSchema);

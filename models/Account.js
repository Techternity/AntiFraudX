import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: [true, 'Please provide an account number'],
    unique: true,
    trim: true,
    index: true
  },
  numberOfAccounts: {
    type: Number,
    default: 1
  },
  reasonOfOpeningAccount: {
    type: String,
    trim: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  trust_score: {
    type: Number,
    default: 100
  },
  risk_level: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
    default: 'LOW',
    index: true
  },
  transactionCount: {
    type: Number,
    default: 0
  },
  firstTransactionDate: {
    type: Date,
    default: Date.now
  },
  lastTransactionDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update timestamps
AccountSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for common query patterns
AccountSchema.index({ accountNumber: 1 });
AccountSchema.index({ totalAmount: 1 });
AccountSchema.index({ risk_level: 1 });
AccountSchema.index({ trust_score: 1 });
AccountSchema.index({ createdAt: 1 });

const Account = mongoose.model('accounts', AccountSchema);

export default Account; 
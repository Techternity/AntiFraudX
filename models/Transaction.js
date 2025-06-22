import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: [true, 'Please provide an account number'],
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
  transactionAmount: {
    type: Number,
    required: [true, 'Please provide a transaction amount']
  },
  totalAmount: {
    type: Number,
    default: function() {
      return this.transactionAmount;
    }
  },
  transactionDate: {
    type: Date,
    required: [true, 'Please provide a transaction date'],
    default: Date.now,
    index: true
  },
  risk_analysis: {
    risk_level: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'LOW',
      index: true
    },
    score_label: {
      type: String,
      default: 'Standard'
    },
    trust_score: {
      type: Number,
      default: 100
    }
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FLAGGED', 'REJECTED'],
    default: 'COMPLETED',
    index: true
  },
  flags: {
    isAnomalous: {
      type: Boolean,
      default: false
    },
    reasonForFlag: {
      type: String,
      default: ''
    }
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
TransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create compound indexes for common query patterns
TransactionSchema.index({ accountNumber: 1, transactionDate: 1 });
TransactionSchema.index({ accountNumber: 1, 'risk_analysis.risk_level': 1 });
TransactionSchema.index({ transactionDate: 1, 'risk_analysis.risk_level': 1 });
TransactionSchema.index({ createdAt: 1 });

const Transaction = mongoose.model('transactions', TransactionSchema);

export default Transaction;
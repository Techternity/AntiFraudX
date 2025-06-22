import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection.db;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

// Test data with multiple transactions for the same account
const testTransactions = [
  {
    accountNumber: "ACC001",
    numberOfAccounts: 2,
    reasonOfOpeningAccount: "Business",
    transactionAmount: 1000,
    transactionDate: new Date("2024-01-15"),
    risk_analysis: {
      risk_level: "LOW",
      score_label: "Standard",
      trust_score: 95
    }
  },
  {
    accountNumber: "ACC001", // Same account number
    numberOfAccounts: 2,
    reasonOfOpeningAccount: "Business",
    transactionAmount: 500,
    transactionDate: new Date("2024-01-16"),
    risk_analysis: {
      risk_level: "MODERATE",
      score_label: "Standard",
      trust_score: 85
    }
  },
  {
    accountNumber: "ACC002",
    numberOfAccounts: 1,
    reasonOfOpeningAccount: "Personal",
    transactionAmount: 750,
    transactionDate: new Date("2024-01-17"),
    risk_analysis: {
      risk_level: "HIGH",
      score_label: "High Risk",
      trust_score: 60
    }
  },
  {
    accountNumber: "ACC003",
    numberOfAccounts: 3,
    reasonOfOpeningAccount: "Investment",
    transactionAmount: 2000,
    transactionDate: new Date("2024-01-18"),
    risk_analysis: {
      risk_level: "LOW",
      score_label: "Premium",
      trust_score: 98
    }
  }
];

async function testUpload() {
  try {
    console.log('Starting upload test...');
    
    // Clear existing data
    await Transaction.deleteMany({});
    await Account.deleteMany({});
    console.log('Cleared existing data');
    
    // Simulate the upload process
    const session = await mongoose.startSession();
    session.startTransaction();
    
    let uploadedCount = 0;
    let accountsUpdated = 0;
    
    for (const tx of testTransactions) {
      // Create transaction record
      await Transaction.create([{
        accountNumber: tx.accountNumber,
        numberOfAccounts: tx.numberOfAccounts,
        reasonOfOpeningAccount: tx.reasonOfOpeningAccount,
        transactionAmount: tx.transactionAmount,
        transactionDate: tx.transactionDate,
        risk_analysis: {
          risk_level: tx.risk_analysis.risk_level,
          score_label: tx.risk_analysis.score_label,
          trust_score: tx.risk_analysis.trust_score
        }
      }], { session });
      uploadedCount++;
      
      // Handle account aggregation
      const existingAccount = await Account.findOne({ accountNumber: tx.accountNumber }).session(session);
      
      if (existingAccount) {
        // Update existing account - add to total amount (credit)
        existingAccount.totalAmount += tx.transactionAmount;
        existingAccount.transactionCount += 1;
        existingAccount.lastTransactionDate = tx.transactionDate;
        
        // Update trust score and risk level if provided
        if (tx.risk_analysis.trust_score !== undefined) {
          existingAccount.trust_score = tx.risk_analysis.trust_score;
        }
        if (tx.risk_analysis.risk_level) {
          existingAccount.risk_level = tx.risk_analysis.risk_level;
        }
        
        await existingAccount.save({ session });
        accountsUpdated++;
      } else {
        // Create new account record
        const newAccount = {
          accountNumber: tx.accountNumber,
          numberOfAccounts: tx.numberOfAccounts,
          reasonOfOpeningAccount: tx.reasonOfOpeningAccount,
          totalAmount: tx.transactionAmount,
          trust_score: tx.risk_analysis.trust_score,
          risk_level: tx.risk_analysis.risk_level,
          transactionCount: 1,
          firstTransactionDate: tx.transactionDate,
          lastTransactionDate: tx.transactionDate
        };
        
        await Account.create([newAccount], { session });
        accountsUpdated++;
      }
    }
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    console.log(`✅ Upload test completed successfully!`);
    console.log(`📊 Uploaded ${uploadedCount} transactions`);
    console.log(`🏦 Updated ${accountsUpdated} accounts`);
    
    // Verify the results
    const transactions = await Transaction.find().sort({ transactionDate: 1 });
    const accounts = await Account.find().sort({ accountNumber: 1 });
    
    console.log('\n📋 Transaction Records:');
    transactions.forEach(tx => {
      console.log(`  - ${tx.accountNumber}: $${tx.transactionAmount} (${tx.risk_analysis.risk_level})`);
    });
    
    console.log('\n🏦 Account Records:');
    accounts.forEach(acc => {
      console.log(`  - ${acc.accountNumber}: Total $${acc.totalAmount}, ${acc.transactionCount} transactions, Trust Score: ${acc.trust_score}`);
    });
    
    // Verify aggregation
    const acc001 = accounts.find(a => a.accountNumber === 'ACC001');
    if (acc001 && acc001.totalAmount === 1500) {
      console.log('\n✅ Account aggregation working correctly: ACC001 total = $1500 (1000 + 500)');
    } else {
      console.log('\n❌ Account aggregation failed: ACC001 total should be $1500');
    }
    
  } catch (error) {
    console.error('❌ Upload test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testUpload(); 
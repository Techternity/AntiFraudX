import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import mongoose from 'mongoose';

// @desc    Upload transactions (Test version - no auth required)
// @route   POST /api/transactions/upload-test
// @access  Public
export const uploadTransactionsTest = async (req, res) => {
  console.log('Upload transactions test endpoint called');
  console.log('Request body:', req.body);
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { transactions } = req.body;
    
    // Log request details for debugging
    console.log(`Received ${transactions?.length || 0} transactions for upload`);
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Please provide an array of transactions.'
      });
    }
    
    let uploadedCount = 0;
    let accountsUpdated = 0;
    
    // Process transactions
    for (const tx of transactions) {
      // Validate transaction data
      if (!tx.accountNumber || tx.transactionAmount === undefined) {
        console.warn('Skipping invalid transaction:', tx);
        continue;
      }
      
      // Format transaction data - all amounts are credit types
      const formattedTransaction = {
        accountNumber: tx.accountNumber,
        numberOfAccounts: Number(tx.numberOfAccounts) || 1,
        reasonOfOpeningAccount: tx.reasonOfOpeningAccount || '',
        transactionAmount: Number(tx.transactionAmount), // Credit amount
        transactionDate: new Date(tx.transactionDate),
        risk_analysis: {
          risk_level: tx.risk_analysis?.risk_level || 'LOW',
          score_label: tx.risk_analysis?.score_label || 'Standard',
          trust_score: tx.risk_analysis?.trust_score || 100
        }
      };
      
      // Create transaction record
      await Transaction.create([formattedTransaction], { session });
      uploadedCount++;
      
      // Handle account aggregation
      const existingAccount = await Account.findOne({ accountNumber: tx.accountNumber }).session(session);
      
      if (existingAccount) {
        // Update existing account - add to total amount (credit)
        existingAccount.totalAmount += formattedTransaction.transactionAmount;
        existingAccount.transactionCount += 1;
        existingAccount.lastTransactionDate = formattedTransaction.transactionDate;
        
        // Update trust score and risk level if provided
        if (tx.risk_analysis?.trust_score !== undefined) {
          existingAccount.trust_score = tx.risk_analysis.trust_score;
        }
        if (tx.risk_analysis?.risk_level) {
          existingAccount.risk_level = tx.risk_analysis.risk_level;
        }
        
        await existingAccount.save({ session });
        accountsUpdated++;
      } else {
        // Create new account record
        const newAccount = {
          accountNumber: tx.accountNumber,
          numberOfAccounts: formattedTransaction.numberOfAccounts,
          reasonOfOpeningAccount: formattedTransaction.reasonOfOpeningAccount,
          totalAmount: formattedTransaction.transactionAmount, // Initial total
          trust_score: formattedTransaction.risk_analysis.trust_score,
          risk_level: formattedTransaction.risk_analysis.risk_level,
          transactionCount: 1,
          firstTransactionDate: formattedTransaction.transactionDate,
          lastTransactionDate: formattedTransaction.transactionDate
        };
        
        await Account.create([newAccount], { session });
        accountsUpdated++;
      }
    }
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      uploadedCount,
      accountsUpdated,
      message: `Successfully uploaded ${uploadedCount} transactions and updated ${accountsUpdated} accounts`
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error uploading transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during transaction upload'
    });
  }
};

// @desc    Upload transactions
// @route   POST /api/transactions/upload
// @access  Private
export const uploadTransactions = async (req, res) => {
  console.log('Upload transactions endpoint called');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  console.log('Authenticated user:', req.user);
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { transactions } = req.body;
    
    // Log request details for debugging
    console.log(`Received ${transactions?.length || 0} transactions for upload`);
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Please provide an array of transactions.'
      });
    }
    
    let uploadedCount = 0;
    let accountsUpdated = 0;
    
    // Process transactions
    for (const tx of transactions) {
      // Validate transaction data
      if (!tx.accountNumber || tx.transactionAmount === undefined) {
        console.warn('Skipping invalid transaction:', tx);
        continue;
      }
      
      // Format transaction data - all amounts are credit types
      const formattedTransaction = {
        accountNumber: tx.accountNumber,
        numberOfAccounts: Number(tx.numberOfAccounts) || 1,
        reasonOfOpeningAccount: tx.reasonOfOpeningAccount || '',
        transactionAmount: Number(tx.transactionAmount), // Credit amount
        transactionDate: new Date(tx.transactionDate),
        risk_analysis: {
          risk_level: tx.risk_analysis?.risk_level || 'LOW',
          score_label: tx.risk_analysis?.score_label || 'Standard',
          trust_score: tx.risk_analysis?.trust_score || 100
        }
      };
      
      // Create transaction record
      await Transaction.create([formattedTransaction], { session });
      uploadedCount++;
      
      // Handle account aggregation
      const existingAccount = await Account.findOne({ accountNumber: tx.accountNumber }).session(session);
      
      if (existingAccount) {
        // Update existing account - add to total amount (credit)
        existingAccount.totalAmount += formattedTransaction.transactionAmount;
        existingAccount.transactionCount += 1;
        existingAccount.lastTransactionDate = formattedTransaction.transactionDate;
        
        // Update trust score and risk level if provided
        if (tx.risk_analysis?.trust_score !== undefined) {
          existingAccount.trust_score = tx.risk_analysis.trust_score;
        }
        if (tx.risk_analysis?.risk_level) {
          existingAccount.risk_level = tx.risk_analysis.risk_level;
        }
        
        await existingAccount.save({ session });
        accountsUpdated++;
      } else {
        // Create new account record
        const newAccount = {
          accountNumber: tx.accountNumber,
          numberOfAccounts: formattedTransaction.numberOfAccounts,
          reasonOfOpeningAccount: formattedTransaction.reasonOfOpeningAccount,
          totalAmount: formattedTransaction.transactionAmount, // Initial total
          trust_score: formattedTransaction.risk_analysis.trust_score,
          risk_level: formattedTransaction.risk_analysis.risk_level,
          transactionCount: 1,
          firstTransactionDate: formattedTransaction.transactionDate,
          lastTransactionDate: formattedTransaction.transactionDate
        };
        
        await Account.create([newAccount], { session });
        accountsUpdated++;
      }
    }
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      uploadedCount,
      accountsUpdated,
      message: `Successfully uploaded ${uploadedCount} transactions and updated ${accountsUpdated} accounts`
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error uploading transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during transaction upload'
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ transactionDate: -1 });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get transactions for a specific account
// @route   GET /api/transactions/:accountNumber
// @access  Private
export const getAccountTransactions = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    
    const transactions = await Transaction.find({ accountNumber })
      .sort({ transactionDate: -1 });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error getting account transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all accounts with aggregated data
// @route   GET /api/transactions/accounts
// @access  Private
export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().sort({ totalAmount: -1 });
    
    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get account details by account number
// @route   GET /api/transactions/accounts/:accountNumber
// @access  Private
export const getAccountDetails = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    
    const account = await Account.findOne({ accountNumber });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Get all transactions for this account
    const transactions = await Transaction.find({ accountNumber })
      .sort({ transactionDate: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        account,
        transactions,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    console.error('Error getting account details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Debug API Test
// @route   GET /api/transactions/debug
// @access  Public
export const debugApi = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      headers: req.headers,
      path: req.originalUrl
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
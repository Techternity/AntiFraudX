import Transaction from '../models/Transaction.js';

// @desc    Upload transactions (simplified version)
// @route   POST /api/transactions/simple-upload
// @access  Public
export const uploadTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;
    
    console.log('Simple transaction controller: Upload called');
    console.log(`Received ${transactions?.length || 0} transactions`);
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Please provide an array of transactions.'
      });
    }
    
    // Process transactions without using MongoDB sessions
    const savedTransactions = [];
    let totalProcessed = 0;
    
    // Process each transaction individually
    for (const tx of transactions) {
      try {
        // Skip invalid transactions
        if (!tx.accountNumber || tx.transactionAmount === undefined) {
          console.warn('Skipping invalid transaction:', tx);
          continue;
        }
        
        // Format the transaction
        const formattedTransaction = {
          accountNumber: tx.accountNumber,
          numberOfAccounts: Number(tx.numberOfAccounts) || 1,
          reasonOfOpeningAccount: tx.reasonOfOpeningAccount || '',
          transactionAmount: Number(tx.transactionAmount),
          transactionDate: new Date(tx.transactionDate),
          risk_analysis: tx.risk_analysis || {
            risk_level: 'LOW',
            score_label: 'Default',
            trust_score: 100
          }
        };
        
        // Check for existing account and update total if needed
        const existingAccount = await Transaction.findOne({ accountNumber: tx.accountNumber });
        
        if (existingAccount) {
          formattedTransaction.totalAmount = existingAccount.totalAmount + formattedTransaction.transactionAmount;
          // Update the existing account's total amount
          await Transaction.updateOne(
            { accountNumber: tx.accountNumber },
            { $set: { totalAmount: formattedTransaction.totalAmount } }
          );
        } else {
          formattedTransaction.totalAmount = formattedTransaction.transactionAmount;
        }
        
        // Create new transaction record
        const newTransaction = new Transaction(formattedTransaction);
        const savedTransaction = await newTransaction.save();
        
        savedTransactions.push(savedTransaction);
        totalProcessed++;
      } catch (err) {
        console.error('Error processing individual transaction:', err);
        // Continue with next transaction even if this one failed
      }
    }
    
    res.status(200).json({
      success: true,
      uploadedCount: totalProcessed,
      message: `Successfully uploaded ${totalProcessed} transactions`
    });
  } catch (error) {
    console.error('Error uploading transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during transaction upload'
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions/simple
// @access  Public
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
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

/**
 * Uploads multiple transactions to the database with optimized performance
 * Implements bulk operations and proper error handling
 * @route POST /api/transactions/bulk-upload
 * @access Public
 */
export const bulkUploadTransactions = async (req, res) => {
  // Start a session for transaction integrity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transactions } = req.body;
    
    console.log(`Received bulk upload request with ${transactions?.length || 0} transactions`);
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data: Please provide an array of transactions'
      });
    }

    // Format and validate all transactions first
    const formattedTransactions = [];
    const accountTotals = new Map(); // For tracking account totals
    
    // First pass - validate and format data
    for (const tx of transactions) {
      try {
        // Basic validation
        if (!tx.accountNumber || tx.transactionAmount === undefined) {
          console.warn('Skipping invalid transaction:', tx);
          continue;
        }
        
        // Standardize and format data
        const formattedTransaction = {
          accountNumber: tx.accountNumber,
          numberOfAccounts: Number(tx.numberOfAccounts) || 1,
          reasonOfOpeningAccount: tx.reasonOfOpeningAccount || '',
          transactionAmount: Number(tx.transactionAmount),
          transactionDate: new Date(tx.transactionDate || Date.now()),
          risk_analysis: {
            risk_level: tx.risk_analysis?.risk_level || 'LOW',
            score_label: tx.risk_analysis?.score_label || 'Standard',
            trust_score: Number(tx.risk_analysis?.trust_score) || 100
          },
          // Add status based on risk level
          status: tx.risk_analysis?.risk_level === 'HIGH' || tx.risk_analysis?.risk_level === 'CRITICAL' ? 'FLAGGED' : 'COMPLETED',
          flags: {
            isAnomalous: tx.risk_analysis?.risk_level === 'CRITICAL',
            reasonForFlag: tx.risk_analysis?.risk_level === 'CRITICAL' ? 'Critical risk score detected' : ''
          }
        };
        
        // Track running totals for each account
        if (!accountTotals.has(tx.accountNumber)) {
          accountTotals.set(tx.accountNumber, 0);
        }
        accountTotals.set(
          tx.accountNumber, 
          accountTotals.get(tx.accountNumber) + formattedTransaction.transactionAmount
        );
        
        formattedTransactions.push(formattedTransaction);
      } catch (error) {
        console.error('Error processing transaction:', error, tx);
        // Continue with next transaction
      }
    }

    // If no valid transactions remain after validation
    if (formattedTransactions.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'No valid transactions found in the provided data'
      });
    }
    
    console.log(`Processed ${formattedTransactions.length} valid transactions`);

    // Second pass - bulk update account totals first
    const accountsToUpdate = [];
    for (const [accountNumber, totalAmount] of accountTotals.entries()) {
      accountsToUpdate.push({
        updateOne: {
          filter: { accountNumber },
          update: { $inc: { totalAmount: totalAmount } },
          upsert: true
        }
      });
    }
    
    // Execute bulk update for account totals if there are updates
    if (accountsToUpdate.length > 0) {
      console.log(`Updating total amounts for ${accountsToUpdate.length} accounts`);
      await Transaction.bulkWrite(accountsToUpdate, { session });
    }

    // Third pass - add transaction records
    // Set the totalAmount field for each transaction based on running totals
    const operations = formattedTransactions.map(tx => {
      return { 
        insertOne: { 
          document: {
            ...tx,
            totalAmount: accountTotals.get(tx.accountNumber)
          } 
        } 
      };
    });

    // Execute bulk insert for all transactions
    console.log(`Inserting ${operations.length} transactions`);
    const bulkResult = await Transaction.bulkWrite(operations, { session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Prepare response
    return res.status(200).json({
      success: true,
      uploadedCount: formattedTransactions.length,
      message: `Successfully uploaded ${formattedTransactions.length} transactions`,
      details: {
        insertedCount: bulkResult.insertedCount || formattedTransactions.length,
        modifiedAccountsCount: accountsToUpdate.length,
        failedTransactions: transactions.length - formattedTransactions.length
      }
    });
  } catch (error) {
    // Roll back transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error in bulk upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during transaction upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get transactions with filtering options
 * @route GET /api/transactions
 * @access Public
 */
export const getTransactions = async (req, res) => {
  try {
    const {
      accountNumber,
      startDate,
      endDate,
      riskLevel,
      minAmount,
      maxAmount,
      status,
      page = 1,
      limit = 100,
      sortBy = 'transactionDate',
      sortDirection = 'desc'
    } = req.query;

    // Build query object
    const query = {};
    
    if (accountNumber) query.accountNumber = accountNumber;
    if (riskLevel) query['risk_analysis.risk_level'] = riskLevel;
    if (status) query.status = status;
    
    // Date range
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }
    
    // Amount range
    if (minAmount || maxAmount) {
      query.transactionAmount = {};
      if (minAmount) query.transactionAmount.$gte = Number(minAmount);
      if (maxAmount) query.transactionAmount.$lte = Number(maxAmount);
    }
    
    // Sort configuration
    const sort = {};
    sort[sortBy] = sortDirection === 'asc' ? 1 : -1;
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Run query with pagination
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination info
    const total = await Transaction.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get transaction statistics
 * @route GET /api/transactions/stats
 * @access Public
 */
export const getTransactionStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $facet: {
          // Total transaction count
          totalCount: [
            { $count: 'count' }
          ],
          
          // Total transaction amount
          totalAmount: [
            { $group: { _id: null, total: { $sum: '$transactionAmount' } } }
          ],
          
          // Breakdown by risk level
          riskLevelBreakdown: [
            { $group: { 
              _id: '$risk_analysis.risk_level', 
              count: { $sum: 1 },
              amount: { $sum: '$transactionAmount' }
            }},
            { $sort: { count: -1 } }
          ],
          
          // Breakdown by status
          statusBreakdown: [
            { $group: { 
              _id: '$status', 
              count: { $sum: 1 }
            }},
            { $sort: { count: -1 } }
          ],
          
          // Trend by date (last 30 days)
          recentTrend: [
            { $match: { 
              transactionDate: { 
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
              } 
            }},
            { $group: { 
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
              count: { $sum: 1 },
              amount: { $sum: '$transactionAmount' }
            }},
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        totalTransactions: stats[0].totalCount[0]?.count || 0,
        totalAmount: stats[0].totalAmount[0]?.total || 0,
        riskLevelBreakdown: stats[0].riskLevelBreakdown || [],
        statusBreakdown: stats[0].statusBreakdown || [],
        recentTrend: stats[0].recentTrend || []
      }
    });
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching transaction statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
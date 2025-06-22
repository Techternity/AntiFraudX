import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import readline from 'readline';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Create interface for command line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate sample transactions for testing
function generateSampleTransactions(count = 10) {
  const transactions = [];
  const riskLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
  const accountPrefixes = ['ACCT', 'CARD', 'LOAN', 'SAVE'];
  const reasons = [
    'Business Account', 
    'Personal Account', 
    'Investment', 
    'Savings Account', 
    'Credit Account'
  ];
  
  for (let i = 0; i < count; i++) {
    // Create a somewhat realistic account number
    const prefix = accountPrefixes[Math.floor(Math.random() * accountPrefixes.length)];
    const accountNumber = `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Calculate a date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Generate random transaction amount between 100 and 10000
    const transactionAmount = Math.floor(100 + Math.random() * 9900);
    
    // Assign risk level - weight towards lower risk
    const riskIndex = Math.floor(Math.random() * Math.random() * riskLevels.length);
    const riskLevel = riskLevels[riskIndex];
    
    // Generate trust score inversely related to risk
    const trustScore = 100 - (riskIndex * 25 + Math.floor(Math.random() * 10));
    
    transactions.push({
      accountNumber,
      numberOfAccounts: Math.floor(1 + Math.random() * 3),
      reasonOfOpeningAccount: reasons[Math.floor(Math.random() * reasons.length)],
      transactionAmount,
      transactionDate: date.toISOString(),
      risk_analysis: {
        risk_level: riskLevel,
        score_label: riskLevel === 'LOW' ? 'Safe' : 
                    riskLevel === 'MODERATE' ? 'Caution' : 
                    riskLevel === 'HIGH' ? 'Warning' : 'Danger',
        trust_score: trustScore
      }
    });
  }
  
  return transactions;
}

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

// Function to count existing transactions
async function getTransactionCount(db) {
  try {
    const count = await db.collection('transactions').countDocuments({});
    return count;
  } catch (error) {
    console.error('Error counting transactions:', error);
    return -1;
  }
}

// Function to test the transaction upload API
async function testTransactionUpload() {
  try {
    // Connect to database
    const db = await connectDB();
    
    // Count existing transactions
    const existingCount = await getTransactionCount(db);
    console.log(`Current transaction count: ${existingCount}`);
    
    // Ask user for number of transactions to generate
    rl.question('How many transactions do you want to generate and upload? ', async (answer) => {
      const count = parseInt(answer) || 10;
      
      console.log(`Generating ${count} sample transactions...`);
      const transactions = generateSampleTransactions(count);
      
      console.log('Sample transaction:', transactions[0]);
      
      // Confirm with user
      rl.question('Do you want to upload these transactions to the database? (y/n) ', async (answer) => {
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          console.log('Upload cancelled.');
          rl.close();
          await mongoose.connection.close();
          process.exit(0);
        }
        
        try {
          console.log('Uploading transactions...');
          
          // Upload to the optimized endpoint
          const response = await fetch('http://localhost:5000/api/optimized-transactions/public/bulk-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transactions }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            console.log('Upload successful!');
            console.log(data);
            
            // Verify by counting transactions again
            const newCount = await getTransactionCount(db);
            console.log(`New transaction count: ${newCount}`);
            console.log(`Difference: ${newCount - existingCount}`);
          } else {
            console.error('Upload failed:');
            console.error(data);
          }
        } catch (error) {
          console.error('Error during upload:', error);
        }
        
        rl.close();
        await mongoose.connection.close();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the test script
testTransactionUpload();
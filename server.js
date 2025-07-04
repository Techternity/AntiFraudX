import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for large transaction uploads
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(join(__dirname, 'public')));

// Routes
import authRoutes from './routes/authRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import userRoutes from './routes/userRoutes.js';
import testRoutes from './routes/testRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import directRoutes from './routes/directRoutes.js';
import simpleTransactionRoutes from './routes/simpleTransactionRoutes.js';
import optimizedTransactionRoutes from './routes/optimizedTransactionRoutes.js';

// Simple health check endpoint that doesn't require auth
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Direct transaction upload endpoint without any auth
app.post('/api/direct-upload', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    console.log('Direct upload endpoint called');
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Please provide an array of transactions.'
      });
    }
    
    console.log(`Direct upload: Received ${transactions.length} transactions`);
    
    // Just return success without actually saving to database
    return res.json({
      success: true,
      uploadedCount: transactions.length,
      message: `Successfully processed ${transactions.length} transactions (simulation)`
    });
  } catch (error) {
    console.error('Error in direct upload:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/users', userRoutes);
app.use('/api/test', testRoutes);
// Make sure the transaction routes are registered and log it
console.log('Registering transaction routes at /api/transactions');
app.use('/api/transactions', transactionRoutes);

// Register direct routes without auth middleware
console.log('Registering direct routes at /api/direct');
app.use('/api/direct', directRoutes);

// Register simplified transaction routes
console.log('Registering simple transaction routes at /api/simple-transactions');
app.use('/api/simple-transactions', simpleTransactionRoutes);

// Register optimized transaction routes
console.log('Registering optimized transaction routes at /api/optimized-transactions');
app.use('/api/optimized-transactions', optimizedTransactionRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('FraudShield API is running');
});

// Debug route to check API functionality
app.get('/api/debug', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test page available at: http://localhost:${PORT}/test-upload.html`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
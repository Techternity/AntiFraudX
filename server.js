import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Routes
import authRoutes from './routes/authRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import userRoutes from './routes/userRoutes.js';
import testRoutes from './routes/testRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/users', userRoutes);
app.use('/api/test', testRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('AntiFraudX API is running');
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
import express from 'express';
import { 
  bulkUploadTransactions,
  getTransactions,
  getTransactionStats
} from '../controllers/optimizedTransactionController.js';
import { protect } from '../middleware/enhancedAuthMiddleware.js';

const router = express.Router();

// Public routes for testing
router.post('/public/bulk-upload', bulkUploadTransactions);
router.get('/public', getTransactions);
router.get('/public/stats', getTransactionStats);

// Protected routes for production use
router.post('/bulk-upload', protect, bulkUploadTransactions);
router.get('/', protect, getTransactions);
router.get('/stats', protect, getTransactionStats);

export default router;
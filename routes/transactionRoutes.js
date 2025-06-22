import express from 'express';
import { 
  uploadTransactions, 
  uploadTransactionsTest,
  getTransactions, 
  getAccountTransactions,
  getAccounts,
  getAccountDetails,
  debugApi
} from '../controllers/transactionController.js';
import { protect } from '../middleware/enhancedAuthMiddleware.js';

const router = express.Router();

// Public debug route
router.get('/debug', debugApi);

// Add an unprotected version of the upload endpoint for testing
router.post('/upload-test', uploadTransactionsTest);

// Protected routes
router.post('/upload', protect, uploadTransactions);
router.get('/', protect, getTransactions);
router.get('/accounts', protect, getAccounts);
router.get('/accounts/:accountNumber', protect, getAccountDetails);
router.get('/:accountNumber', protect, getAccountTransactions);

export default router;
import express from 'express';
import { 
  uploadTransactions, 
  getTransactions 
} from '../controllers/simpleTransactionController.js';

const router = express.Router();

// All routes are public for easy testing
router.post('/upload', uploadTransactions);
router.get('/', getTransactions);

export default router;
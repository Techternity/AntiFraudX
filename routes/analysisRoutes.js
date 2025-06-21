import express from 'express';
import { createAnalysis, getAnalyses, getAnalysisById } from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createAnalysis);
router.get('/', protect, getAnalyses);
router.get('/:id', protect, getAnalysisById);

export default router;
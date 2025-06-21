import express from 'express';
import { uploadCsv, getCsvFiles, getCsvFileById } from '../controllers/csvController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

// Set up multer for file uploads (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protect, upload.single('csvFile'), uploadCsv);
router.get('/', protect, getCsvFiles);
router.get('/:id', protect, getCsvFileById);

export default router;
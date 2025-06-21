import express from 'express';
import { registerUser, loginUser, getUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route to verify endpoint is reachable
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working correctly' });
});

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/', protect, getUsers);

export default router;
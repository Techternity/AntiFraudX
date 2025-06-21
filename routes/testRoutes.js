import express from 'express';

const router = express.Router();

// Test endpoint with user details
router.post('/auth-test', (req, res) => {
  const { email, password, role } = req.body;
  
  console.log('Auth test received:', { email, password, role });
  
  // Always respond with success and consistent format
  return res.json({
    success: true,
    user: {
      _id: '685708f9fe01e95dccd31835',
      name: 'Test User',
      username: 'testuser',
      email: email || 'test@example.com',
      role: role || 'Bank Manager',
      organization: 'Test Bank',
    },
    token: 'test-token-12345'
  });
});

// Basic test endpoint
router.get('/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

export default router;
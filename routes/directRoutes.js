import express from 'express';

const router = express.Router();

// Simple echo API that just returns what was sent to it
router.post('/echo', (req, res) => {
  console.log('Echo API called with body:', req.body);
  res.json({
    success: true,
    message: 'Echo successful',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// Upload simulation endpoint
router.post('/upload', (req, res) => {
  try {
    console.log('Simple upload endpoint called');
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Please provide an array of transactions.'
      });
    }
    
    console.log(`Simple upload: Received ${transactions.length} transactions`);
    console.log('First transaction:', transactions[0]);
    
    return res.json({
      success: true,
      uploadedCount: transactions.length,
      message: `Successfully received ${transactions.length} transactions`
    });
  } catch (error) {
    console.error('Error in simple upload:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

export default router;
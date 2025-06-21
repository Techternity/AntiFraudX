import Analysis from '../models/Analysis.js';
import CsvData from '../models/CsvData.js';

// @desc    Create a new analysis
// @route   POST /api/analysis
// @access  Private
export const createAnalysis = async (req, res) => {
  try {
    const { csvDataId, name, description, parameters } = req.body;

    // Check if CSV data exists and belongs to user
    const csvData = await CsvData.findOne({ 
      _id: csvDataId,
      userId: req.user._id
    });

    if (!csvData) {
      return res.status(404).json({ success: false, message: 'CSV data not found' });
    }

    // Create a placeholder for the analysis
    const analysis = await Analysis.create({
      userId: req.user._id,
      csvDataId,
      name,
      description,
      parameters,
      results: { status: 'processing' }
    });

    // In a real application, you would trigger your analysis here
    // This is a simplified example that just creates a placeholder
    
    // For demo purposes, let's update with sample results
    setTimeout(async () => {
      await Analysis.findByIdAndUpdate(analysis._id, {
        results: { 
          status: 'completed',
          summary: 'Analysis completed successfully',
          metrics: {
            anomalyCount: 5,
            confidenceScore: 0.87
          }
        }
      });
    }, 2000);

    res.status(201).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all analyses for a user
// @route   GET /api/analysis
// @access  Private
export const getAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .select('name description createdAt results.status')
      .populate({
        path: 'csvDataId',
        select: 'fileName'
      });

    res.json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get analysis by ID
// @route   GET /api/analysis/:id
// @access  Private
export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate({
      path: 'csvDataId',
      select: 'fileName headers'
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
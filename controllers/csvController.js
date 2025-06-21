import CsvData from '../models/CsvData.js';
import csvtojson from 'csvtojson';

// @desc    Upload CSV data
// @route   POST /api/csv/upload
// @access  Private
export const uploadCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }    // Parse CSV file
    const jsonArray = await csvtojson().fromString(req.file.buffer.toString());
    
    // Extract headers from first row
    const headers = Object.keys(jsonArray[0]);

    // Create new CSV data entry
    const csvData = await CsvData.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      data: jsonArray,
      headers: headers
    });

    res.status(201).json({
      success: true,
      data: {
        _id: csvData._id,
        fileName: csvData.fileName,
        headers: csvData.headers,
        rowCount: jsonArray.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all CSV files for a user
// @route   GET /api/csv
// @access  Private
export const getCsvFiles = async (req, res) => {
  try {
    const csvFiles = await CsvData.find({ userId: req.user._id })
      .select('fileName uploadedAt headers');

    res.json({
      success: true,
      count: csvFiles.length,
      data: csvFiles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get CSV file data by ID
// @route   GET /api/csv/:id
// @access  Private
export const getCsvFileById = async (req, res) => {
  try {
    const csvFile = await CsvData.findOne({ 
      _id: req.params.id,
      userId: req.user._id
    });

    if (!csvFile) {
      return res.status(404).json({ success: false, message: 'CSV file not found' });
    }

    res.json({
      success: true,
      data: csvFile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
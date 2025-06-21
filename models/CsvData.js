import mongoose from 'mongoose';

const CsvDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  // This is a flexible schema to store any type of CSV data
  // We'll store the actual CSV data as an array of objects
  data: [mongoose.Schema.Types.Mixed],
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  // Store column headers separately for easy access
  headers: [String]
});

const CsvData = mongoose.model('CsvData', CsvDataSchema);

export default CsvData;
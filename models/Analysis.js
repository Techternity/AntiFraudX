import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  csvDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CsvData',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  // Store analysis results - flexible schema to accommodate different types of analyses
  results: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  },
  parameters: mongoose.Schema.Types.Mixed
});

const Analysis = mongoose.model('Analysis', AnalysisSchema);

export default Analysis;
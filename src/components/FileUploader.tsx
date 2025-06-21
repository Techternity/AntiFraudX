import React, { useState, useRef, DragEvent } from 'react';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  disabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    setError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type (CSV)
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Transaction Data</h3>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept=".csv"
          disabled={disabled}
        />
        
        <Upload className="mx-auto text-gray-400 mb-3" size={32} />
        
        <h4 className="text-base font-medium text-gray-700 mb-1">
          {selectedFile ? selectedFile.name : 'Drag and drop your CSV file here'}
        </h4>
        
        <p className="text-sm text-gray-500">
          {selectedFile 
            ? `${(selectedFile.size / 1024).toFixed(2)} KB` 
            : 'or click to browse (CSV files only, max 5MB)'
          }
        </p>
        
        {error && (
          <div className="flex items-center mt-4 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-600">
            <AlertCircle className="mr-2" size={16} />
            {error}
          </div>
        )}
        
        {selectedFile && !error && (
          <div className="flex items-center mt-4 p-2 bg-green-50 border border-green-100 rounded text-sm text-green-600">
            <CheckCircle className="mr-2" size={16} />
            File ready to upload
          </div>
        )}
      </div>
      
      <div className="mt-6 text-right">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || disabled}
          className={`px-5 py-2 rounded-lg ${
            !selectedFile || disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {disabled ? 'Processing...' : 'Process Transactions'}
        </button>
      </div>
    </div>
  );
};